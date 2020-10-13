const { schema, answerSchema, idSchema } = require('./invites.schema');
const {
  groups, userGroups, users, userInvites,
} = require('./invites.model');

const validateInserts = (req, res, next) => {
  const result = schema.validate(req.body);
  if (!result.error) {
    next();
  } else {
    res.status(422);
    next(result.error);
  }
};

const validateAnswer = (req, res, next) => {
  const result = answerSchema.validate(req.body);
  if (!result.error) {
    next();
  } else {
    res.status(422);
    next(result.error);
  }
};

const existsInputs = async (req, res, next) => {
  const foundGroup = await groups.findOne({ _id: req.body.group });
  let foundUsers = [];
  if (req.body.users) {
    const query = [];
    await new Promise((resolve, reject) => {
      req.body.users.forEach(async (uId, i, array) => {
        query.push({ _id: uId });
        if (array.length - 1 === i) resolve();
      });
    });
    foundUsers = await users.find({
      $or: query,
    });
  }
  const bool = req.body.users ? foundUsers.length === req.body.users.length : true;
  if (foundGroup && bool) {
    next();
  } else {
    res.status(422);
    const err = new Error('Invalid Inputs');
    next(err);
  }
};

const inviteExists = async (req, res, next) => {
  const foundInvite = await userInvites.findOne({ invite: req.params.inviteId, user: req.user._id });
  if (foundInvite) {
    next();
  } else {
    res.status(422);
    const err = new Error('Invite do not exist');
    next(err);
  }
};

const userAllowed = async (req, res, next) => {
  const foundUser = await userGroups.findOne({ group: req.body.group, user: req.user._id, role: 'admin' });
  if (foundUser) {
    next();
  } else {
    res.status(403);
    const err = new Error('Not allowed');
    next(err);
  }
};

const validateId = (req, res, next) => {
  const result = idSchema.validate(req.params);
  if (!result.error) {
    next();
  } else {
    res.status(422);
    next(result.error);
  }
};

module.exports = {
  validateInserts,
  existsInputs,
  validateAnswer,
  inviteExists,
  userAllowed,
  validateId,
};
