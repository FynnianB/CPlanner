const express = require('express');

const controller = require('./calendars.controller');
const middlewares = require('./calendars.middlewares');

const router = express.Router();

router.get('/', controller.list);
router.post('/', middlewares.validateDate(), controller.insertDate);

module.exports = router;
