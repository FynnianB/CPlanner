const express = require('express');

const controller = require('./calendars.controller');
const middlewares = require('./calendars.middlewares');

const router = express.Router();

router.post('/', middlewares.validateDateZone(), controller.list);
router.get('/:dateId', middlewares.validateId, controller.getItem);
router.put('/', middlewares.validateDate(), middlewares.formatDates, controller.insertDate);
router.patch('/:dateId',
  middlewares.validateId,
  middlewares.dateExists,
  middlewares.groupExists,
  middlewares.validatePatchableDate(),
  middlewares.isDateCreator,
  middlewares.formatDates,
  controller.patchDate);
router.delete('/:dateId',
  middlewares.validateId,
  middlewares.dateExists,
  middlewares.groupExists,
  middlewares.isDateCreator,
  controller.deleteDate);

module.exports = router;
