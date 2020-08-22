const express = require('express');
const Joi = require('joi');

const db = require('../db/connection');

const notes = db.get('notes');

const router = express.Router();

const schema = Joi.object({
  title: Joi.string().trim().max(100).required(),
  note: Joi.string().trim().required(),
});

router.get('/', (req, res) => {
  notes.find({
    user_id: req.user._id,
  }).then((foundNotes) => {
    res.json(foundNotes);
  });
});

router.post('/', (req, res, next) => {
  const result = schema.validate({
    title: req.body.title,
    note: req.body.note,
  });
  if (result.error === undefined) {
    const note = {
      ...req.body,
      user_id: req.user._id,
    };
    notes.insert(note).then((insertedNote) => {
      res.json(insertedNote);
    });
  } else {
    const err = new Error(result.error);
    res.status(422);
    next(err);
  }
});

module.exports = router;
