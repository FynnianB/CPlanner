const db = require('../../db/connection');

const dates = db.get('dates');
const notifications = db.get('notifications');

module.exports = {
  dates,
  notifications,
};
