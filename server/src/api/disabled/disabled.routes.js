const express = require('express');

const controller = require('./disabled.controller');
const middlewares = require('./disabled.middlewares');

const router = express.Router();

router.post('/', middlewares.validateDate(), controller.list);
router.put('/', middlewares.validateDate(), controller.insertDate);
router.delete('/', middlewares.validateDates, controller.deleteDate);

module.exports = router;
