const request = require('supertest');
const express = require('express');

jest.mock('../src/services/auth.service');
jest.mock('../src/utils/oauth');

const authService = require('../src/services/auth.service');
const { verifyOAuthToken } = require('../src/utils/oauth');
const authRouter = require('../src/routes/auth.router');

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRouter);

const MOCK_USER = { id: 'uuid-1', name: '테스트', email: 'test@example.com', avatar_url: null };
const MOCK_PROVIDER_USER = { provider_id: 'gid-123', email: 'test@example.com', name: '테스트', avatar_url: null };
const FUTURE = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

beforeEach(() => jest.clearAllMocks());

// ── POST /api/v1/auth/social ──────────────────────────────────────────────────

describe('POST /api/v1/auth/social', () => {
  test('provider, id_token 누락 → 400', async () => {
    const res = await request(app).post('/api/v1/auth/social').send({});
    expect(res.status).toBe(400);
  });

  test('id_token 누락 → 400', async () => {
    const res = await request(app).post('/api/v1/auth/social').send({ provider: 'google' });
    expect(res.status).toBe(400);
  });

  test('지원하지 않는 provider → 400', async () => {
    const res = await request(app).post('/api/v1/auth/social').send({ provider: 'twitter', id_token: 'xxx' });
    expect(res.status).toBe(400);
  });

  test('provider 목록: google, apple, kakao 허용', async () => {
    for (const provider of ['google', 'apple', 'kakao']) {
      verifyOAuthToken.mockResolvedValue(MOCK_PROVIDER_USER);
      authService.findOrCreateUser.mockResolvedValue({ user: MOCK_USER, is_new_user: false });
      authService.saveRefreshToken.mockResolvedValue();
      const res = await request(app).post('/api/v1/auth/social').send({ provider, id_token: 'valid' });
      expect(res.status).toBe(200);
    }
  });

  test('잘못된 id_token → 401', async () => {
    verifyOAuthToken.mockRejectedValue(new Error('Invalid Google id_token'));
    const res = await request(app).post('/api/v1/auth/social').send({ provider: 'google', id_token: 'bad' });
    expect(res.status).toBe(401);
  });

  test('신규 유저 → is_new_user: true + 토큰 반환', async () => {
    verifyOAuthToken.mockResolvedValue(MOCK_PROVIDER_USER);
    authService.findOrCreateUser.mockResolvedValue({ user: MOCK_USER, is_new_user: true });
    authService.saveRefreshToken.mockResolvedValue();

    const res = await request(app).post('/api/v1/auth/social').send({ provider: 'google', id_token: 'valid' });
    expect(res.status).toBe(200);
    expect(res.body.is_new_user).toBe(true);
    expect(res.body.access_token).toBeDefined();
    expect(res.body.refresh_token).toBeDefined();
    expect(res.body.user.email).toBe(MOCK_USER.email);
  });

  test('기존 유저 → is_new_user: false', async () => {
    verifyOAuthToken.mockResolvedValue(MOCK_PROVIDER_USER);
    authService.findOrCreateUser.mockResolvedValue({ user: MOCK_USER, is_new_user: false });
    authService.saveRefreshToken.mockResolvedValue();

    const res = await request(app).post('/api/v1/auth/social').send({ provider: 'google', id_token: 'valid' });
    expect(res.status).toBe(200);
    expect(res.body.is_new_user).toBe(false);
  });

  test('응답에 user 객체 포함 (id, name, email, avatar_url)', async () => {
    verifyOAuthToken.mockResolvedValue(MOCK_PROVIDER_USER);
    authService.findOrCreateUser.mockResolvedValue({ user: MOCK_USER, is_new_user: false });
    authService.saveRefreshToken.mockResolvedValue();

    const res = await request(app).post('/api/v1/auth/social').send({ provider: 'kakao', id_token: 'valid' });
    expect(res.body.user).toMatchObject({ id: MOCK_USER.id, name: MOCK_USER.name, email: MOCK_USER.email });
  });
});

// ── POST /api/v1/auth/refresh ─────────────────────────────────────────────────

describe('POST /api/v1/auth/refresh', () => {
  test('refresh_token 누락 → 400', async () => {
    const res = await request(app).post('/api/v1/auth/refresh').send({});
    expect(res.status).toBe(400);
  });

  test('존재하지 않는 토큰 → 401', async () => {
    authService.findRefreshToken.mockResolvedValue(null);
    const res = await request(app).post('/api/v1/auth/refresh').send({ refresh_token: 'ghost' });
    expect(res.status).toBe(401);
  });

  test('폐기된 토큰 → 401', async () => {
    authService.findRefreshToken.mockResolvedValue({ id: 't1', user_id: 'u1', expires_at: FUTURE, is_revoked: true });
    const res = await request(app).post('/api/v1/auth/refresh').send({ refresh_token: 'revoked' });
    expect(res.status).toBe(401);
  });

  test('만료된 토큰 → 401', async () => {
    authService.findRefreshToken.mockResolvedValue({
      id: 't1', user_id: 'u1',
      expires_at: new Date(Date.now() - 1000),
      is_revoked: false,
    });
    const res = await request(app).post('/api/v1/auth/refresh').send({ refresh_token: 'expired' });
    expect(res.status).toBe(401);
  });

  test('유효한 토큰 → 200 + 새 access_token, refresh_token 반환', async () => {
    authService.findRefreshToken.mockResolvedValue({ id: 't1', user_id: 'u1', expires_at: FUTURE, is_revoked: false });
    authService.getUserById.mockResolvedValue(MOCK_USER);
    authService.revokeRefreshToken.mockResolvedValue({ id: 't1' });
    authService.saveRefreshToken.mockResolvedValue();

    const res = await request(app).post('/api/v1/auth/refresh').send({ refresh_token: 'valid' });
    expect(res.status).toBe(200);
    expect(res.body.access_token).toBeDefined();
    expect(res.body.refresh_token).toBeDefined();
  });

  test('토큰 갱신 시 기존 토큰 폐기 호출', async () => {
    authService.findRefreshToken.mockResolvedValue({ id: 't1', user_id: 'u1', expires_at: FUTURE, is_revoked: false });
    authService.getUserById.mockResolvedValue(MOCK_USER);
    authService.revokeRefreshToken.mockResolvedValue({ id: 't1' });
    authService.saveRefreshToken.mockResolvedValue();

    await request(app).post('/api/v1/auth/refresh').send({ refresh_token: 'valid' });
    expect(authService.revokeRefreshToken).toHaveBeenCalledWith('valid');
    expect(authService.saveRefreshToken).toHaveBeenCalled();
  });
});

// ── DELETE /api/v1/auth/logout ────────────────────────────────────────────────

describe('DELETE /api/v1/auth/logout', () => {
  test('refresh_token 누락 → 400', async () => {
    const res = await request(app).delete('/api/v1/auth/logout').send({});
    expect(res.status).toBe(400);
  });

  test('존재하지 않는 토큰 → 404', async () => {
    authService.revokeRefreshToken.mockResolvedValue(null);
    const res = await request(app).delete('/api/v1/auth/logout').send({ refresh_token: 'ghost' });
    expect(res.status).toBe(404);
  });

  test('유효한 토큰 → 204 No Content', async () => {
    authService.revokeRefreshToken.mockResolvedValue({ id: 't1' });
    const res = await request(app).delete('/api/v1/auth/logout').send({ refresh_token: 'valid' });
    expect(res.status).toBe(204);
  });

  test('로그아웃 시 revokeRefreshToken 호출', async () => {
    authService.revokeRefreshToken.mockResolvedValue({ id: 't1' });
    await request(app).delete('/api/v1/auth/logout').send({ refresh_token: 'valid' });
    expect(authService.revokeRefreshToken).toHaveBeenCalledWith('valid');
  });
});
