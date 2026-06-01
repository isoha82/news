const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authService = require('../services/auth.service');
const { verifyOAuthToken } = require('../utils/oauth');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const REFRESH_EXPIRES_DAYS = 30;
const SUPPORTED_PROVIDERS = ['google', 'apple', 'kakao'];

function generateAccessToken(userId, email) {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '1h' });
}

function generateRefreshToken() {
  return crypto.randomBytes(48).toString('hex');
}

async function socialLogin(req, res) {
  const { provider, id_token } = req.body;

  if (!provider || !id_token) {
    return res.status(400).json({ error: 'provider and id_token are required' });
  }
  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    return res.status(400).json({ error: `provider must be one of: ${SUPPORTED_PROVIDERS.join(', ')}` });
  }

  try {
    const providerUser = await verifyOAuthToken(provider, id_token);
    const { user, is_new_user } = await authService.findOrCreateUser({
      provider,
      provider_id: providerUser.provider_id,
      email: providerUser.email,
      name: providerUser.name,
      avatar_url: providerUser.avatar_url,
    });

    const access_token = generateAccessToken(user.id, user.email);
    const refresh_token = generateRefreshToken();
    const expires_at = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
    await authService.saveRefreshToken(user.id, refresh_token, expires_at);

    return res.json({
      access_token,
      refresh_token,
      is_new_user,
      user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url },
    });
  } catch (err) {
    console.error('[auth] socialLogin:', err.message);
    if (err.message.startsWith('Invalid')) {
      return res.status(401).json({ error: 'Invalid id_token' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function refresh(req, res) {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(400).json({ error: 'refresh_token is required' });
  }

  try {
    const record = await authService.findRefreshToken(refresh_token);
    if (!record) return res.status(401).json({ error: 'Invalid refresh token' });
    if (record.is_revoked) return res.status(401).json({ error: 'Refresh token has been revoked' });
    if (new Date(record.expires_at) < new Date()) return res.status(401).json({ error: 'Refresh token has expired' });

    const user = await authService.getUserById(record.user_id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    await authService.revokeRefreshToken(refresh_token);
    const new_access_token = generateAccessToken(user.id, user.email);
    const new_refresh_token = generateRefreshToken();
    const expires_at = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
    await authService.saveRefreshToken(user.id, new_refresh_token, expires_at);

    return res.json({ access_token: new_access_token, refresh_token: new_refresh_token });
  } catch (err) {
    console.error('[auth] refresh:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function logout(req, res) {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(400).json({ error: 'refresh_token is required' });
  }

  try {
    const revoked = await authService.revokeRefreshToken(refresh_token);
    if (!revoked) return res.status(404).json({ error: 'Refresh token not found' });
    return res.status(204).end();
  } catch (err) {
    console.error('[auth] logout:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { socialLogin, refresh, logout };
