// 配置文件
require('dotenv').config();

const config = {
  // 服务器配置
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',

  // 数据库配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    name: process.env.DB_NAME || 'ai_notepad',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  },

  // JWT配置
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-must-be-at-least-32-characters',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // BCrypt配置
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,

  // AI服务配置
  ai: {
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'gpt-3.5-turbo'
  },

  // Redis配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || ''
  },

  // 文件上传配置
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 10485760,
    dir: process.env.UPLOAD_DIR || 'uploads'
  },

  // 日志配置
  log: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  }
};

module.exports = config;
