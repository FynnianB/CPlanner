const db = require('../../db/connection');

const dates = db.get('dates');
const groups = db.get('groups');
const notifications = db.get('notifications');

module.exports = {
  dates,
  notifications,
  groups,
};
