// 聊天服务
const ChatMessage = require('../models/ChatMessage');
const { v4: uuidv4 } = require('uuid');
const config = require('../../config');

const chatService = {
  // 发送问题
  async ask(userId, message, sessionId) {
    // 如果没有sessionId，创建新的
    const conversationId = sessionId || uuidv4();

    // 保存用户消息
    await ChatMessage.create({
      userId,
      conversationId,
      role: 'user',
      content: message
    });

    // 模拟AI回复（实际应用中调用AI API）
    const aiResponse = await this.generateAIResponse(message);

    // 保存AI回复
    await ChatMessage.create({
      userId,
      conversationId,
      role: 'assistant',
      content: aiResponse
    });

    return {
      message: aiResponse,
      conversationId
    };
  },

  // 生成AI回复（模拟）
  async generateAIResponse(message) {
    // 这里应该调用实际的AI服务API
    // 目前使用模拟回复
    const responses = [
      '这是一个很好的问题！让我为您分析一下。',
      '根据您的问题，我认为可以这样理解：',
      '感谢您的提问，这是我的回答：',
      '好的，我来帮您解答这个问题。',
      '让我仔细思考一下您的问题...'
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return `${randomResponse}\n\n关于「${message}」这个话题，您可以尝试：\n1. 查看相关的笔记内容\n2. 搜索知识库获取更多信息\n3. 查看相关的日程安排`;
  },

  // 获取历史记录
  async getHistory(userId, sessionId) {
    const where = { userId };
    
    if (sessionId) {
      where.conversationId = sessionId;
    }

    const messages = await ChatMessage.findAll({
      where,
      order: [['createdAt', 'ASC']]
    });

    return messages;
  },

  // 清空历史
  async clearHistory(userId, sessionId) {
    const where = { userId };
    
    if (sessionId) {
      where.conversationId = sessionId;
    }

    await ChatMessage.destroy({ where });
    return true;
  }
};

module.exports = chatService;
