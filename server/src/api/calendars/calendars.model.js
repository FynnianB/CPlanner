const db = require('../../db/connection');

const dates = db.get('dates');

module.exports = dates;
