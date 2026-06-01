const newsService = require('../services/news.service');

async function listNews(req, res) {
  try {
    const { country, category, page = 1, limit = 20 } = req.query;
    const result = await newsService.getNewsList({ country, category, page, limit });
    res.json(result);
  } catch (err) {
    console.error('[news] listNews error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getArticle(req, res) {
  try {
    const article = await newsService.getArticleById(req.params.articleId);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    console.error('[news] getArticle error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getComments(req, res) {
  try {
    const comments = await newsService.getArticleComments(req.params.articleId);
    res.json({ data: comments, total: comments.length });
  } catch (err) {
    console.error('[news] getComments error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { listNews, getArticle, getComments };
