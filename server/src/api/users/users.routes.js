const express = require('express');

const controller = require('./users.controller');
const middlewares = require('./users.middlewares');

const user = express.Router();

user.get('/:userId', middlewares.validateId, controller.getItem);
user.patch('/', middlewares.validateUser(), controller.patchUser);

const users = express.Router();

users.patch('/:userId',
  middlewares.validateUser(),
  middlewares.findUserById('User not found'),
  controller.patchUserAsAdmin);

module.exports = { users, user };
