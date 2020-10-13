const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const users = require('./auth.model');

function createTokenSendResponse(user, res, next) {
  const payload = {
    _id: user._id,
    username: user.username,
    role: user.role,
    active: user.active,
  };
  jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '30d' }, (err, token) => {
    if (err) {
      res.status(422);
      const error = new Error('Unable to login!');
      next(error);
    } else {
      res.json({ token });
    }
  });
}

const signup = async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password.trim(), 12);
    const newUser = {
      username: req.body.username,
      password: hashedPassword,
      role: 'user',
      active: true,
    };
    const insertedUser = await users.insert(newUser);
    createTokenSendResponse(insertedUser, res, next); // automatically logging in
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const bcryptResult = await bcrypt.compare(req.body.password, req.loggingInUser.password);
    if (bcryptResult) {
      createTokenSendResponse(req.loggingInUser, res, next);
    } else {
      res.status(422);
      throw new Error('Unable to login!');
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    next(error);
  }
};

module.exports = {
  signup,
  login,
};
