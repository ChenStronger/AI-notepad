const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

// 所有路由需要认证
router.use(authMiddleware);

// 发送问题
router.post('/ask', chatController.ask);

// 获取历史记录
router.get('/history', chatController.getHistory);

// 清空历史
router.delete('/history', chatController.clearHistory);

module.exports = router;
