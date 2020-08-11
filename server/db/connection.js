const monk = require('monk');
const db = monk('localhost/cplanner');

module.exports = db;