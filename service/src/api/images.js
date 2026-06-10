const express = require('express');
const router = express.Router();
const imagesController = require('../controllers/imagesController');
const authMiddleware = require('../middleware/auth');

// 所有路由需要认证
router.use(authMiddleware);

// 上传图片
router.post('/upload', imagesController.upload);

// 获取图片列表
router.get('/', imagesController.getList);

// 删除图片
router.delete('/:id', imagesController.delete);

// OCR识别
router.post('/:id/ocr', imagesController.ocr);

module.exports = router;
