const {
  groupInvites, groups, userGroups, notifications, users,
} = require('./groups.model');

const getItem = async (req, res, next) => {
  const group = await groups.findOne({ _id: req.params.groupId });
  if (group) {
    const members = [];
    const foundUserInGroup = await userGroups.find({ group: req.params.groupId });
    if (foundUserInGroup && foundUserInGroup.length > 0) {
      await new Promise((resolve, reject) => {
        foundUserInGroup.forEach(async (entry, i, array) => {
          const userInfo = await users.findOne({ _id: entry.user, active: true });
          if (userInfo) {
            if (entry.user === group.admin) {
              group.adminUsername = userInfo.username;
            }
            const member = {
              memberId: userInfo._id,
              memberUsername: userInfo.username,
              memberRole: entry.role,
            };
            if (member.memberRole === 'admin' && group.admin !== member.memberId.toString()) {
              member.memberRole = 'moderator';
            }
            members.push(member);
          }
          if (array.length - 1 === i) resolve();
        });
      });
    }
    group.members = members;
    res.json(group);
  } else {
    res.status(422);
    next(new Error('Group not found'));
  }
};

async function addUserToGroup(userId, groupId, userRole) {
  try {
    const foundGroup = await groups.findOne({ _id: groupId });
    if (foundGroup && !foundGroup.error) {
      const newEntry = {
        user: userId,
        group: groupId,
        role: userRole,
      };
      const insertedEntry = await userGroups.insert(newEntry);
      return insertedEntry;
    }
    return { error: new Error('Group doesnt exists'), status: 400 };
  } catch (err) {
    return { error: err, status: 422 };
  }
}

async function isAdminOfGroup(userId, groupId) {
  try {
    const group = await groups.findOne({ _id: groupId });
    return group.admin === userId;
  } catch (err) {
    return { error: err, status: 422 };
  }
}

const list = async (req, res) => {
  if (req.user.role === 'admin') {
    const foundGroups = await groups.find({});
    res.json(foundGroups);
  } else {
    const result = [];
    const foundGroups = await userGroups.find({ user: req.user._id });
    await new Promise((resolve, reject) => {
      foundGroups.forEach(async (foundEntry, i, array) => {
        const groupInfo = await groups.findOne({ _id: foundEntry.group });
        result.push(groupInfo);
        if (array.length - 1 === i) resolve();
      });
    });
    res.json(result);
  }
};

const createGroup = async (req, res, next) => {
  const group = {
    ...req.body,
    admin: req.user._id,
    created: Date.now(),
  };
  const insertedGroup = await groups.insert(group);
  const result = await addUserToGroup(req.user._id, insertedGroup._id.toString(), 'admin');
  if (!result.error) {
    res.json(insertedGroup);
  } else {
    res.status(result.status);
    next(result.error);
  }
};

const updateGroup = async (req, res, next) => {
  try {
    if (req.body.state === 'accept') {
      const foundUserInGroup = await userGroups.findOne({ user: req.user._id, group: req.params.groupId });
      if (!foundUserInGroup) {
        const foundInvite = await groupInvites.findOne({ user: req.user._id, group: req.params.groupId });
        if (foundInvite) {
          const result = await addUserToGroup(req.user._id, req.params.groupId, 'member');
          await groupInvites.findOneAndDelete({ user: req.user._id, group: req.params.groupId });
          if (!result.error) {
            const group = await groups.findOne({ _id: result.group });
            const note = {
              type: 'acceptedGroupInvite',
              data: {
                group_id: group._id.toString(),
                group_title: group.title,
                user: req.user._id,
                username: req.user.username,
              },
              user: group.admin,
              read: false,
            };
            const insertedNote = await notifications.insert(note);
            if (insertedNote.error) {
              res.status(500);
              next(new Error('User inserted into Group. Notifications failed'));
            } else {
              result.message = 'User inserted into Group. Notifications send';
              res.json(result);
            }
          } else {
            const err = result.error;
            res.status(err.status);
            next(err.error);
          }
        } else {
          res.status(401);
          next(new Error('No Invite'));
        }
      } else {
        const err = new Error('User already in this group');
        res.status(422);
        next(err);
      }
    } else if (req.body.state === 'deny') {
      const foundUserInGroup = await userGroups.findOne({ user: req.user._id, group: req.params.groupId });
      if (!foundUserInGroup) {
        const foundInvite = await groupInvites.findOne({ user: req.user._id, group: req.params.groupId });
        if (foundInvite) {
          const result = await groupInvites.findOneAndDelete({ user: req.user._id, group: req.params.groupId });
          if (result.error) {
            res.status(500);
            next(new Error('An error occured while denying the invite'));
          } else {
            // Create notification that invite was denied
            const group = await groups.findOne({ _id: req.params.groupId });
            const note = {
              type: 'deniedGroupInvite',
              data: {
                group_id: group._id.toString(),
                group_title: group.title,
                user: req.user._id,
                username: req.user.username,
              },
              user: group.admin,
              read: false,
            };
            const insertedNote = await notifications.insert(note);
            if (insertedNote.error) {
              res.status(500);
              next(new Error('Invite denied. Notifications failed'));
            } else {
              res.json({ message: 'Invite denied. Notifications send' });
            }
          }
        } else {
          res.status(401);
          next(new Error('No Invite'));
        }
      } else {
        const err = new Error('User already in this group');
        res.status(422);
        next(err);
      }
    } else if (req.body.state === 'remove') {
      const foundUserInGroup = await userGroups.findOne({ user: req.user._id, group: req.params.groupId });
      if (foundUserInGroup) {
        const isAdmin = await isAdminOfGroup(req.user._id, req.params.groupId);
        if (!isAdmin) {
          await userGroups.findOneAndDelete({ user: req.user._id, group: req.params.groupId });
          res.json({ message: 'User removed from Group' });
        } else {
          const err = new Error('The admin cannot leave his group');
          res.status(403);
          next(err);
        }
      } else {
        const err = new Error('User is not in this group');
        res.status(422);
        next(err);
      }
    }
  } catch (error) {
    next(error);
  }
};

const deleteGroup = async (req, res) => {
  await groups.findOneAndDelete({ _id: req.params.groupId });
  await userGroups.remove({ group: req.params.groupId });
  res.json({ message: 'Group succesfully removed' });
};

const updateUser = async (req, res, next) => {
  if (req.body.delete) {
    await userGroups.findOneAndDelete({ user: req.params.userId, group: req.params.groupId });
    const group = await groups.findOne({ _id: req.params.groupId });
    const note = {
      type: 'userKickedOutOfGroup',
      data: {
        group_id: group._id.toString(),
        group_title: group.title,
        kicker_id: req.user._id.toString(),
        kicker_username: req.user.username,
      },
      user: req.params.userId,
      read: false,
    };
    const insertedNote = await notifications.insert(note);
    if (insertedNote.error) {
      res.status(500);
      next(new Error('User kicked from Group. Notifications failed'));
    } else {
      res.json({ message: 'User kicked from Group' });
    }
  } else {
    const foundAndUpdatedUser = await userGroups.findOneAndUpdate({ user: req.params.userId, group: req.params.groupId }, {
      $set: req.body,
    });
    res.json(foundAndUpdatedUser);
  }
};

const inviteUser = async (req, res, next) => {
  try {
    const invite = {
      user: req.body.user._id.toString(),
      group: req.params.groupId,
    };
    const foundInvite = await groupInvites.findOne(invite);
    if (!foundInvite) {
      const insertedInvite = await groupInvites.insert(invite);
      res.json(insertedInvite);
    } else {
      res.status(422);
      throw new Error('Invite already send');
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    next(error);
  }
};

module.exports = {
  list,
  createGroup,
  updateGroup,
  deleteGroup,
  updateUser,
  inviteUser,
  getItem,
};
