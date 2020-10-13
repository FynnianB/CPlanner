const express = require('express');

const controller = require('./auth.controller');
const middlewares = require('./auth.middlewares');

const router = express.Router();

const signupErr = 'That username is already taken. Please choose another one';
const defLoginErr = 'Unable to login!';

router.post('/signup',
  middlewares.validateUser(),
  middlewares.findUser(signupErr, (user) => user, 409),
  controller.signup);
router.post('/login',
  middlewares.validateUser(defLoginErr),
  middlewares.findUser(defLoginErr, (user) => !(user && user.active)),
  controller.login);

module.exports = router;
