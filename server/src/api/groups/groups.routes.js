const express = require('express');

const router = express.Router();

const controller = require('./groups.controller');
const middlewares = require('./groups.middlewares');

const createErr = 'Grouptitle already exists. Choose another one';
const delErr = 'Group doesnt exists';

router.get('/', controller.list);
router.get('/:groupId',
  middlewares.validateId,
  middlewares.isInGroup((user) => user),
  controller.getItem);
router.post('/',
  middlewares.validateCreatableGroup(),
  middlewares.findGroup(createErr, (group) => !group, 409),
  controller.createGroup);
router.put('/:groupId',
  middlewares.validateGroupState(),
  controller.updateGroup);
router.post('/:groupId',
  middlewares.validateUsername,
  middlewares.validateUserAndGroup,
  middlewares.isGroupModerator,
  middlewares.isUserInGroup((user) => !user, 'User already in group', false),
  controller.inviteUser);
router.patch('/:groupId/:userId',
  middlewares.validateRoleOrDelete(),
  middlewares.findGroupById(delErr, (group) => group, 409),
  middlewares.isGroupAdmin,
  middlewares.isParamNotGroupAdmin,
  middlewares.isUserInGroup((user) => user),
  controller.updateUser);
router.delete('/:groupId',
  middlewares.findGroupById(delErr, (group) => group, 409),
  middlewares.isGroupAdmin,
  controller.deleteGroup);

module.exports = router;
