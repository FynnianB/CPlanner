const express = require('express');

const controller = require('./invites.controller');
const middlewares = require('./invites.middlewares');

const router = express.Router();

router.get('/', controller.list);
router.get('/:inviteId', middlewares.validateId, middlewares.inviteExists, controller.getItem);
router.post('/', middlewares.validateInserts, middlewares.existsInputs, middlewares.userAllowed, controller.insertInvite);
router.post('/:inviteId', middlewares.validateAnswer, middlewares.inviteExists, controller.answerInvite);

module.exports = router;
