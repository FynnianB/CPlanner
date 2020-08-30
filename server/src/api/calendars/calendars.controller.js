const dates = require('./calendars.model');

const list = async (req, res) => {
  const foundDates = await dates.find({
    user_id: req.user._id,
  });
  res.json(foundDates);
};

const insertDate = async (req, res) => {
  const date = {
    ...req.body,
    inserted: Date.now(),
    user_id: req.user._id,
  };
  const insertedDate = await dates.insert(date);
  res.json(insertedDate);
};

module.exports = {
  list,
  insertDate,
};
