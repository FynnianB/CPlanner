const {
  schema, getSchema, idSchema, answerSchema,
} = require('./notifications.schema');
const { notifications, invites } = require('./notifications.model');

const validate = (req, res, next) => {
  const result = schema.validate(req.body);
  if (!result.error) {
    next();
  } else {
    res.status(422);
    next(result.error);
  }
};

const validateInputs = (req, res, next) => {
  const result = getSchema.validate(req.body);
  if (!result.error) {
    next();
  } else {
    res.status(422);
    next(result.error);
  }
};

const noteExists = async (req, res, next) => {
  const foundNote = await notifications.findOne({ _id: req.body.noteId, user: req.user._id });
  if (foundNote) {
    next();
  } else {
    res.status(422);
    next(new Error('No notification found'));
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

const validateAnswer = (req, res, next) => {
  const result = answerSchema.validate(req.body);
  if (!result.error) {
    next();
  } else {
    res.status(422);
    next(result.error);
  }
};

const isInviteCreator = async (req, res, next) => {
  const invite = await invites.findOne({ _id: req.body.inviteId, creator: req.user._id });
  const note = await notifications.findOne({
    _id: req.body.noteId,
    user: req.user._id,
    type: 'declinedDateInvite',
    'data.invite_id': req.body.inviteId,
  });
  if (invite && note) {
    next();
  } else {
    res.status(422);
    next(new Error('Invalid Inputs'));
  }
};

module.exports = {
  validate,
  noteExists,
  validateInputs,
  validateId,
  validateAnswer,
  isInviteCreator,
};
