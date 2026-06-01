const sessionsService = require('../services/sessions.service');

async function listSessions(req, res) {
  try {
    const { country, status, page = 1, limit = 20 } = req.query;
    const result = await sessionsService.getSessionsList({ country, status, page, limit });
    res.json(result);
  } catch (err) {
    console.error('[sessions] listSessions error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getLatestArticles(req, res) {
  try {
    const { country, category } = req.query;
    if (!country) return res.status(400).json({ error: 'country query param is required' });
    const articles = await sessionsService.getLatestSessionArticles({ country, category });
    res.json({ data: articles, total: articles.length });
  } catch (err) {
    console.error('[sessions] getLatestArticles error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getSession(req, res) {
  try {
    const session = await sessionsService.getSessionById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    console.error('[sessions] getSession error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getSessionArticles(req, res) {
  try {
    const { category } = req.query;
    const articles = await sessionsService.getSessionArticles(req.params.sessionId, { category });
    res.json({ data: articles, total: articles.length });
  } catch (err) {
    console.error('[sessions] getSessionArticles error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { listSessions, getLatestArticles, getSession, getSessionArticles };
