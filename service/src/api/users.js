const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// 用户注册
router.post('/register', usersController.register);

// 用户登录
router.post('/login', usersController.login);

// 获取当前用户信息
router.get('/me', usersController.getCurrentUser);

// 更新用户信息
router.put('/me', usersController.updateCurrentUser);

// 退出登录
router.post('/logout', usersController.logout);

// 修改密码
router.put('/password', usersController.changePassword);

module.exports = router;
