// 聊天消息模型
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '消息ID'
  },
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'user_id',
    comment: '用户ID'
  },
  conversationId: {
    type: DataTypes.STRING(36),
    allowNull: false,
    field: 'conversation_id',
    comment: '对话ID(UUID)'
  },
  role: {
    type: DataTypes.ENUM('user', 'assistant'),
    allowNull: false,
    comment: '角色：用户/助手'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '消息内容'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
    comment: '发送时间'
  }
}, {
  tableName: 'chat_messages',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['conversation_id'] },
    { fields: ['created_at'] }
  ],
  comment: '聊天记录表'
});

module.exports = ChatMessage;
