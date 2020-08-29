const db = require('../../db/connection');

const users = db.get('users');

module.exports = users;
