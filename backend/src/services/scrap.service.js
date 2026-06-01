const pool = require('../db');

async function addScrap(userId, { article_id, folder_id = null }) {
  const { rows } = await pool.query(`
    INSERT INTO scraps (user_id, article_id, folder_id)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, article_id) DO UPDATE SET folder_id = EXCLUDED.folder_id
    RETURNING id, user_id, article_id, folder_id, created_at
  `, [userId, article_id, folder_id]);
  return rows[0];
}

async function deleteScrap(userId, scrapId) {
  const { rows } = await pool.query(
    'DELETE FROM scraps WHERE id = $1 AND user_id = $2 RETURNING id',
    [scrapId, userId]
  );
  return rows[0] || null;
}

async function moveScrap(userId, scrapId, folderId) {
  const { rows } = await pool.query(
    'UPDATE scraps SET folder_id = $1 WHERE id = $2 AND user_id = $3 RETURNING id, folder_id',
    [folderId, scrapId, userId]
  );
  return rows[0] || null;
}

async function getFolders(userId) {
  const { rows } = await pool.query(`
    SELECT
      sf.id, sf.name, sf.icon, sf.created_at,
      COUNT(s.id)::int AS scrap_count,
      MAX(s.created_at) AS last_added_at
    FROM scrap_folders sf
    LEFT JOIN scraps s ON s.folder_id = sf.id
    WHERE sf.user_id = $1
    GROUP BY sf.id
    ORDER BY sf.created_at DESC
  `, [userId]);

  const { rows: totalRows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM scraps WHERE user_id = $1',
    [userId]
  );

  return { folders: rows, total_scraps: totalRows[0].count };
}

async function createFolder(userId, { name, icon }) {
  const { rows } = await pool.query(`
    INSERT INTO scrap_folders (user_id, name, icon)
    VALUES ($1, $2, $3)
    RETURNING id, name, icon, created_at
  `, [userId, name, icon]);
  return rows[0];
}

async function getFolderArticles(userId, folderId) {
  const { rows: folderRows } = await pool.query(
    'SELECT id, name, icon FROM scrap_folders WHERE id = $1 AND user_id = $2',
    [folderId, userId]
  );
  if (!folderRows[0]) return null;

  const { rows } = await pool.query(`
    SELECT
      s.id AS scrap_id, s.created_at AS scrapped_at,
      a.id AS article_id, a.title, a.original_url, a.source_domain, a.published_at,
      cat.slug AS category_slug, cat.name_ko AS category_name
    FROM scraps s
    JOIN articles a   ON a.id   = s.article_id
    JOIN categories cat ON cat.id = a.category_id
    WHERE s.folder_id = $1 AND s.user_id = $2
    ORDER BY s.created_at DESC
  `, [folderId, userId]);

  return { folder: { ...folderRows[0], scrap_count: rows.length }, data: rows };
}

async function deleteFolder(userId, folderId) {
  // ON DELETE SET NULL → 내부 scraps.folder_id = NULL 처리됨
  const { rows } = await pool.query(
    'DELETE FROM scrap_folders WHERE id = $1 AND user_id = $2 RETURNING id',
    [folderId, userId]
  );
  return rows[0] || null;
}

module.exports = {
  addScrap, deleteScrap, moveScrap,
  getFolders, createFolder, getFolderArticles, deleteFolder,
};
