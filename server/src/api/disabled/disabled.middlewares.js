const { schema, idSchema, datesSchema } = require('./disabled.schema');

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

const validateId = (req, res, next) => {
  const result = idSchema.validate(req.params);
  if (!result.error) {
    next();
  } else {
    res.status(422);
    next(result.error);
  }
};

const validateDates = (req, res, next) => {
  const result = datesSchema.validate(req.body);
  if (!result.error) {
    next();
  } else {
    res.status(422);
    next(result.error);
  }
};

module.exports = {
  validateDate,
  validateDates,
  validateId,
};
