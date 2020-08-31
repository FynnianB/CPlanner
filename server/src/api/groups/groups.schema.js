const Joi = require('joi');

const schema = Joi.object({
  title: Joi.string().trim().max(100).required(),
  desc: Joi.string().trim(),
});

const groupSchema = Joi.object({
  state: Joi.bool().required(),
});

const roleSchema = Joi.object({
  role: Joi.string().valid('member', 'admin'),
  delete: Joi.bool(),
}).xor('role', 'delete');

module.exports = {
  schema,
  groupSchema,
  roleSchema,
};
