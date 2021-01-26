const Joi = require('joi');

const schema = Joi.object({
  users: Joi.array().items(Joi.string().trim().length(24)),
  group: Joi.string().trim().length(24).required(),
  title: Joi.string().trim().max(100).required(),
  from: Joi.date().iso().required(),
  to: Joi.date().iso().min(Joi.ref('from')).required(),
  desc: Joi.string().trim(),
  location: Joi.string().trim(),
});

const answerSchema = Joi.object({
  accept: Joi.bool().required(),
});

const idSchema = Joi.object({
  inviteId: Joi.string().trim().length(24).required(),
});

const dateSchema = Joi.object({
  group: Joi.string().trim().length(24).required(),
  from: Joi.date().iso().required(),
  to: Joi.date().iso().min(Joi.ref('from')).required(),
});

module.exports = {
  schema,
  answerSchema,
  idSchema,
  dateSchema,
};
