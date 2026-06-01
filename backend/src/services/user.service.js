const pool = require('../db');

async function getMe(userId) {
  const { rows } = await pool.query(
    'SELECT id, name, email, avatar_url, provider, created_at FROM users WHERE id = $1',
    [userId]
  );
  return rows[0] || null;
}

async function deleteMe(userId) {
  const { rows } = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [userId]
  );
  return rows[0] || null;
}

async function getSettings(userId) {
  const { rows: settingsRows } = await pool.query(
    'SELECT theme FROM user_settings WHERE user_id = $1',
    [userId]
  );

  const { rows: countryRows } = await pool.query(`
    SELECT c.id, c.code, c.name, uc.enabled
    FROM user_countries uc
    JOIN countries c ON c.id = uc.country_id
    WHERE uc.user_id = $1
  `, [userId]);

  const { rows: categoryRows } = await pool.query(`
    SELECT cat.id, cat.slug, cat.name_ko
    FROM user_categories uc
    JOIN categories cat ON cat.id = uc.category_id
    WHERE uc.user_id = $1
  `, [userId]);

  const { rows: notifRows } = await pool.query(
    'SELECT session_update, hot_issue, scrap_comment FROM user_notification_settings WHERE user_id = $1',
    [userId]
  );

  return {
    theme: settingsRows[0]?.theme ?? 'light',
    countries: countryRows,
    categories: categoryRows,
    notification_settings: notifRows[0] ?? { session_update: true, hot_issue: true, scrap_comment: false },
  };
}

async function updateTheme(userId, theme) {
  const { rows } = await pool.query(`
    INSERT INTO user_settings (user_id, theme)
    VALUES ($1, $2)
    ON CONFLICT (user_id) DO UPDATE SET theme = EXCLUDED.theme
    RETURNING theme
  `, [userId, theme]);
  return rows[0];
}

async function updateCountries(userId, countryIds) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM user_countries WHERE user_id = $1', [userId]);
    for (const id of countryIds) {
      await client.query(
        'INSERT INTO user_countries (user_id, country_id, enabled) VALUES ($1, $2, true) ON CONFLICT DO NOTHING',
        [userId, id]
      );
    }
    await client.query('COMMIT');
    const { rows } = await client.query(`
      SELECT c.id, c.code, c.name, uc.enabled
      FROM user_countries uc JOIN countries c ON c.id = uc.country_id
      WHERE uc.user_id = $1
    `, [userId]);
    return rows;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updateCategories(userId, categoryIds) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM user_categories WHERE user_id = $1', [userId]);
    for (const id of categoryIds) {
      await client.query(
        'INSERT INTO user_categories (user_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, id]
      );
    }
    await client.query('COMMIT');
    const { rows } = await client.query(`
      SELECT cat.id, cat.slug, cat.name_ko
      FROM user_categories uc JOIN categories cat ON cat.id = uc.category_id
      WHERE uc.user_id = $1
    `, [userId]);
    return rows;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updateNotificationSettings(userId, { session_update, hot_issue, scrap_comment }) {
  const { rows } = await pool.query(`
    INSERT INTO user_notification_settings (user_id, session_update, hot_issue, scrap_comment)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id) DO UPDATE
      SET session_update = EXCLUDED.session_update,
          hot_issue      = EXCLUDED.hot_issue,
          scrap_comment  = EXCLUDED.scrap_comment
    RETURNING session_update, hot_issue, scrap_comment
  `, [userId, session_update, hot_issue, scrap_comment]);
  return rows[0];
}

module.exports = {
  getMe, deleteMe, getSettings,
  updateTheme, updateCountries, updateCategories, updateNotificationSettings,
};
