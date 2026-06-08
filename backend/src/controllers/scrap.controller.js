const scrapService = require('../services/scrap.service');

async function addScrap(req, res) {
  try {
    const { article_id, folder_id } = req.body;
    if (!article_id) return res.status(400).json({ error: 'article_id is required' });
    const scrap = await scrapService.addScrap(req.user.id, { article_id, folder_id });
    res.status(201).json(scrap);
  } catch (err) {
    console.error('[scrap] addScrap:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteScrap(req, res) {
  try {
    const deleted = await scrapService.deleteScrap(req.user.id, req.params.scrapId);
    if (!deleted) return res.status(404).json({ error: 'Scrap not found' });
    res.status(204).end();
  } catch (err) {
    console.error('[scrap] deleteScrap:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function moveScrap(req, res) {
  try {
    const { folder_id } = req.body;
    const updated = await scrapService.moveScrap(req.user.id, req.params.scrapId, folder_id);
    if (!updated) return res.status(404).json({ error: 'Scrap not found' });
    res.json(updated);
  } catch (err) {
    console.error('[scrap] moveScrap:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getFolders(req, res) {
  try {
    const result = await scrapService.getFolders(req.user.id);
    res.json(result);
  } catch (err) {
    console.error('[scrap] getFolders:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function createFolder(req, res) {
  try {
    const { name, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const folder = await scrapService.createFolder(req.user.id, { name, icon });
    res.status(201).json(folder);
  } catch (err) {
    console.error('[scrap] createFolder:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getFolderArticles(req, res) {
  try {
    const result = await scrapService.getFolderArticles(req.user.id, req.params.folderId);
    if (!result) return res.status(404).json({ error: 'Folder not found' });
    res.json(result);
  } catch (err) {
    console.error('[scrap] getFolderArticles:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteFolder(req, res) {
  try {
    const deleted = await scrapService.deleteFolder(req.user.id, req.params.folderId);
    if (!deleted) return res.status(404).json({ error: 'Folder not found' });
    res.status(204).end();
  } catch (err) {
    console.error('[scrap] deleteFolder:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { addScrap, deleteScrap, moveScrap, getFolders, createFolder, getFolderArticles, deleteFolder };
