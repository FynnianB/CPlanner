const { invites, groups, userGroups } = require('./groups.model');

async function addUserToGroup(userId, groupId, userRole = 'member') {
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
    if (req.body.state) {
      const foundUserInGroup = await userGroups.findOne({ user: req.user._id, group: req.params.groupId });
      if (!foundUserInGroup) {
        const foundInvite = await invites.findOne({ user: req.user._id, group: req.params.groupId });
        if (foundInvite) {
          const result = await addUserToGroup(req.user._id, req.params.groupId);
          const result2 = await invites.findOneAndDelete({ user: req.user._id, group: req.params.groupId });
          if (!result.error && !result2.error) {
            res.json(result);
          } else {
            const err = result.error ? result : result2;
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
    } else {
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
    res.json({ message: 'User kicked from Group' });
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
      user: req.params.userId,
      group: req.params.groupId,
    };
    const foundInvite = await invites.findOne(invite);
    if (!foundInvite) {
      const insertedInvite = await invites.insert(invite);
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
};
