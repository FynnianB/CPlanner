const {
  notifications, invites, userGroups, dates, groups,
} = require('./notifications.model');

async function setInviteToDate(inviteId) {
  let err = '';
  try {
    const invite = await invites.findOne({ _id: inviteId });
    const group = await groups.findOne({ _id: invite.group });
    let groupMembers;
    if (invite.users) {
      groupMembers = await userGroups.find({ group: invite.group, user: { $nin: invite.users } });
    } else {
      groupMembers = await userGroups.find({ group: invite.group });
    }
    await new Promise((resolve, reject) => {
      groupMembers.forEach(async (member, i, array) => {
        const date = {
          ...invite,
          user_id: member.user,
        };
        delete date.acceptsLeft;
        delete date.users;
        delete date._id;
        const foundDate = await dates.findOne(date);
        if (!foundDate) {
          const insertedDate = await dates.insert(date);
          if (!insertedDate.error) {
            const note = {
              type: 'appliedDateInvite',
              data: {
                invite_id: inviteId,
                date_id: insertedDate._id.toString(),
                date_title: insertedDate.title,
                date_date: insertedDate.from,
                group_title: group.title,
              },
              user: member.user,
              read: false,
            };
            const insertedNote = await notifications.insert(note);
            if (!insertedNote.error) {
              err = 'Dates inserted. Notifications failed';
            }
          } else {
            err = insertedDate.error;
          }
        }
        if (array.length - 1 === i) resolve();
      });
    });
    await invites.findOneAndDelete({ _id: inviteId });
    return 'Dates inserted. Notifications send';
  } catch (error) {
    err = error;
  }
  return err;
}

const list = async (req, res) => {
  const query = {
    user: req.user._id,
  };
  if (req.body.onlyUnread) {
    query.read = false;
  }
  console.log(query);
  const foundDates = await notifications.find(query);
  res.json(foundDates);
};

const patchNote = async (req, res, next) => {
  try {
    const foundAndUpdatedNote = await notifications.findOneAndUpdate({ _id: req.body.noteId, user: req.user._id }, {
      $set: { read: req.body.state },
    });
    res.json(foundAndUpdatedNote);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

const getItem = async (req, res, next) => {
  const note = await notifications.findOne({ _id: req.params.noteId, user: req.user._id });
  if (note) {
    res.json(note);
  } else {
    res.status(422);
    next(new Error('Notification not found'));
  }
};

const answerNote = async (req, res, next) => {
  let resultStr = '';
  const note = await notifications.findOne({
    _id: req.body.noteId,
    user: req.user._id,
    type: 'declinedDateInvite',
    'data.invite_id': req.body.inviteId,
  });
  const invite = await invites.findOne({ _id: req.body.inviteId });
  // subtract 1 from acceptsLeft
  let newUsers = [];
  if (invite.users) {
    newUsers = invite.users;
  }
  newUsers.push(note.data.decliningUser);
  const updatedInvite = await invites.findOneAndUpdate({ _id: req.body.inviteId }, { $inc: { acceptsLeft: -1 }, $set: { users: newUsers } });
  if (!updatedInvite.error) {
    if (updatedInvite.acceptsLeft === 0) {
      const result = await setInviteToDate(req.body.inviteId);
      if (result === 'Dates inserted. Notifications send') {
        resultStr += 'Was the last missing accept. Date inserted. ';
      } else {
        res.status(500);
        next(new Error(result));
      }
    }
    const sendNote = {
      type: 'stayOnDate',
      data: {
        invite_id: req.params.inviteId,
        invite_title: updatedInvite.title,
      },
      user: note.data.decliningUser,
      read: false,
    };
    const insertedNote = await notifications.insert(sendNote);
    if (insertedNote.error) {
      res.status(500);
      const err = new Error('Invite updated. Notifications failed');
      next(err);
    } else {
      resultStr += 'Invite updated. Notification send. ';
    }
  } else {
    res.status(500);
    const err = new Error('An error occured while updating the invite status');
    next(err);
  }
  // delete creators deniedNote
  const deletedInvite = await notifications.findOneAndDelete({ user: req.user._id, _id: req.body.noteId });
  if (!deletedInvite.error) {
    resultStr += 'Old notification deleted';
  } else {
    res.status(500);
    const err = new Error('An error occured while deleting the old notification');
    next(err);
  }
  res.json({ message: resultStr });
};

module.exports = {
  list,
  patchNote,
  getItem,
  answerNote,
};
