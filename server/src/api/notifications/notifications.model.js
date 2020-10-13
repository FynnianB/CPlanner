const db = require('../../db/connection');

const notifications = db.get('notifications');
const invites = db.get('invites');
const userGroups = db.get('userGroups');
const dates = db.get('dates');

module.exports = {
  notifications,
  invites,
  userGroups,
  dates,
};
