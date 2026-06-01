const { Router } = require('express');
const ctrl = require('../controllers/news.controller');

const router = Router();

// GET /api/v1/news?country=kr&category=politics&page=1&limit=20
router.get('/', ctrl.listNews);

// GET /api/v1/news/:articleId
router.get('/:articleId', ctrl.getArticle);

// GET /api/v1/news/:articleId/comments
router.get('/:articleId/comments', ctrl.getComments);

module.exports = router;
