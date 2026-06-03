const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// Minimal app to test scrap routes without a real DB
// DB calls will throw → 500, which is fine (we only care about auth enforcement)
const scrapRouter = require('../src/routes/scrap.router');

const app = express();
app.use(express.json());
app.use('/api/v1/scraps', scrapRouter);

function makeToken(userId = 1) {
  return jwt.sign({ userId, email: 'test@example.com' }, JWT_SECRET, { expiresIn: '1h' });
}

const AUTH = { Authorization: `Bearer ${makeToken()}` };

describe('Scrap API — auth enforcement', () => {
  const noAuthCases = [
    ['POST',   '/api/v1/scraps'],
    ['DELETE', '/api/v1/scraps/1'],
    ['PATCH',  '/api/v1/scraps/1'],
    ['GET',    '/api/v1/scraps/folders'],
    ['POST',   '/api/v1/scraps/folders'],
    ['GET',    '/api/v1/scraps/folders/1'],
    ['DELETE', '/api/v1/scraps/folders/1'],
  ];

  test.each(noAuthCases)('%s %s → 401 without token', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path);
    expect(res.status).toBe(401);
  });
});

describe('Scrap API — authenticated routes reach controller (no DB)', () => {
  test('POST /api/v1/scraps without article_id → 400', async () => {
    const res = await request(app).post('/api/v1/scraps').set(AUTH).send({});
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/scraps/folders without name → 400', async () => {
    const res = await request(app).post('/api/v1/scraps/folders').set(AUTH).send({});
    expect(res.status).toBe(400);
  });

  test('DELETE /api/v1/scraps/1 with token → not 401', async () => {
    const res = await request(app).delete('/api/v1/scraps/1').set(AUTH);
    expect(res.status).not.toBe(401);
  });

  test('GET /api/v1/scraps/folders with token → not 401', async () => {
    const res = await request(app).get('/api/v1/scraps/folders').set(AUTH);
    expect(res.status).not.toBe(401);
  });
});
