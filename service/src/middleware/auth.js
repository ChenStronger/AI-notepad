// 认证中间件
const jwtUtils = require('../utils/jwt');
const userService = require('../services/userService');

const authMiddleware = async (req, res, next) => {
  try {
    const token = jwtUtils.getTokenFromHeader(req);
    
    if (!token) {
      return res.status(401).json({ success: false, message: '未授权，请先登录' });
    }

    const decoded = jwtUtils.verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Token无效' });
    }

    const user = await userService.getById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, message: '用户不存在' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: '认证失败' });
  }
};

module.exports = authMiddleware;
