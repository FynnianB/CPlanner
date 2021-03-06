const db = require('../../db/connection');

const groups = db.get('groups');
const userGroups = db.get('userGroups');
const users = db.get('users');
const groupInvites = db.get('groupInvites');
const notifications = db.get('notifications');

module.exports = {
  groups,
  userGroups,
  users,
  groupInvites,
  notifications,
};
