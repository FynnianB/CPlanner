const db = require('../../db/connection');

const disabled = db.get('disabled');
const dates = db.get('dates');

module.exports = {
  disabled,
  dates,
};
