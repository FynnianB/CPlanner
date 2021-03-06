const express = require('express');
const helmet = require('helmet');
const volleyball = require('volleyball');
const cors = require('cors');

require('dotenv').config();

const app = express();

const middlewares = require('./auth/auth.middlewares');

const auth = require('./auth/auth.routes');
const groups = require('./api/groups/groups.routes');
const { users, user } = require('./api/users/users.routes');
const invites = require('./api/invites/invites.routes');
const calendars = require('./api/calendars/calendars.routes');
const notifications = require('./api/notifications/notifications.routes');
const disabled = require('./api/disabled/disabled.routes');

const client = process.env.CLIENT_URL/* || 'http://localhost:8080' */;

app.use(volleyball);
app.use(cors({
  origin: [client, 'https://fynnianb.github.io'],
}));
app.use(express.json());
app.use(helmet());
app.use(middlewares.checkTokenSetUser);

app.get('/', (req, res) => {
  res.json({
    message: 'Hi! Working...',
  });
});

app.use('/auth', auth);
app.use('/api/v1/calendars', middlewares.isLoggedIn, calendars);
app.use('/api/v1/groups', middlewares.isLoggedIn, groups);
app.use('/api/v1/invites', middlewares.isLoggedIn, invites);
app.use('/api/v1/notifications', middlewares.isLoggedIn, notifications);
app.use('/api/v1/users', middlewares.isLoggedIn, user);
app.use('/api/v1/disabled', middlewares.isLoggedIn, disabled);
app.use('/api/v1/admin/users', middlewares.isLoggedIn, middlewares.isAdmin, users);

function notFound(req, res, next) {
  res.status(404);
  const error = new Error('Not Found -', req.originalUrl);
  next(error);
}

function errorHandler(err, req, res, next) {
  res.status(res.statusCode || 500);
  res.json({
    message: err.message,
    stack: err.stack,
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
