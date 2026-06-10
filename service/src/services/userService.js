// 用户服务
const User = require('../models/User');
const bcryptUtils = require('../utils/bcrypt');

const userService = {
  // 用户注册
  async register(data) {
    const { username, email, password } = data;
    
    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('邮箱已被注册');
    }

    // 检查用户名是否已存在
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      throw new Error('用户名已被使用');
    }

    // 加密密码
    const hashedPassword = await bcryptUtils.hashPassword(password);

    // 创建用户
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    return user;
  },

  // 用户登录
  async login(email, password) {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      throw new Error('邮箱或密码错误');
    }

    const isPasswordValid = await bcryptUtils.comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('邮箱或密码错误');
    }

    return user;
  },

  // 根据ID获取用户
  async getById(id) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('用户不存在');
    }
    return user;
  },

  // 更新用户信息
  async update(id, data) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 检查邮箱是否被其他用户使用
    if (data.email && data.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: data.email } });
      if (existingUser) {
        throw new Error('邮箱已被注册');
      }
    }

    await user.update(data);
    return user;
  },

  // 修改密码
  async changePassword(id, oldPassword, newPassword) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('用户不存在');
    }

    const isPasswordValid = await bcryptUtils.comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('原密码不正确');
    }

    const hashedPassword = await bcryptUtils.hashPassword(newPassword);
    await user.update({ password: hashedPassword });

    return true;
  }
};

module.exports = userService;
