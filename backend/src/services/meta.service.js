const pool = require('../db');

async function getCountries() {
  const { rows } = await pool.query(
    'SELECT id, code, name, source_name, source_base_url FROM countries ORDER BY id ASC'
  );
  return rows;
}

async function getCategories() {
  const { rows } = await pool.query(
    'SELECT id, slug, name_ko, name_en, color, text_color FROM categories ORDER BY id ASC'
  );
  return rows;
}

async function getFeedStatus() {
  // 국가별 최근 크롤링 로그를 LATERAL JOIN으로 한 번에 조회
  const { rows } = await pool.query(`
    SELECT
      c.code  AS country_code,
      c.name  AS country_name,
      cl.status,
      cl.started_at,
      cl.finished_at,
      cl.articles_collected,
      cl.error_message
    FROM countries c
    LEFT JOIN LATERAL (
      SELECT status, started_at, finished_at, articles_collected, error_message
      FROM crawl_logs
      WHERE country_id = c.id
      ORDER BY started_at DESC
      LIMIT 1
    ) cl ON true
    ORDER BY c.id ASC
  `);
  return rows;
}

module.exports = { getCountries, getCategories, getFeedStatus };
