const express = require('express');

const controller = require('./notifications.controller');
const middlewares = require('./notifications.middlewares');

const router = express.Router();

router.get('/', middlewares.validateInputs, controller.list);
router.get('/:noteId', middlewares.validateId, controller.getItem);
router.patch('/', middlewares.validate, middlewares.noteExists, controller.patchNote);
router.post('/', middlewares.validateAnswer, middlewares.isInviteCreator, controller.answerNote);

module.exports = router;
