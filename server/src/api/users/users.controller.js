const bcrypt = require('bcryptjs');

const users = require('./users.model');

const getItem = async (req, res, next) => {
  const user = await users.findOne({ _id: req.params.userId, active: true });
  if (user) {
    const result = {
      _id: user._id,
      username: user.username,
    };
    res.json(result);
  } else {
    res.status(422);
    next(new Error('User not found'));
  }
};

const patchUserAsAdmin = async (req, res, next) => {
  try {
    if (Object.keys(req.body).length > 0) {
      const updatedUser = req.body;
      if (updatedUser.password) {
        updatedUser.password = await bcrypt.hash(updatedUser.password.trim(), 12);
      }
      const foundAndUpdatedUser = await users.findOneAndUpdate({ _id: req.params.userId }, {
        $set: updatedUser,
      });
      delete foundAndUpdatedUser.password;
      res.json(foundAndUpdatedUser);
    } else {
      res.status(422);
      next(new Error('Nothing to change'));
    }
  } catch (error) {
    next(error);
  }
};

const patchUser = async (req, res, next) => {
  try {
    if (Object.keys(req.body).length > 0) {
      const updatedUser = req.body;
      if (updatedUser.password) {
        updatedUser.password = await bcrypt.hash(updatedUser.password.trim(), 12);
      }
      const foundAndUpdatedUser = await users.findOneAndUpdate({ _id: req.user._id }, {
        $set: updatedUser,
      });
      delete foundAndUpdatedUser.password;
      res.json(foundAndUpdatedUser);
    } else {
      res.status(422);
      next(new Error('Nothing to change'));
    }
  } catch (error) {
    res.status(500);
    next(error);
  }
};

module.exports = {
  patchUser,
  getItem,
  patchUserAsAdmin,
};
