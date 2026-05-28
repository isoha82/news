const pool = require('../db');

async function getNewsList({ country, category, page = 1, limit = 20 }) {
  const offset = (Number(page) - 1) * Number(limit);
  const conditions = [];
  const values = [];
  let idx = 1;

  if (country) {
    conditions.push(`c.code = $${idx++}`);
    values.push(country);
  }
  if (category) {
    conditions.push(`cat.slug = $${idx++}`);
    values.push(category);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(`
    SELECT
      a.id, a.title, a.original_url, a.source_domain, a.rank,
      a.trend_score, a.comment_count, a.published_at, a.created_at,
      c.code  AS country_code,  c.name  AS country_name,
      cat.slug AS category_slug, cat.name_ko AS category_name,
      cat.color, cat.text_color,
      s.id AS session_id,
      asm.bullet1, asm.bullet2, asm.bullet3
    FROM articles a
    JOIN sessions  s   ON s.id   = a.session_id
    JOIN countries c   ON c.id   = s.country_id
    JOIN categories cat ON cat.id = a.category_id
    LEFT JOIN article_summaries asm ON asm.article_id = a.id
    ${where}
    ORDER BY a.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `, [...values, Number(limit), offset]);

  const { rows: countRows } = await pool.query(`
    SELECT COUNT(*) FROM articles a
    JOIN sessions  s   ON s.id   = a.session_id
    JOIN countries c   ON c.id   = s.country_id
    JOIN categories cat ON cat.id = a.category_id
    ${where}
  `, values);

  return {
    data: rows,
    total: parseInt(countRows[0].count),
    page: Number(page),
    limit: Number(limit),
  };
}

async function getArticleById(articleId) {
  const { rows } = await pool.query(`
    SELECT
      a.id, a.title, a.original_url, a.source_domain, a.rank,
      a.trend_score, a.comment_count, a.published_at, a.created_at,
      c.code  AS country_code,  c.name  AS country_name,
      cat.slug AS category_slug, cat.name_ko AS category_name,
      cat.color, cat.text_color,
      s.id AS session_id, s.started_at AS session_started_at,
      asm.bullet1, asm.bullet2, asm.bullet3, asm.generated_at AS summary_generated_at
    FROM articles a
    JOIN sessions  s   ON s.id   = a.session_id
    JOIN countries c   ON c.id   = s.country_id
    JOIN categories cat ON cat.id = a.category_id
    LEFT JOIN article_summaries asm ON asm.article_id = a.id
    WHERE a.id = $1
  `, [articleId]);

  return rows[0] || null;
}

async function getArticleComments(articleId) {
  const { rows } = await pool.query(`
    SELECT id, masked_author, content, likes, dislikes, posted_ago, sort_order
    FROM article_comments
    WHERE article_id = $1
    ORDER BY sort_order ASC
  `, [articleId]);

  return rows;
}

module.exports = { getNewsList, getArticleById, getArticleComments };
