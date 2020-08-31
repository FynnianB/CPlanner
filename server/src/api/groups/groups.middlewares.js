const { schema, groupSchema, roleSchema } = require('./groups.schema');
const { users, groups, userGroups } = require('./groups.model');

const validateCreatableGroup = (defaultErrorMessage) => (req, res, next) => {
  const result = schema.validate(req.body);
  if (!result.error) {
    next();
  } else {
    const error = defaultErrorMessage ? new Error(defaultErrorMessage) : result.error;
    res.status(422);
    next(error);
  }
};

const validateGroupState = (defaultErrorMessage) => (req, res, next) => {
  const result = groupSchema.validate(req.body);
  if (!result.error) {
    next();
  } else {
    const error = defaultErrorMessage ? new Error(defaultErrorMessage) : result.error;
    res.status(422);
    next(error);
  }
};

const validateRoleOrDelete = (defaultErrorMessage) => (req, res, next) => {
  const result = roleSchema.validate(req.body);
  if (!result.error) {
    next();
  } else {
    const error = defaultErrorMessage ? new Error(defaultErrorMessage) : result.error;
    res.status(422);
    next(error);
  }
};

const findGroup = (defCreateErr, isError, statusCode = 422) => async (req, res, next) => {
  try {
    const group = await groups.findOne({
      title: req.body.title,
    });
    if (isError(group)) {
      res.status(statusCode);
      next(new Error(defCreateErr));
    } else {
      next();
    }
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const findGroupById = (defCreateErr, ifStatement, statusCode = 422) => async (req, res, next) => {
  try {
    const group = await groups.findOne({
      _id: req.params.groupId,
    });
    if (ifStatement(group)) {
      next();
    } else {
      res.status(statusCode);
      throw new Error(defCreateErr);
    }
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const isGroupAdmin = async (req, res, next) => {
  try {
    const group = await groups.findOne({ _id: req.params.groupId });
    if (group.admin === req.user._id) {
      next();
    } else {
      res.status(401);
      throw new Error('Unauthorized');
    }
  } catch (err) {
    res.status(res.statusCode === 200 ? 422 : res.statusCode);
    next(err);
  }
};

const isParamNotGroupAdmin = async (req, res, next) => {
  try {
    const group = await groups.findOne({ _id: req.params.groupId });
    if (group.admin !== req.params.userId) {
      next();
    } else {
      res.status(422);
      throw new Error('The role of the admin cannot by modified');
    }
  } catch (err) {
    res.status(res.statusCode === 200 ? 422 : res.statusCode);
    next(err);
  }
};

const isUserInGroup = (ifStatement) => async (req, res, next) => {
  try {
    const foundUser = await userGroups.findOne({ user: req.params.userId, group: req.params.groupId });
    if (ifStatement(foundUser)) {
      next();
    } else {
      res.status(404);
      throw new Error('Unable to proceed');
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 422 : res.statusCode);
    next(error);
  }
};

const validateUserAndGroup = async (req, res, next) => {
  try {
    const foundUser = await users.findOne({ _id: req.params.userId, active: true });
    const foundGroup = await groups.findOne({ _id: req.params.groupId });
    if (foundUser && foundGroup) {
      next();
    } else {
      res.status(422);
      throw new Error('Unable to fetch inputs');
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 422 : res.statusCode);
    next(error);
  }
};

module.exports = {
  validateCreatableGroup,
  validateGroupState,
  validateRoleOrDelete,
  findGroup,
  findGroupById,
  isParamNotGroupAdmin,
  isGroupAdmin,
  isUserInGroup,
  validateUserAndGroup,
};
