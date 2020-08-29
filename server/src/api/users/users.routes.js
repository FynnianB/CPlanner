const express = require('express');

const controller = require('./users.controller');
const middlewares = require('./users.middlewares');

const router = express.Router();

router.get('/', controller.list);
router.patch('/:id',
  middlewares.validateUser(),
  middlewares.findUserById('User not found'),
  controller.patchUser);

module.exports = router;
