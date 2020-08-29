const request = require('supertest');
const { expect } = require('chai');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';

const app = require('../../app');
const db = require('../../db/connection');

const users = db.get('users');

let adminToken = '';
let adminId = '';

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
    } else {
      console.log('Admin user already created.');
    }
  } catch (error) {
    console.log(error);
  }
}

describe('GET /api/v1/users', () => {
  before(async () => {
    await users.remove({});
    await createAdminUser();
  });
  it('should respond with a array of users', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body).to.be.an('array');
  });
});

describe('PATCH /api/v1/users:id', () => {
  it('should require existing userId', async () => {
    const res = await request(app)
      .patch('/api/v1/users/123tt423ttxt23')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(422);
    expect(res.body.message).to.equal('User not found');
  });
  it('should update AdminUser', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/${adminId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ active: false })
      .expect(200);
    expect(res.body.active).to.equal(false);
  });
});
