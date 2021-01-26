const Joi = require('joi');

const schema = Joi.object({
  from: Joi.date().iso().required(),
  to: Joi.date().iso().min(Joi.ref('from')).required(),
});

const idSchema = Joi.object({
  dateId: Joi.string().trim().length(24).required(),
});

const datesSchema = Joi.object({
  dates: Joi.array().items(Joi.string().trim().length(24)).required(),
});

module.exports = {
  schema,
  idSchema,
  datesSchema,
};
