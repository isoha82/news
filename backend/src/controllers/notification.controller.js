const notifService = require('../services/notification.service');

async function getNotifications(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    const unread_only = req.query.unread_only === 'true';
    const result = await notifService.getNotifications(req.user.id, { limit, offset, unread_only });
    res.json(result);
  } catch (err) {
    console.error('[notification] getNotifications:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function markOneRead(req, res) {
  try {
    const updated = await notifService.markOneRead(req.user.id, req.params.notificationId);
    if (!updated) return res.status(404).json({ error: 'Notification not found' });
    res.json(updated);
  } catch (err) {
    console.error('[notification] markOneRead:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function markAllRead(req, res) {
  try {
    const result = await notifService.markAllRead(req.user.id);
    res.json(result);
  } catch (err) {
    console.error('[notification] markAllRead:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getNotifications, markOneRead, markAllRead };
