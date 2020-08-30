const Joi = require('joi');

const schema = Joi.object({
  title: Joi.string().trim().max(100).required(),
  from: Joi.date().required(),
  to: Joi.date().min(Joi.ref('from')).required(),
  time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  desc: Joi.string().trim(),
  public: Joi.bool(),
});

module.exports = schema;
