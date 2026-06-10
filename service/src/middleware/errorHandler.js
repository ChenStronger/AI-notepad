// 错误处理中间件
const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);
  
  // Multer文件上传错误
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: '文件大小超过限制' });
    }
    return res.status(400).json({ success: false, message: '文件上传失败' });
  }

  // 自定义错误
  if (error.status) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  // 默认错误处理
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
};

module.exports = errorHandler;
