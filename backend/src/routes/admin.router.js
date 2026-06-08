const { Router } = require('express');
const ctrl = require('../controllers/admin.controller');

const router = Router();

// GET /api/v1/admin/stats
router.get('/stats', ctrl.getStats);

// GET  /api/v1/admin/crawl/logs?page=1&limit=20
router.get('/crawl/logs', ctrl.getCrawlLogs);

// GET  /api/v1/admin/crawl/status
router.get('/crawl/status', ctrl.getCrawlStatus);

// POST /api/v1/admin/crawl/trigger
router.post('/crawl/trigger', ctrl.triggerCrawl);

// DELETE /api/v1/admin/sessions/:sessionId
router.delete('/sessions/:sessionId', ctrl.deleteSession);

module.exports = router;
