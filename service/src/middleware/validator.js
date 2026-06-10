// 数据验证中间件
const { body, validationResult } = require('express-validator');

const validate = validations => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      message: '验证失败',
      errors: errors.array()
    });
  };
};

// 用户注册验证
const registerValidation = validate([
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('email').isEmail().withMessage('邮箱格式不正确'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6位')
]);

// 用户登录验证
const loginValidation = validate([
  body('email').isEmail().withMessage('邮箱格式不正确'),
  body('password').notEmpty().withMessage('密码不能为空')
]);

// 笔记创建验证
const noteCreateValidation = validate([
  body('title').notEmpty().withMessage('标题不能为空')
]);

// 日程创建验证
const scheduleCreateValidation = validate([
  body('title').notEmpty().withMessage('标题不能为空'),
  body('date').isISO8601().withMessage('日期格式不正确')
]);

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  noteCreateValidation,
  scheduleCreateValidation
};
