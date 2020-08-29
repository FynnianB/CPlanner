const request = require('supertest');
const { expect } = require('chai');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';

const app = require('../../app');
const db = require('../../db/connection');

const notes = db.get('notes');
const users = db.get('users');

let adminToken = '';

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

describe('GET /api/v1/notes', () => {
  before(async () => {
    await notes.remove({});
    await createAdminUser();
  });
  it('should requirer a auth header', async () => {
    const res = await request(app)
      .get('/api/v1/notes')
      .expect(401);
    expect(res.body.message).to.equal('Unauthorized');
  });
  it('should respond with empty array', async () => {
    const res = await request(app)
      .get('/api/v1/notes')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body).to.be.an('array');
  });
});

describe('POST /api/v1/notes', () => {
  it('should require a title', async () => {
    const res = await request(app)
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(422);
    expect(res.body.message).to.equal('"title" is required');
  });
  it('should require a note', async () => {
    const res = await request(app)
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Titel' })
      .expect(422);
    expect(res.body.message).to.equal('"note" is required');
  });
  it('should insert a note', async () => {
    const res = await request(app)
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Titel', note: 'Inhalt' })
      .expect(200);
    expect(res.body).to.have.property('title');
    expect(res.body).to.have.property('note');
  });
});
