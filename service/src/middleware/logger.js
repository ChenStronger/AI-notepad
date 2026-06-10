// 日志中间件
const morgan = require('morgan');
const winston = require('winston');
const config = require('../../config');

// 创建日志记录器
const logger = winston.createLogger({
  level: config.log.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: config.log.file }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Morgan中间件配置
const morganMiddleware = morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
});

module.exports = {
  logger,
  morganMiddleware
};
