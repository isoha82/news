const { Router } = require('express');
const { requireAuth } = require('../middlewares/auth');
const ctrl = require('../controllers/user.controller');

const router = Router();
router.use(requireAuth);

// GET    /api/v1/users/me
router.get('/me', ctrl.getMe);

// DELETE /api/v1/users/me
router.delete('/me', ctrl.deleteMe);

// GET    /api/v1/users/me/settings
router.get('/me/settings', ctrl.getSettings);

// PUT    /api/v1/users/me/settings/theme
router.put('/me/settings/theme', ctrl.updateTheme);

// PUT    /api/v1/users/me/countries
router.put('/me/countries', ctrl.updateCountries);

// PUT    /api/v1/users/me/categories
router.put('/me/categories', ctrl.updateCategories);

// PUT    /api/v1/users/me/notification-settings
router.put('/me/notification-settings', ctrl.updateNotificationSettings);

module.exports = router;
