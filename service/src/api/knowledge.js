const express = require('express');
const router = express.Router();
const knowledgeController = require('../controllers/knowledgeController');
const authMiddleware = require('../middleware/auth');

// 所有路由需要认证
router.use(authMiddleware);

// 获取知识库列表
router.get('/', knowledgeController.getList);

// 搜索知识库
router.get('/search', knowledgeController.search);

// 获取单个知识
router.get('/:id', knowledgeController.getDetail);

// 创建知识
router.post('/', knowledgeController.create);

// 更新知识
router.put('/:id', knowledgeController.update);

// 删除知识
router.delete('/:id', knowledgeController.delete);

module.exports = router;
