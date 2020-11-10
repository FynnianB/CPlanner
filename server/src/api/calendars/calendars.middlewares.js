const {
  schema,
  schemaId,
  patchSchema,
  zoneSchema,
} = require('./calendars.schema');
const { dates, groups } = require('./calendars.model');

const validateDate = (defaultErrorMessage) => (req, res, next) => {
  const result = schema.validate(req.body);
  if (!result.error) {
    next();
  } else {
    const error = defaultErrorMessage ? new Error(defaultErrorMessage) : result.error;
    res.status(422);
    next(error);
  }
};

const validateDateZone = (defaultErrorMessage) => (req, res, next) => {
  const result = zoneSchema.validate(req.body);
  if (!result.error) {
    next();
  } else {
    const error = defaultErrorMessage ? new Error(defaultErrorMessage) : result.error;
    res.status(422);
    next(error);
  }
};

const validatePatchableDate = (defaultErrorMessage) => (req, res, next) => {
  const from = req.body.from ? req.body.from : req.date.from;
  const result = patchSchema.validate(req.body, { context: { oldFrom: from } });
  if (!result.error) {
    next();
  } else {
    const error = defaultErrorMessage ? new Error(defaultErrorMessage) : result.error;
    res.status(422);
    next(error);
  }
};

const validateId = (req, res, next) => {
  const result = schemaId.validate(req.params);
  if (!result.error) {
    next();
  } else {
    res.status(422);
    next(result.error);
  }
};

const dateExists = async (req, res, next) => {
  const date = await dates.findOne({ _id: req.params.dateId, user_id: req.user._id });
  if (date) {
    req.date = date;
    next();
  } else {
    res.status(422);
    next(new Error('Date not found'));
  }
};

const groupExists = async (req, res, next) => {
  const group = await groups.findOne({ _id: req.date._id });
  if (group) {
    req.group = group;
    next();
  } else {
    res.status(422);
    next(new Error('Group not found'));
  }
};

const isDateCreator = async (req, res, next) => {
  if (req.date.group && req.date.creator) {
    if (req.date.creator === req.user._id) {
      next();
    } else {
      res.status(403);
      next(new Error('Only the creator can modify the date'));
    }
  } else {
    next();
  }
};

const formatDates = (req, res, next) => {
  if (req.body.from) {
    req.body.from = new Date(req.body.from);
  }
  if (req.body.to) {
    req.body.to = new Date(req.body.to);
  }
  next();
};

module.exports = {
  validateDate,
  validateId,
  dateExists,
  isDateCreator,
  validatePatchableDate,
  formatDates,
  validateDateZone,
  groupExists,
};
