const notes = require('./notes.model');

const list = async (req, res) => {
  const foundNotes = await notes.find({
    user_id: req.user._id,
  });
  res.json(foundNotes);
};

const insertNote = async (req, res) => {
  const note = {
    ...req.body,
    user_id: req.user._id,
  };
  const insertedNote = await notes.insert(note);
  res.json(insertedNote);
};

module.exports = {
  list,
  insertNote,
};
