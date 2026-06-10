const express = require('express');
const router = express.Router();
const schedulesController = require('../controllers/schedulesController');
const authMiddleware = require('../middleware/auth');

// 所有路由需要认证
router.use(authMiddleware);

// 获取日程列表
router.get('/', schedulesController.getList);

// 获取今日日程
router.get('/today', schedulesController.getToday);

// 获取月度日程
router.get('/monthly', schedulesController.getMonthly);

// 获取单个日程
router.get('/:id', schedulesController.getDetail);

// 创建日程
router.post('/', schedulesController.create);

// 更新日程
router.put('/:id', schedulesController.update);

// 删除日程
router.delete('/:id', schedulesController.delete);

module.exports = router;
