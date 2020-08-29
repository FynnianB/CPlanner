const bcrypt = require('bcryptjs');

const users = require('./users.model');

const list = async (req, res, next) => {
  try {
    const result = await users.find({}, { fields: { password: 0 } });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const patchUser = async (req, res, next) => {
  try {
    const updatedUser = req.body;
    if (updatedUser.password) {
      updatedUser.password = await bcrypt.hash(updatedUser.password.trim(), 12);
    }
    const foundAndUpdatedUser = await users.findOneAndUpdate({ _id: req.params.id }, {
      $set: updatedUser,
    });
    delete foundAndUpdatedUser.password;
    res.json(foundAndUpdatedUser);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  patchUser,
};
