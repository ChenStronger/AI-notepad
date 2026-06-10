// JWT工具函数
const jwt = require('jsonwebtoken');
const config = require('../../config');

const jwtUtils = {
  // 生成Token
  generateToken(userId) {
    return jwt.sign(
      { userId },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  },

  // 验证Token
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      return decoded;
    } catch (error) {
      return null;
    }
  },

  // 从请求头获取Token
  getTokenFromHeader(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
};

module.exports = jwtUtils;
