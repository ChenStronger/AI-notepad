const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');
const authMiddleware = require('../middleware/auth');

// 所有路由需要认证
router.use(authMiddleware);

// 获取笔记列表
router.get('/', notesController.getList);

// 搜索笔记
router.get('/search', notesController.search);

// 获取单个笔记
router.get('/:id', notesController.getDetail);

// 创建笔记
router.post('/', notesController.create);

// 更新笔记
router.put('/:id', notesController.update);

// 删除笔记
router.delete('/:id', notesController.delete);

module.exports = router;
