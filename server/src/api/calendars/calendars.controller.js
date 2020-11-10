const { dates, notifications } = require('./calendars.model');

async function patchGroupDate(req) {
  let err = '';
  try {
    const foundDates = await dates.find({
      group: req.date.group,
      creator: req.date.creator,
      created: req.date.created,
    });
    const newDate = {
      ...req.body,
      created: Date.now(),
    };
    await new Promise((resolve, reject) => {
      foundDates.forEach(async (date, i, array) => {
        const updatedDate = await dates.findOneAndUpdate({ _id: date._id }, { $set: newDate });
        if (!updatedDate.error) {
          const note = {
            type: 'updatedGroupDate',
            data: {
              date_id: updatedDate._id.toString(),
              date_title: updatedDate.title,
              date_date: updatedDate.from,
              date_group: req.group.title,
            },
            user: date.user_id,
            read: false,
          };
          const insertedNote = await notifications.insert(note);
          if (!insertedNote.error) {
            err = 'Dates updated. Notifications failed';
          }
        } else {
          err = updatedDate.error;
        }
        if (array.length - 1 === i) resolve();
      });
    });
    return 'Dates updated. Notifications send';
  } catch (error) {
    err = error;
  }
  return err;
}

async function deleteGroupDate(req) {
  let err = '';
  try {
    const foundDates = await dates.find({
      group: req.date.group,
      creator: req.date.creator,
      created: req.date.created,
    });
    await new Promise((resolve, reject) => {
      foundDates.forEach(async (date, i, array) => {
        const deletedDate = await dates.findOneAndDelete({ _id: date._id });
        if (!deletedDate.error) {
          const note = {
            type: 'deletedGroupDate',
            data: {
              date_id: date._id.toString(),
              date_title: date.title,
              date_date: date.from,
              date_group: req.group.title,
            },
            user: date.user_id,
            read: false,
          };
          const insertedNote = await notifications.insert(note);
          if (!insertedNote.error) {
            err = 'Dates deleted. Notifications failed';
          }
        } else {
          err = deletedDate.error;
        }
        if (array.length - 1 === i) resolve();
      });
    });
    return 'Dates deleted. Notifications send';
  } catch (error) {
    err = error;
  }
  return err;
}

const list = async (req, res) => {
  const foundDates = await dates.find({
    user_id: req.user._id,
    $or: [
      { from: { $gte: new Date(req.body.from), $lte: new Date(req.body.to) } },
      { to: { $gte: new Date(req.body.from), $lte: new Date(req.body.to) } },
    ],
  });
  res.json(foundDates);
};

const insertDate = async (req, res) => {
  const date = {
    ...req.body,
    created: Date.now(),
    user_id: req.user._id,
  };
  const insertedDate = await dates.insert(date);
  res.json(insertedDate);
};

const getItem = async (req, res, next) => {
  const date = await dates.findOne({ _id: req.params.dateId, user_id: req.user._id });
  if (date) {
    res.json(date);
  } else {
    res.status(422);
    next(new Error('Date not found'));
  }
};

const patchDate = async (req, res, next) => {
  if (req.date.group && req.date.creator) {
    const result = await patchGroupDate(req);
    if (result === 'Dates updated. Notifications send') {
      res.json({ message: result });
    } else {
      res.status(500);
      next(new Error(result));
    }
  } else {
    const updatedDate = await dates.findOneAndUpdate({ _id: req.date._id }, { $set: req.body });
    if (!updatedDate.error) {
      res.json(updatedDate);
    } else {
      next(new Error(updatedDate.error));
    }
  }
};

const deleteDate = async (req, res, next) => {
  if (req.date.group && req.date.creator) {
    const result = await deleteGroupDate(req);
    if (result === 'Dates deleted. Notifications send') {
      res.json({ message: result });
    } else {
      res.status(500);
      next(new Error(result));
    }
  } else {
    const deletedDate = await dates.findOneAndDelete({ _id: req.date._id });
    if (!deletedDate.error) {
      res.json({ message: 'Date deleted' });
    } else {
      next(new Error(deletedDate.error));
    }
  }
};

module.exports = {
  list,
  insertDate,
  getItem,
  patchDate,
  deleteDate,
};
