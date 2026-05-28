const request = require('supertest');
const { generateTestToken } = require('../src/middlewares/auth');

// minimal app just for middleware testing
const express = require('express');
const { requireAuth } = require('../src/middlewares/auth');
const app = express();
app.use(express.json());
app.get('/protected', requireAuth, (req, res) => res.json({ userId: req.user.id }));
app.get('/public', (req, res) => res.json({ ok: true }));

describe('JWT 인증 미들웨어', () => {
  test('Authorization 헤더 없으면 401', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
  });

  test('잘못된 토큰이면 401', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
  });

  test('유효한 토큰이면 req.user 주입 후 200', async () => {
    const token = generateTestToken('test-uuid-123');
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('test-uuid-123');
  });

  test('공개 라우트는 토큰 없어도 200', async () => {
    const res = await request(app).get('/public');
    expect(res.status).toBe(200);
  });
});
