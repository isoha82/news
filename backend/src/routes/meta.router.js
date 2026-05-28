const { Router } = require('express');
const ctrl = require('../controllers/meta.controller');

const router = Router();

// GET /api/v1/countries
router.get('/countries', ctrl.listCountries);

// GET /api/v1/categories
router.get('/categories', ctrl.listCategories);

// GET /api/v1/feed/status
router.get('/feed/status', ctrl.getFeedStatus);

module.exports = router;
