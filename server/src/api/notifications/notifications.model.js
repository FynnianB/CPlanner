const db = require('../../db/connection');

const notifications = db.get('notifications');
const invites = db.get('invites');
const userGroups = db.get('userGroups');
const dates = db.get('dates');
const groups = db.get('groups');

module.exports = {
  notifications,
  invites,
  userGroups,
  dates,
  groups,
};
