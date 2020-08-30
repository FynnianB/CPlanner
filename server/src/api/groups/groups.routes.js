const express = require('express');

const router = express.Router();

const controller = require('./groups.controller');
const middlewares = require('./groups.middlewares');

const createErr = 'Grouptitle already exists. Choose another one';
const delErr = 'Group doesnt exists';

router.get('/', controller.list);
router.post('/',
  middlewares.validateCreatableGroup(),
  middlewares.findGroup(createErr, (group) => group, 409),
  controller.createGroup);
router.put('/:groupId',
  middlewares.validateGroupState(),
  controller.changeGroup);
router.patch('/:groupId/:userId',
  middlewares.validateUpdatedUser(),
  middlewares.isGroupAdmin,
  middlewares.isParamGroupAdmin,
  middlewares.findGroupById(delErr, (group) => !group, 409),
  middlewares.isUserInGroup,
  controller.updateUser);
router.delete('/:groupId',
  middlewares.isGroupAdmin,
  middlewares.findGroupById(delErr, (group) => !group, 409),
  controller.deleteGroup);

module.exports = router;
