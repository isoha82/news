const { Router } = require('express');
const ctrl = require('../controllers/sessions.controller');

const router = Router();

// GET /api/v1/sessions?country=kr&status=completed&page=1&limit=20
router.get('/', ctrl.listSessions);

// GET /api/v1/sessions/latest/articles?country=kr&category=politics
// NOTE: 반드시 /:sessionId 보다 먼저 등록해야 'latest' 가 파라미터로 잘못 매칭되지 않음
router.get('/latest/articles', ctrl.getLatestArticles);

// GET /api/v1/sessions/:sessionId
router.get('/:sessionId', ctrl.getSession);

// GET /api/v1/sessions/:sessionId/articles?category=tech
router.get('/:sessionId/articles', ctrl.getSessionArticles);

module.exports = router;
