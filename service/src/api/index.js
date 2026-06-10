const express = require('express');
const router = express.Router();

// 路由汇总
const notesRouter = require('./notes');
const schedulesRouter = require('./schedules');
const chatRouter = require('./chat');
const imagesRouter = require('./images');
const knowledgeRouter = require('./knowledge');
const usersRouter = require('./users');

// 挂载子路由
router.use('/notes', notesRouter);
router.use('/schedules', schedulesRouter);
router.use('/chat', chatRouter);
router.use('/images', imagesRouter);
router.use('/knowledge', knowledgeRouter);
router.use('/users', usersRouter);

// 健康检查
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
