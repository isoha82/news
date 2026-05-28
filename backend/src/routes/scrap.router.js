const { Router } = require('express');
const { requireAuth } = require('../middlewares/auth');
const ctrl = require('../controllers/scrap.controller');

const router = Router();
router.use(requireAuth); // 모든 스크랩 라우트 인증 필요

// POST   /api/v1/scraps
router.post('/', ctrl.addScrap);

// DELETE /api/v1/scraps/:scrapId
router.delete('/:scrapId', ctrl.deleteScrap);

// PATCH  /api/v1/scraps/:scrapId  (폴더 이동)
router.patch('/:scrapId', ctrl.moveScrap);

// GET    /api/v1/scraps/folders
router.get('/folders', ctrl.getFolders);

// POST   /api/v1/scraps/folders
router.post('/folders', ctrl.createFolder);

// GET    /api/v1/scraps/folders/:folderId
router.get('/folders/:folderId', ctrl.getFolderArticles);

// DELETE /api/v1/scraps/folders/:folderId
router.delete('/folders/:folderId', ctrl.deleteFolder);

module.exports = router;
