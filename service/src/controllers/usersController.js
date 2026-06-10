// 用户控制器
const userService = require('../services/userService');
const jwtUtils = require('../utils/jwt');

const usersController = {
  // 用户注册
  async register(req, res) {
    try {
      const { username, email, password } = req.body;
      const user = await userService.register({ username, email, password });
      const token = jwtUtils.generateToken(user.id);
      res.status(201).json({ success: true, data: { user, token } });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // 用户登录
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await userService.login(email, password);
      const token = jwtUtils.generateToken(user.id);
      res.json({ success: true, data: { user, token } });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  },

  // 获取当前用户信息
  async getCurrentUser(req, res) {
    try {
      const user = await userService.getById(req.user.id);
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  // 更新用户信息
  async updateCurrentUser(req, res) {
    try {
      const data = req.body;
      const user = await userService.update(req.user.id, data);
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // 退出登录
  async logout(req, res) {
    res.json({ success: true, message: '退出成功' });
  },

  // 修改密码
  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      await userService.changePassword(req.user.id, oldPassword, newPassword);
      res.json({ success: true, message: '密码修改成功' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};

module.exports = usersController;
