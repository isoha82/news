const adminService = require('../services/admin.service');

async function getStats(req, res) {
  try {
    const stats = await adminService.getSystemStats();
    res.json(stats);
  } catch (err) {
    console.error('[admin] getStats error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteSession(req, res) {
  try {
    const deleted = await adminService.forceDeleteSession(req.params.sessionId);
    if (!deleted) return res.status(404).json({ error: 'Session not found' });
    res.json({ deleted: true, id: deleted.id });
  } catch (err) {
    console.error('[admin] deleteSession error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getCrawlLogs(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await adminService.getCrawlLogs({ page, limit });
    res.json(result);
  } catch (err) {
    console.error('[admin] getCrawlLogs error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getCrawlStatus(req, res) {
  try {
    const data = await adminService.getCurrentCrawlStatus();
    res.json({ data });
  } catch (err) {
    console.error('[admin] getCrawlStatus error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function triggerCrawl(req, res) {
  try {
    // 크롤러 프로세스는 별도 서비스로 실행되므로 여기서는 신호만 보냄
    // 실제 구현 시 Redis pub/sub 또는 crawl trigger queue 사용
    res.json({ triggered: true, message: '크롤링 요청이 접수되었습니다.' });
  } catch (err) {
    console.error('[admin] triggerCrawl error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getStats, deleteSession, getCrawlLogs, getCrawlStatus, triggerCrawl };
