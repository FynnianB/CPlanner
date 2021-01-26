const Joi = require('joi');

const schema = Joi.object({
  title: Joi.string().trim().max(100).required(),
  from: Joi.date().iso().required(),
  to: Joi.date().iso().min(Joi.ref('from')).required(),
  desc: Joi.string().trim(),
  location: Joi.string().trim(),
});

const patchSchema = Joi.object({
  title: Joi.string().trim().max(100),
  from: Joi.date().iso(),
  to: Joi.date().iso().min(Joi.ref('$oldFrom')),
  desc: Joi.string().trim(),
  location: Joi.string().trim(),
});

const schemaId = Joi.object({
  dateId: Joi.string().trim().length(24).required(),
});

const zoneSchema = Joi.object({
  from: Joi.date().iso().required(),
  to: Joi.date().iso().min(Joi.ref('from')).required(),
});

module.exports = {
  schema,
  schemaId,
  patchSchema,
  zoneSchema,
};
