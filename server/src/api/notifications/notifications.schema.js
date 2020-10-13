const Joi = require('joi');

const schema = Joi.object({
  noteId: Joi.string().trim().length(24).required(),
  state: Joi.bool().required(),
});

const getSchema = Joi.object({
  onlyUnread: Joi.bool().default(false),
});

const idSchema = Joi.object({
  noteId: Joi.string().trim().length(24).required(),
});

const answerSchema = Joi.object({
  noteId: Joi.string().trim().length(24).required(),
  inviteId: Joi.string().trim().length(24).required(),
  stay: Joi.bool().required(),
});

module.exports = {
  schema,
  getSchema,
  idSchema,
  answerSchema,
};
