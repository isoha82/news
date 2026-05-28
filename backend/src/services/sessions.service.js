const pool = require('../db');

async function getSessionsList({ country, status, page = 1, limit = 20 }) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (country) {
    conditions.push(`c.code = $${idx++}`);
    values.push(country);
  }
  if (status) {
    conditions.push(`s.status = $${idx++}`);
    values.push(status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(limit);

  const { rows } = await pool.query(`
    SELECT
      s.id, s.started_at, s.finished_at, s.status,
      s.is_current, s.session_order,
      c.code AS country_code, c.name AS country_name,
      COUNT(a.id)::int AS article_count
    FROM sessions s
    JOIN countries c ON c.id = s.country_id
    LEFT JOIN articles a ON a.session_id = s.id
    ${where}
    GROUP BY s.id, c.code, c.name
    ORDER BY s.started_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `, [...values, Number(limit), offset]);

  const { rows: countRows } = await pool.query(`
    SELECT COUNT(*) FROM sessions s
    JOIN countries c ON c.id = s.country_id
    ${where}
  `, values);

  return {
    data: rows,
    total: parseInt(countRows[0].count),
    page: Number(page),
    limit: Number(limit),
  };
}

async function getSessionById(sessionId) {
  const { rows } = await pool.query(`
    SELECT
      s.id, s.started_at, s.finished_at, s.status,
      s.is_current, s.session_order,
      c.code AS country_code, c.name AS country_name,
      COUNT(a.id)::int AS article_count
    FROM sessions s
    JOIN countries c ON c.id = s.country_id
    LEFT JOIN articles a ON a.session_id = s.id
    WHERE s.id = $1
    GROUP BY s.id, c.code, c.name
  `, [sessionId]);

  return rows[0] || null;
}

async function getSessionArticles(sessionId, { category } = {}) {
  const conditions = ['a.session_id = $1'];
  const values = [sessionId];
  let idx = 2;

  if (category) {
    conditions.push(`cat.slug = $${idx++}`);
    values.push(category);
  }

  const { rows } = await pool.query(`
    SELECT
      a.id, a.title, a.original_url, a.source_domain, a.rank,
      a.trend_score, a.comment_count, a.published_at, a.created_at,
      cat.slug AS category_slug, cat.name_ko AS category_name,
      cat.color, cat.text_color,
      asm.bullet1, asm.bullet2, asm.bullet3
    FROM articles a
    JOIN categories cat ON cat.id = a.category_id
    LEFT JOIN article_summaries asm ON asm.article_id = a.id
    WHERE ${conditions.join(' AND ')}
    ORDER BY cat.id ASC, a.rank ASC
  `, values);

  return rows;
}

async function getLatestSessionArticles({ country, category }) {
  if (!country) throw new Error('country is required');

  const values = [country];
  let idx = 2;

  let categoryFilter = '';
  if (category) {
    categoryFilter = `AND cat.slug = $${idx++}`;
    values.push(category);
  }

  const { rows } = await pool.query(`
    SELECT
      a.id, a.title, a.original_url, a.source_domain, a.rank,
      a.trend_score, a.comment_count, a.published_at, a.created_at,
      cat.slug AS category_slug, cat.name_ko AS category_name,
      cat.color, cat.text_color,
      s.id AS session_id, s.started_at AS session_started_at,
      asm.bullet1, asm.bullet2, asm.bullet3
    FROM sessions s
    JOIN countries c ON c.id = s.country_id
    JOIN articles a ON a.session_id = s.id
    JOIN categories cat ON cat.id = a.category_id
    LEFT JOIN article_summaries asm ON asm.article_id = a.id
    WHERE c.code = $1 AND s.is_current = true ${categoryFilter}
    ORDER BY cat.id ASC, a.rank ASC
  `, values);

  return rows;
}

module.exports = {
  getSessionsList,
  getSessionById,
  getSessionArticles,
  getLatestSessionArticles,
};
