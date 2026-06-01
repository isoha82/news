const pool = require('../db');

async function getSystemStats() {
  const [
    { rows: articles },
    { rows: sessions },
    { rows: successfulCrawls },
    { rows: lastCrawl },
    { rows: users },
  ] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS count FROM articles'),
    pool.query('SELECT COUNT(*)::int AS count FROM sessions'),
    pool.query("SELECT COUNT(*)::int AS count FROM crawl_logs WHERE status = 'success'"),
    pool.query('SELECT started_at FROM crawl_logs ORDER BY started_at DESC LIMIT 1'),
    pool.query('SELECT COUNT(*)::int AS count FROM users'),
  ]);

  return {
    total_articles:    articles[0].count,
    total_sessions:    sessions[0].count,
    successful_crawls: successfulCrawls[0].count,
    total_users:       users[0].count,
    last_crawl_at:     lastCrawl[0]?.started_at || null,
  };
}

async function forceDeleteSession(sessionId) {
  const { rows } = await pool.query(
    'DELETE FROM sessions WHERE id = $1 RETURNING id',
    [sessionId]
  );
  return rows[0] || null;
}

async function getCrawlLogs({ page = 1, limit = 20 }) {
  const offset = (Number(page) - 1) * Number(limit);

  const [{ rows }, { rows: countRows }] = await Promise.all([
    pool.query(`
      SELECT
        cl.id, cl.started_at, cl.finished_at, cl.status,
        cl.error_message, cl.articles_collected,
        c.code AS country_code, c.name AS country_name
      FROM crawl_logs cl
      JOIN countries c ON c.id = cl.country_id
      ORDER BY cl.started_at DESC
      LIMIT $1 OFFSET $2
    `, [Number(limit), offset]),
    pool.query('SELECT COUNT(*)::int AS count FROM crawl_logs'),
  ]);

  return {
    data: rows,
    total: countRows[0].count,
    page: Number(page),
    limit: Number(limit),
  };
}

async function getCurrentCrawlStatus() {
  const { rows } = await pool.query(`
    SELECT
      c.code  AS country_code,
      c.name  AS country_name,
      s.status         AS session_status,
      s.started_at     AS session_started_at,
      s.finished_at    AS session_finished_at
    FROM countries c
    LEFT JOIN LATERAL (
      SELECT status, started_at, finished_at
      FROM sessions
      WHERE country_id = c.id
      ORDER BY started_at DESC
      LIMIT 1
    ) s ON true
    ORDER BY c.id ASC
  `);
  return rows;
}

module.exports = {
  getSystemStats,
  forceDeleteSession,
  getCrawlLogs,
  getCurrentCrawlStatus,
};
