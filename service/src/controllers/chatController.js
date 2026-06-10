// 聊天控制器
const chatService = require('../services/chatService');

const chatController = {
  // 发送问题
  async ask(req, res) {
    try {
      const { message, session_id } = req.body;
      const response = await chatService.ask(req.user.id, message, session_id);
      res.json({ success: true, data: response });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 获取历史记录
  async getHistory(req, res) {
    try {
      const { session_id } = req.query;
      const history = await chatService.getHistory(req.user.id, session_id);
      res.json({ success: true, data: history });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 清空历史
  async clearHistory(req, res) {
    try {
      const { session_id } = req.query;
      await chatService.clearHistory(req.user.id, session_id);
      res.json({ success: true, message: '历史记录已清空' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = chatController;
