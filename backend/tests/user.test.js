const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

const userRouter = require('../src/routes/user.router');

const app = express();
app.use(express.json());
app.use('/api/v1/users', userRouter);

function makeToken(userId = 1) {
  return jwt.sign({ userId, email: 'test@example.com' }, JWT_SECRET, { expiresIn: '1h' });
}

const AUTH = { Authorization: `Bearer ${makeToken()}` };

describe('User API — auth enforcement', () => {
  const noAuthCases = [
    ['GET',    '/api/v1/users/me'],
    ['DELETE', '/api/v1/users/me'],
    ['GET',    '/api/v1/users/me/settings'],
    ['PUT',    '/api/v1/users/me/settings/theme'],
    ['PUT',    '/api/v1/users/me/countries'],
    ['PUT',    '/api/v1/users/me/categories'],
    ['PUT',    '/api/v1/users/me/notification-settings'],
  ];

  test.each(noAuthCases)('%s %s → 401 without token', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path);
    expect(res.status).toBe(401);
  });
});

describe('User API — input validation', () => {
  test('PUT /me/settings/theme with invalid theme → 400', async () => {
    const res = await request(app).put('/api/v1/users/me/settings/theme').set(AUTH).send({ theme: 'pink' });
    expect(res.status).toBe(400);
  });

  test('PUT /me/settings/theme with no body → 400', async () => {
    const res = await request(app).put('/api/v1/users/me/settings/theme').set(AUTH).send({});
    expect(res.status).toBe(400);
  });

  test('PUT /me/countries with empty array → 400', async () => {
    const res = await request(app).put('/api/v1/users/me/countries').set(AUTH).send({ country_ids: [] });
    expect(res.status).toBe(400);
  });

  test('PUT /me/categories with non-array → 400', async () => {
    const res = await request(app).put('/api/v1/users/me/categories').set(AUTH).send({ category_ids: 'all' });
    expect(res.status).toBe(400);
  });

  test('PUT /me/notification-settings with wrong types → 400', async () => {
    const res = await request(app)
      .put('/api/v1/users/me/notification-settings')
      .set(AUTH)
      .send({ session_update: 'yes', hot_issue: true, scrap_comment: false });
    expect(res.status).toBe(400);
  });
});

describe('User API — authenticated routes reach controller (no DB)', () => {
  test('GET /me with token → not 401', async () => {
    const res = await request(app).get('/api/v1/users/me').set(AUTH);
    expect(res.status).not.toBe(401);
  });

  test('GET /me/settings with token → not 401', async () => {
    const res = await request(app).get('/api/v1/users/me/settings').set(AUTH);
    expect(res.status).not.toBe(401);
  });
});
