const schema = require('./users.schema');
const users = require('./users.model');

const validateUser = (defaultErrorMessage) => (req, res, next) => {
  const result = schema.validate(req.body);
  if (!result.error) {
    next();
  } else {
    const error = defaultErrorMessage ? new Error(defaultErrorMessage) : result.error;
    res.status(422);
    next(error);
  }
};

const findUserById = (defNoFoundErr) => async (req, res, next) => {
  try {
    const foundUser = await users.findOne({
      _id: req.params.id,
    });
    if (foundUser) {
      next();
    } else {
      res.status(422);
      throw new Error(defNoFoundErr);
    }
  } catch (error) {
    if (error.message === 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters') {
      res.status(422);
      error.message = 'User not found';
    } else {
      res.status(res.statusCode === 200 ? 500 : res.statusCode);
    }
    next(error);
  }
};

module.exports = {
  validateUser,
  findUserById,
};
