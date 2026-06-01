const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

const notificationRouter = require('../src/routes/notification.router');

const app = express();
app.use(express.json());
app.use('/api/v1/notifications', notificationRouter);

function makeToken(userId = 1) {
  return jwt.sign({ userId, email: 'test@example.com' }, JWT_SECRET, { expiresIn: '1h' });
}

const AUTH = { Authorization: `Bearer ${makeToken()}` };

describe('Notification API — auth enforcement', () => {
  const noAuthCases = [
    ['GET',   '/api/v1/notifications'],
    ['POST',  '/api/v1/notifications/read-all'],
    ['PATCH', '/api/v1/notifications/some-uuid/read'],
  ];

  test.each(noAuthCases)('%s %s → 401 without token', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path);
    expect(res.status).toBe(401);
  });
});

describe('Notification API — authenticated routes reach controller (no DB)', () => {
  test('GET /api/v1/notifications with token → not 401', async () => {
    const res = await request(app).get('/api/v1/notifications').set(AUTH);
    expect(res.status).not.toBe(401);
  });

  test('POST /api/v1/notifications/read-all with token → not 401', async () => {
    const res = await request(app).post('/api/v1/notifications/read-all').set(AUTH);
    expect(res.status).not.toBe(401);
  });

  test('PATCH /api/v1/notifications/some-id/read with token → not 401', async () => {
    const res = await request(app).patch('/api/v1/notifications/some-id/read').set(AUTH);
    expect(res.status).not.toBe(401);
  });
});
