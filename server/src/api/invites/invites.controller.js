const {
  userInvites, userGroups, invites, dates, notifications,
} = require('./invites.model');

async function setInviteToDate(inviteId) {
  let err = '';
  try {
    const invite = await invites.findOne({ _id: inviteId });
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

async function existsInvite(groupId, userId) {
  const foundInvite = await userInvites.findOne({ group: groupId, user: userId });
  return foundInvite != null;
}

const list = async (req, res) => {
  const foundInvites = await userInvites.find({
    user: req.user._id,
  });
  res.json(foundInvites);
};

const getItem = async (req, res, next) => {
  const invite = await invites.findOne({ _id: req.params.inviteId });
  if (invite) {
    res.json(invite);
  } else {
    res.status(422);
    next(new Error('Invite not found'));
  }
};

const insertInvite = async (req, res, next) => {
  let foundMembers;
  if (req.body.users) {
    foundMembers = await userGroups.find({ group: req.body.group, user: { $nin: req.body.users, $ne: req.user._id } });
  } else {
    foundMembers = await userGroups.find({ group: req.body.group, user: { $ne: req.user._id } });
  }
  if (foundMembers.length > 0) {
    try {
      const invite = {
        ...req.body,
        creator: req.user._id,
        acceptsLeft: foundMembers.length,
      };
      const foundInvite = await invites.findOne(invite);
      if (!foundInvite) {
        invite.created = Date.now();
        const insertedInvite = await invites.insert(invite);
        if (!insertedInvite) {
          throw new Error('Error while creating invite');
        }
        const inviteId = insertedInvite._id.toString();
        let newInvite = false;
        await new Promise((resolve, reject) => {
          foundMembers.forEach(async (member, i, array) => {
            const exists = await existsInvite(req.body.group, member.user);
            if (!exists) {
              const userInvite = {
                invite: inviteId,
                user: member.user,
              };
              delete userInvite.users;
              const insertedUserInvite = await userInvites.insert(userInvite);
              if (insertedUserInvite.error) {
                throw new Error('Error while creating user invite');
              }
              newInvite = true;
            }
            if (array.length - 1 === i) resolve();
          });
        });
        if (newInvite) {
          res.json(insertedInvite);
        } else {
          res.json({ message: 'Invites already exists' });
        }
      } else {
        res.json({ message: 'Invite already exists' });
      }
    } catch (error) {
      res.status(500);
      next(error);
    }
  } else {
    res.status(422);
    const err = new Error('No other members in the group');
    next(err);
  }
};

const answerInvite = async (req, res, next) => {
  if (req.body.accept) {
    const updatedInvite = await invites.findOneAndUpdate({ _id: req.params.inviteId }, { $inc: { acceptsLeft: -1 } });
    const deletedInvite = await userInvites.findOneAndDelete({ user: req.user._id, invite: req.params.inviteId });
    if (!updatedInvite.error && !deletedInvite.error) {
      if (updatedInvite.acceptsLeft === 0) {
        const result = await setInviteToDate(req.params.inviteId);
        if (result === 'Dates inserted. Notifications send') {
          res.json({ message: 'Invite accepted. Date inserted' });
        } else {
          res.status(500);
          next(new Error(result));
        }
      } else {
        const note = {
          type: 'acceptedDateInvite',
          data: {
            invite_id: req.params.inviteId,
            invite_title: updatedInvite.title,
            acceptingUser: req.user._id,
          },
          user: updatedInvite.creator,
          read: false,
        };
        const insertedNote = await notifications.insert(note);
        if (insertedNote.error) {
          res.status(500);
          const err = new Error('Dates inserted. Notifications failed');
          next(err);
        } else {
          res.json({ message: 'Invite accepted' });
        }
      }
    } else {
      res.status(500);
      const err = new Error('An error occured while accepting the invite');
      next(err);
    }
  } else {
    let resultStr = '';
    const deletedInvite = await userInvites.findOneAndDelete({ user: req.user._id, invite: req.params.inviteId });
    if (!deletedInvite.error) {
      resultStr += 'Invite declined.';
    } else {
      res.status(500);
      const err = new Error('An error occured while declining the invite');
      next(err);
    }
    // create notification to creator with information that user xy declined...
    const invite = await invites.findOne({ _id: req.params.inviteId });
    const note = {
      type: 'declinedDateInvite',
      data: {
        invite_id: req.params.inviteId,
        invite_title: invite.title,
        decliningUser: req.user._id,
      },
      user: invite.creator,
      read: false,
    };
    const insertedNote = await notifications.insert(note);
    if (insertedNote.error) {
      res.status(500);
      const err = new Error('Dates inserted. Notifications failed');
      next(err);
    } else {
      resultStr += ' Dates inserted. Notifications send';
      res.json({ message: resultStr });
    }
  }
};

module.exports = {
  list,
  insertInvite,
  answerInvite,
  getItem,
};
