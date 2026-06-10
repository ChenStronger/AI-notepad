// 响应封装工具
const responseUtils = {
  // 成功响应
  success(res, data, message = '操作成功') {
    res.json({
      success: true,
      message,
      data
    });
  },

  // 成功响应（无消息）
  successNoMsg(res, data) {
    res.json({
      success: true,
      data
    });
  },

  // 失败响应
  error(res, message = '操作失败', statusCode = 500) {
    res.status(statusCode).json({
      success: false,
      message
    });
  },

  // 参数错误
  badRequest(res, message = '参数错误') {
    res.status(400).json({
      success: false,
      message
    });
  },

  // 未授权
  unauthorized(res, message = '未授权') {
    res.status(401).json({
      success: false,
      message
    });
  },

  // 资源未找到
  notFound(res, message = '资源未找到') {
    res.status(404).json({
      success: false,
      message
    });
  },

  // 服务器错误
  serverError(res, error) {
    console.error('Server Error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

module.exports = responseUtils;
