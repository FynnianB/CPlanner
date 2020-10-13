const Joi = require('joi');

const schema = Joi.object({
  title: Joi.string().trim().max(100).required(),
  from: Joi.date().required(),
  to: Joi.date().min(Joi.ref('from')).required(),
  time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  desc: Joi.string().trim(),
  location: Joi.string().trim(),
});

const patchSchema = Joi.object({
  title: Joi.string().trim().max(100),
  from: Joi.date(),
  to: Joi.date().min(Joi.ref('$oldFrom')),
  time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  desc: Joi.string().trim(),
  location: Joi.string().trim(),
});

const schemaId = Joi.object({
  dateId: Joi.string().trim().length(24).required(),
});

module.exports = {
  schema,
  schemaId,
  patchSchema,
};
