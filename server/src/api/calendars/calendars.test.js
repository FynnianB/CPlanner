const request = require('supertest');
const { expect } = require('chai');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';

const app = require('../../app');
const db = require('../../db/connection');

const users = db.get('users');
const dates = db.get('dates');

let userToken = '';
let userId = '';

async function createUser() {
  try {
    const user = await users.insert({
      username: 'CalendarUser',
      password: await bcrypt.hash('Password123', 12),
      active: true,
      role: 'user',
    });
    userId = user._id;
    const payload = {
      _id: user._id,
      username: user.username,
      role: user.role,
      active: user.active,
    };
    jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) {
        console.log('Unable to login!');
      } else {
        userToken = token;
      }
    });
  } catch (error) {
    console.log(error);
  }
}

describe('GET /api/v1/calendars', () => {
  before(async () => {
    await users.remove({});
    await dates.remove({});
    await createUser();
  });
  it('should list all dates', async () => {
    const res = await request(app)
      .get('/api/v1/calendars')
      .set('authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(res.body).to.be.an('array');
  });
});

describe('POST /api/v1/calendars', () => {
  it('should require a title', async () => {
    const res = await request(app)
      .post('/api/v1/calendars')
      .set('authorization', `Bearer ${userToken}`)
      .send({})
      .expect(422);
    expect(res.body.message).to.equal('"title" is required');
  });
  it('should require a from', async () => {
    const res = await request(app)
      .post('/api/v1/calendars')
      .set('authorization', `Bearer ${userToken}`)
      .send({ title: 'test' })
      .expect(422);
    expect(res.body.message).to.equal('"from" is required');
  });
  it('should require a valid from', async () => {
    const res = await request(app)
      .post('/api/v1/calendars')
      .set('authorization', `Bearer ${userToken}`)
      .send({ title: 'test', from: 'abc' })
      .expect(422);
    expect(res.body.message).to.equal('"from" must be a valid date');
  });
  it('should require a to', async () => {
    const res = await request(app)
      .post('/api/v1/calendars')
      .set('authorization', `Bearer ${userToken}`)
      .send({ title: 'test', from: '08-30-2020' })
      .expect(422);
    expect(res.body.message).to.equal('"to" is required');
  });
  it('should require a valid to', async () => {
    const res = await request(app)
      .post('/api/v1/calendars')
      .set('authorization', `Bearer ${userToken}`)
      .send({ title: 'test', from: '08-30-2020', to: 'abc' })
      .expect(422);
    expect(res.body.message).to.equal('"to" must be a valid date');
  });
  it('should require a valid to', async () => {
    const res = await request(app)
      .post('/api/v1/calendars')
      .set('authorization', `Bearer ${userToken}`)
      .send({ title: 'test', from: '08-30-2020', to: '07-30-2020' })
      .expect(422);
    expect(res.body.message).to.equal('"to" must be greater than or equal to "ref:from"');
  });
  it('should require a valid time', async () => {
    const res = await request(app)
      .post('/api/v1/calendars')
      .set('authorization', `Bearer ${userToken}`)
      .send({
        title: 'test',
        from: '08-30-2020',
        to: '08-30-2020',
        time: 'abc',
      })
      .expect(422);
    expect(res.body.message).to.equal('"time" with value "abc" fails to match the required pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/');
  });
  it('should insert date', async () => {
    const res = await request(app)
      .post('/api/v1/calendars')
      .set('authorization', `Bearer ${userToken}`)
      .send({
        title: 'test',
        from: '08-30-2020',
        to: '08-30-2020',
        time: '23:49',
      })
      .expect(200);
    expect(res.body).to.have.property('_id');
  });
});
