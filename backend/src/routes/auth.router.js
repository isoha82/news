const { Router } = require('express');
const ctrl = require('../controllers/auth.controller');

const router = Router();

// POST /api/v1/auth/social
router.post('/social', ctrl.socialLogin);

// POST /api/v1/auth/refresh
router.post('/refresh', ctrl.refresh);

// DELETE /api/v1/auth/logout
router.delete('/logout', ctrl.logout);

module.exports = router;
