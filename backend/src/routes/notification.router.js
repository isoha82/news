const { Router } = require('express');
const { requireAuth } = require('../middlewares/auth');
const ctrl = require('../controllers/notification.controller');

const router = Router();
router.use(requireAuth);

// GET    /api/v1/notifications?limit=20&offset=0&unread_only=true
router.get('/', ctrl.getNotifications);

// POST   /api/v1/notifications/read-all
router.post('/read-all', ctrl.markAllRead);

// PATCH  /api/v1/notifications/:notificationId/read
router.patch('/:notificationId/read', ctrl.markOneRead);

module.exports = router;
