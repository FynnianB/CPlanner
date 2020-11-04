const jwt = require('jsonwebtoken');

const schema = require('./auth.schema');
const users = require('./auth.model');

function checkTokenSetUser(req, res, next) {
  const authHeader = req.get('authorization');
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token) {
      jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
          console.log(err);
        }
        req.user = user;
        next();
      });
    } else {
      next();
    }
  } else {
    next();
  }
}

function unauthorized(res, next) {
  const err = new Error('Unauthorized');
  res.status(401);
  next(err);
}

function isLoggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    unauthorized(res, next);
  }
}

function isAdmin(req, res, next) {
  if (req.user.role === 'admin') {
    next();
  } else {
    unauthorized(res, next);
  }
}

const validateUser = (defaultErrorMessage) => (req, res, next) => {
  const result = schema.validate({
    username: req.body.username,
    password: req.body.password,
  });
  if (!result.error) {
    next();
  } else {
    const error = defaultErrorMessage ? new Error(defaultErrorMessage) : result.error;
    res.status(422);
    next(error);
  }
};

const findUser = (defLoginErr, isError, statusCode = 422) => async (req, res, next) => {
  try {
    const user = await users.findOne({
      username: new RegExp(req.body.username, 'i'),
    });
    if (isError(user)) {
      res.status(statusCode);
      next(new Error(defLoginErr));
    } else {
      req.loggingInUser = user;
      next();
    }
  } catch (error) {
    res.status(500);
    next(error);
  }
};

module.exports = {
  checkTokenSetUser,
  isLoggedIn,
  isAdmin,
  validateUser,
  findUser,
};
