const Joi = require('joi');

const schema = Joi.object({
  title: Joi.string().trim().max(100).required(),
  desc: Joi.string().trim(),
});

const groupSchema = Joi.object({
  state: Joi.string().valid('accept', 'deny', 'remove').required(),
});

const roleSchema = Joi.object({
  role: Joi.string().valid('member', 'admin'),
  delete: Joi.bool().valid(true),
}).xor('role', 'delete');

const idSchema = Joi.object({
  groupId: Joi.string().trim().length(24).required(),
});

const usernameSchema = Joi.object({
  username: Joi.string().pattern(new RegExp('^[a-zA-Z0-9_-]+$')).min(5).max(30)
    .required(),
});

module.exports = {
  schema,
  groupSchema,
  roleSchema,
  idSchema,
  usernameSchema,
};
