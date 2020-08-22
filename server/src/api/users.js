const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');

const db = require('../db/connection');

const users = db.get('users');

const router = express.Router();

const schema = Joi.object({
  username: Joi.string().pattern(new RegExp('^[a-zA-Z0-9_-]+$')).min(5).max(30),
  password: Joi.string().trim().pattern(new RegExp('^\\S*$')).pattern(new RegExp('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,30}$')),
  role: Joi.string().valid('user', 'admin'),
  active: Joi.bool(),
});

router.get('/', async (req, res, next) => {
  try {
    const result = await users.find({}, { fields: { password: 0 } });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  const { id: _id } = req.params;
  try {
    const result = schema.validate(req.body);
    if (!result.error) {
      const query = { _id };
      const user = await users.findOne(query);
      if (user) {
        const updatedUser = req.body;
        if (updatedUser.password) {
          updatedUser.password = await bcrypt.hash(updatedUser.password.trim(), 12);
        }
        const result = await users.findOneAndUpdate(query, {
          $set: updatedUser,
        });
        delete result.password;
        res.json(result);
      } else {
        next();
      }
    } else {
      res.status(422);
      throw new Error(result.error);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
