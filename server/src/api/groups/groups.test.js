const request = require('supertest');
const { expect } = require('chai');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';

const app = require('../../app');
const db = require('../../db/connection');

const users = db.get('users');
const userGroups = db.get('userGroups');
const groups = db.get('groups');
const invites = db.get('invites');

let adminToken = '';
let adminId = '';

let user2Token = '';
let user2Id = '';

let user3Token = '';
let user3Id = '';

let groupId = '';

async function createAdminUser() {
  try {
    const user = await users.findOne({ role: 'admin' });
    if (!user) {
      const adminUser = await users.insert({
        username: 'admin',
        password: await bcrypt.hash('Password123', 12),
        active: true,
        role: 'admin',
      });
      adminId = adminUser._id;
      const payload = {
        _id: adminUser._id,
        username: adminUser.username,
        role: adminUser.role,
        active: adminUser.active,
      };
      jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '1d' }, (err, token) => {
        if (err) {
          console.log('Unable to login!');
        } else {
          adminToken = token;
        }
      });

      const user2 = await users.insert({
        username: 'testuser',
        password: await bcrypt.hash('Password123', 12),
        active: true,
        role: 'member',
      });
      user2Id = user2._id;
      const payload2 = {
        _id: user2._id,
        username: user2.username,
        role: user2.role,
        active: user2.active,
      };
      jwt.sign(payload2, process.env.TOKEN_SECRET, { expiresIn: '1d' }, (err, token) => {
        if (err) {
          console.log('Unable to login!');
        } else {
          user2Token = token;
        }
      });

      const user3 = await users.insert({
        username: 'testuser2',
        password: await bcrypt.hash('Password123', 12),
        active: true,
        role: 'member',
      });
      user3Id = user3._id;
      const payload3 = {
        _id: user3._id,
        username: user3.username,
        role: user3.role,
        active: user3.active,
      };
      jwt.sign(payload3, process.env.TOKEN_SECRET, { expiresIn: '1d' }, (err, token) => {
        if (err) {
          console.log('Unable to login!');
        } else {
          user3Token = token;
        }
      });
    } else {
      console.log('Admin user already created.');
    }
  } catch (error) {
    console.log(error);
  }
}

describe('GET /api/v1/groups', () => {
  before(async () => {
    await users.remove({});
    await userGroups.remove({});
    await groups.remove({});
    await invites.remove({});
    await createAdminUser();
  });
  it('should require a loggedin user', async () => {
    const res = await request(app)
      .get('/api/v1/groups')
      .expect(401);
    expect(res.body.message).to.equal('Unauthorized');
  });
  it('should respond with a array of groups', async () => {
    const res = await request(app)
      .get('/api/v1/groups')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body).to.be.an('array');
  });
});

describe('POST create /api/v1/groups', () => {
  it('should require a title', async () => {
    const res = await request(app)
      .post('/api/v1/groups')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(422);
    expect(res.body.message).to.equal('"title" is required');
  });
  it('should create group', async () => {
    const res = await request(app)
      .post('/api/v1/groups')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Test AG' })
      .expect(200);
    expect(res.body).to.have.property('_id');
    groupId = res.body._id;
    const entry = await userGroups.findOne({ user: adminId, group: groupId });
    expect(entry).to.be.null; // eslint-disable-line
  });
  it('should require a non-existing group', async () => {
    const res = await request(app)
      .post('/api/v1/groups')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Test AG' })
      .expect(409);
    expect(res.body.message).to.equal('Grouptitle already exists. Choose another one');
  });
});

describe('PUT errors /api/v1/groups', () => {
  it('should require a state bool', async () => {
    const res = await request(app)
      .put(`/api/v1/groups/${groupId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(422);
    expect(res.body.message).to.equal('"state" is required');
  });
  it('should require a not already joined user', async () => {
    const res = await request(app)
      .put(`/api/v1/groups/${groupId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ state: true })
      .expect(422);
    expect(res.body.message).to.equal('User already in this group');
  });
  it('should require an invite', async () => {
    const res = await request(app)
      .put(`/api/v1/groups/${groupId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ state: true })
      .expect(401);
    expect(res.body.message).to.equal('No Invite');
  });
  it('should require a already joined user', async () => {
    const res = await request(app)
      .put(`/api/v1/groups/${groupId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ state: false })
      .expect(422);
    expect(res.body.message).to.equal('User is not in this group');
  });
  it('should require a non-admin user', async () => {
    const res = await request(app)
      .put(`/api/v1/groups/${groupId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ state: false })
      .expect(403);
    expect(res.body.message).to.equal('The admin cannot leave his group');
  });
});

describe('POST invite /api/v1/groups', () => {
  it('should require a existing user', async () => {
    const res = await request(app)
      .post(`/api/v1/groups/${groupId}/aaaaaaaaaaaaaaaaaaaaaaaa`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(422);
    expect(res.body.message).to.equal('Unable to fetch inputs');
  });
  it('should require a existing group', async () => {
    const res = await request(app)
      .post(`/api/v1/groups/aaaaaaaaaaaaaaaaaaaaaaaa/${user2Id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(422);
    expect(res.body.message).to.equal('Unable to fetch inputs');
  });
  it('should require the groupadmin', async () => {
    const res = await request(app)
      .post(`/api/v1/groups/${groupId}/${user2Id}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({})
      .expect(401);
    expect(res.body.message).to.equal('Unauthorized');
  });
  it('should require a user not already in the group', async () => {
    const res = await request(app)
      .post(`/api/v1/groups/${groupId}/${adminId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(404);
    expect(res.body.message).to.equal('Unable to proceed');
  });
  it('should create invite', async () => {
    const res = await request(app)
      .post(`/api/v1/groups/${groupId}/${user2Id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(200);
    expect(res.body).to.have.property('_id');
  });
  it('should require non-existing invite', async () => {
    const res = await request(app)
      .post(`/api/v1/groups/${groupId}/${user2Id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(422);
    expect(res.body.message).to.equal('Invite already send');
  });
});

describe('PUT actually insert /api/v1/groups', () => {
  it('should insert user', async () => {
    const res = await request(app)
      .put(`/api/v1/groups/${groupId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ state: true })
      .expect(200);
    expect(res.body).to.have.property('_id');
    const entry = await invites.findOne({ user: user2Id, group: groupId });
    expect(entry).to.be.null; // eslint-disable-line
  });
  it('should remove user', async () => {
    const res = await request(app)
      .put(`/api/v1/groups/${groupId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ state: false })
      .expect(200);
    expect(res.body.message).to.equal('User removed from Group');
  });
});

describe('POST invite /api/v1/groups', () => {
  it('should create invite', async () => {
    const res = await request(app)
      .post(`/api/v1/groups/${groupId}/${user2Id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(200);
    expect(res.body).to.have.property('_id');
  });
});

describe('PUT actually insert /api/v1/groups', () => {
  it('should insert user', async () => {
    const res = await request(app)
      .put(`/api/v1/groups/${groupId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ state: true })
      .expect(200);
    expect(res.body).to.have.property('_id');
    const entry = await invites.findOne({ user: user2Id, group: groupId });
    expect(entry).to.be.null; // eslint-disable-line
  });
});

describe('PATCH /api/v1/groups', () => {
  it('should role or delete field', async () => {
    const res = await request(app)
      .patch(`/api/v1/groups/${groupId}/${user2Id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(422);
    expect(res.body.message).to.equal('"value" must contain at least one of [role, delete]');
  });
  it('should require existing group', async () => {
    const res = await request(app)
      .patch(`/api/v1/groups/aaaaaaaaaaaaaaaaaaaaaaaa/${user2Id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'member' })
      .expect(409);
    expect(res.body.message).to.equal('Group doesnt exists');
  });
  it('should require the groupadmin', async () => {
    const res = await request(app)
      .patch(`/api/v1/groups/${groupId}/${user2Id}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ role: 'member' })
      .expect(401);
    expect(res.body.message).to.equal('Unauthorized');
  });
  it('should require user to not be the groupadmin', async () => {
    const res = await request(app)
      .patch(`/api/v1/groups/${groupId}/${adminId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'member' })
      .expect(422);
    expect(res.body.message).to.equal('The role of the admin cannot by modified');
  });
  it('should require a user in the group', async () => {
    const res = await request(app)
      .patch(`/api/v1/groups/${groupId}/${user3Id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'member' })
      .expect(404);
    expect(res.body.message).to.equal('Unable to proceed');
  });
  it('should update role', async () => {
    const res = await request(app)
      .patch(`/api/v1/groups/${groupId}/${user2Id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' })
      .expect(200);
    expect(res.body.role).to.equal('admin');
  });
  it('should require true delete boolean', async () => {
    const res = await request(app)
      .patch(`/api/v1/groups/${groupId}/${user2Id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ delete: false })
      .expect(422);
    expect(res.body.message).to.equal('"delete" must be [true]');
  });
  it('should kick user from group', async () => {
    const res = await request(app)
      .patch(`/api/v1/groups/${groupId}/${user2Id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ delete: true })
      .expect(200);
    expect(res.body.message).to.equal('User kicked from Group');
  });
});

describe('DELETE /api/v1/groups', () => {
  it('should require existing group', async () => {
    const res = await request(app)
      .delete('/api/v1/groups/aaaaaaaaaaaaaaaaaaaaaaaa')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(409);
    expect(res.body.message).to.equal('Group doesnt exists');
  });
  it('should require the groupadmin', async () => {
    const res = await request(app)
      .delete(`/api/v1/groups/${groupId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({})
      .expect(401);
    expect(res.body.message).to.equal('Unauthorized');
  });
  it('should require the groupadmin', async () => {
    const res = await request(app)
      .delete(`/api/v1/groups/${groupId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(200);
    expect(res.body.message).to.equal('Group succesfully removed');
  });
});
