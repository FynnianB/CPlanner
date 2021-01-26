const db = require('../../db/connection');

const groups = db.get('groups');
const users = db.get('users');
const userGroups = db.get('userGroups');
const userInvites = db.get('userInvites');
const invites = db.get('invites');
const dates = db.get('dates');
const notifications = db.get('notifications');
const groupInvites = db.get('groupInvites');
const disabled = db.get('disabled');

module.exports = {
  groups,
  users,
  userInvites,
  userGroups,
  invites,
  dates,
  notifications,
  groupInvites,
  disabled,
};
