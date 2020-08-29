const express = require('express');

const controller = require('./notes.controller');
const middlewares = require('./notes.middlewares');

const router = express.Router();

router.get('/', controller.list);
router.post('/', middlewares.validateNote(), controller.insertNote);

module.exports = router;
