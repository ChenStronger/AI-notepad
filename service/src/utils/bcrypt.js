// BCrypt加密工具
const bcrypt = require('bcrypt');
const config = require('../../config');

const bcryptUtils = {
  // 加密密码
  async hashPassword(password) {
    const saltRounds = config.bcryptSaltRounds || 10;
    return bcrypt.hash(password, saltRounds);
  },

  // 验证密码
  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }
};

module.exports = bcryptUtils;
