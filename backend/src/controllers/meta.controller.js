const metaService = require('../services/meta.service');

async function listCountries(req, res) {
  try {
    const data = await metaService.getCountries();
    res.json({ data });
  } catch (err) {
    console.error('[meta] listCountries error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function listCategories(req, res) {
  try {
    const data = await metaService.getCategories();
    res.json({ data });
  } catch (err) {
    console.error('[meta] listCategories error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getFeedStatus(req, res) {
  try {
    const data = await metaService.getFeedStatus();
    res.json({ data });
  } catch (err) {
    console.error('[meta] getFeedStatus error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { listCountries, listCategories, getFeedStatus };
