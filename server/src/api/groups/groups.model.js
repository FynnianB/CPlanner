const db = require('../../db/connection');

const groups = db.get('groups');
const userGroups = db.get('userGroups');
const users = db.get('users');
const invites = db.get('invites');

module.exports = {
  groups,
  userGroups,
  users,
  invites,
};
