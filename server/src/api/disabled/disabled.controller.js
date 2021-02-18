const dayjs = require('dayjs');
const { disabled, dates } = require('./disabled.model');

function getDates(startDate, endDate) {
  if (startDate === endDate) {
    return [startDate];
  }
  const dateArray = [];
  let currentDate = dayjs(startDate, 'MM-DD-YYYY');
  const stopDate = dayjs(endDate, 'MM-DD-YYYY');
  while (currentDate <= stopDate) {
    dateArray.push(dayjs(currentDate).format('MM-DD-YYYY'));
    currentDate = dayjs(currentDate).add(1, 'days');
  }
  return dateArray;
}

const list = async (req, res, next) => {
  try {
    const foundDisabled = await disabled.find({
      user_id: req.user._id,
      date: { $gte: new Date(req.body.from), $lte: new Date(req.body.to) },
    });
    if (!foundDisabled.error) {
      res.json(foundDisabled);
    } else {
      throw new Error('An error occured');
    }
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const insertDate = async (req, res, next) => {
  let err = '';
  try {
    const datesBetween = getDates(req.body.from, req.body.to);
    await new Promise((resolve, reject) => {
      datesBetween.forEach(async (dateMember, i, array) => {
        const foundDate = await disabled.findOne({ date: dateMember, user_id: req.user._id });
        if (!foundDate) {
          const newDisabled = {
            date: new Date(dateMember),
            created: Date.now(),
            user_id: req.user._id,
          };
          const insertedDate = await disabled.insert(newDisabled);
          if (insertedDate.error) {
            err = 'An error occured while inserting dates';
          }
        }
        if (array.length - 1 === i) resolve();
      });
    });
  } catch (error) {
    err = error;
  }
  if (err !== '') {
    res.status(500);
    next(new Error(err));
  } else {
    res.json({ message: 'Disabled dates inserted' });
  }
};

const deleteDate = async (req, res, next) => {
  let err = '';
  try {
    await new Promise((resolve, reject) => {
      req.body.dates.forEach(async (dateId, i, array) => {
        const foundDate = await disabled.findOne({ _id: dateId, user_id: req.user._id });
        if (foundDate) {
          const deletedDate = await disabled.findOneAndDelete({ _id: dateId, user_id: req.user._id });
          if (deletedDate.error) {
            err = 'An error occured while deleting dates';
          }
        } else {
          err = 'Some dates not exists';
        }
        if (array.length - 1 === i) resolve();
      });
    });
  } catch (error) {
    err = error;
  }
  if (err !== '' && err !== 'Some dates not exists') {
    res.status(500);
    next(new Error(err));
  } else if (err === 'Some dates not exists') {
    res.json({ message: 'Some dates not exists' });
  } else {
    res.json({ message: 'Disabled dates deleted' });
  }
};

module.exports = {
  list,
  insertDate,
  deleteDate,
};
