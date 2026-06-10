// 主应用入口
const express = require('express');
const path = require('path');
const config = require('./config');
const { testConnection } = require('./src/database/connection');
const routes = require('./src/api');
const corsMiddleware = require('./src/middleware/cors');
const { morganMiddleware } = require('./src/middleware/logger');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// 中间件
app.use(corsMiddleware);
app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API路由
app.use('/api', routes);

// 错误处理中间件
app.use(errorHandler);

// 404处理
app.use((req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' });
});

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    await testConnection();

    // 启动服务器
    app.listen(config.port, config.host, () => {
      console.log(`服务器运行在 http://${config.host}:${config.port}`);
      console.log(`API文档: http://${config.host}:${config.port}/api/health`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

startServer();
