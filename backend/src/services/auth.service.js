const pool = require('../db');

async function findOrCreateUser({ provider, provider_id, email, name, avatar_url }) {
  const { rows: existing } = await pool.query(
    'SELECT id, name, email, avatar_url, provider, created_at FROM users WHERE provider = $1 AND provider_id = $2',
    [provider, provider_id]
  );
  if (existing[0]) return { user: existing[0], is_new_user: false };

  const { rows: created } = await pool.query(
    `INSERT INTO users (name, email, avatar_url, provider, provider_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, avatar_url, provider, created_at`,
    [name, email, avatar_url, provider, provider_id]
  );
  return { user: created[0], is_new_user: true };
}

async function saveRefreshToken(userId, token, expiresAt) {
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );
}

async function findRefreshToken(token) {
  const { rows } = await pool.query(
    'SELECT id, user_id, expires_at, is_revoked FROM refresh_tokens WHERE token = $1',
    [token]
  );
  return rows[0] || null;
}

async function revokeRefreshToken(token) {
  const { rows } = await pool.query(
    'UPDATE refresh_tokens SET is_revoked = true WHERE token = $1 RETURNING id',
    [token]
  );
  return rows[0] || null;
}

async function getUserById(userId) {
  const { rows } = await pool.query(
    'SELECT id, name, email, avatar_url, created_at FROM users WHERE id = $1',
    [userId]
  );
  return rows[0] || null;
}

module.exports = { findOrCreateUser, saveRefreshToken, findRefreshToken, revokeRefreshToken, getUserById };
