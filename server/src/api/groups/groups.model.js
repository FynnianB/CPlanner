const db = require('../../db/connection');

const groups = db.get('groups');
const userGroups = db.get('userGroups');

module.exports = {
  groups,
  userGroups,
};
