const pool = require('../db');

async function getNotifications(userId, { limit = 20, offset = 0, unread_only = false } = {}) {
  const conditions = ['user_id = $1'];
  const params = [userId];

  if (unread_only) {
    params.push(true);
    conditions.push(`is_read = $${params.length}`);
  }

  const where = conditions.join(' AND ');
  params.push(limit, offset);

  const { rows } = await pool.query(`
    SELECT id, type, title, body, is_read, related_session_id, related_article_id, created_at
    FROM notifications
    WHERE ${where}
    ORDER BY created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `, params);

  const { rows: countRows } = await pool.query(
    'SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE is_read = false)::int AS unread FROM notifications WHERE user_id = $1',
    [userId]
  );

  return { data: rows, ...countRows[0] };
}

async function markOneRead(userId, notificationId) {
  const { rows } = await pool.query(
    'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING id, is_read',
    [notificationId, userId]
  );
  return rows[0] || null;
}

async function markAllRead(userId) {
  const { rowCount } = await pool.query(
    'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
    [userId]
  );
  return { updated: rowCount };
}

module.exports = { getNotifications, markOneRead, markAllRead };
