const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('../db/connection');
const users = db.get('users');
users.createIndex('username', {
  unique: true
});

const router = express.Router();

const schema = Joi.object({
  username: Joi.string().pattern(new RegExp('^[a-zA-Z0-9_-]+$')).min(6).max(30).required(),
  password: Joi.string().trim().pattern(new RegExp('^\\S*$')).pattern(new RegExp('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,30}$')).required(),
});

function createTokenSendResponse(user, res, next){
  const payload = {
    _id: user._id,
    username: user.username
  };
  jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '1d' }, (err, token) => {
    if(err) {
      respondError422(res, next);
    } else {
      res.json({ token });
    }
  });
}

router.get('/', (req, res) => {
  res.json({
    message: 'key'
  })
});

router.post('/signup', (req, res, next) => {
  const result = schema.validate({
    username: req.body.username,
    password: req.body.password
  });
  if (result.error === undefined) {
    users.findOne({
      username: req.body.username
    }).then(user => {
      if (user) {
        const err = new Error('That username is already taken. Please choose another one')
        res.status(409);
        next(err);
      } else {
        bcrypt.hash(req.body.password.trim(), 15).then(hashedPassword => {
          const newUser = {
            username: req.body.username,
            password: hashedPassword
          }
          users.insert(newUser).then(insertedUser => {
            //automatically logging in
            createTokenSendResponse(insertedUser, res, next);
          });
        });
      }
    });
  } else {
    res.status(422);
    next(result.error);
  }
});

function respondError422(res, next) {
  res.status(422);
  const error = new Error('Unable to login!');
  next(error);
}

router.post('/login', (req, res, next) => {
  const result = schema.validate({
    username: req.body.username,
    password: req.body.password
  });
  if (result.error === undefined) {
    users.findOne({
      username: req.body.username
    }).then((user) => {
      if (user) {
        bcrypt.compare(req.body.password, user.password).then((result) => {
          if (result) {
            createTokenSendResponse(user, res, next);
          } else {
            respondError422(res, next);
          }
        });
      } else {
        respondError422(res, next);
      }
    })
  } else {
    respondError422(res, next);
  }
});

module.exports = router;