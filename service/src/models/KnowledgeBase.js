// 知识库模型
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const KnowledgeBase = sequelize.define('KnowledgeBase', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '知识库ID'
  },
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'user_id',
    comment: '所属用户ID'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '知识标题'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '知识内容'
  },
  source: {
    type: DataTypes.STRING(255),
    comment: '来源链接'
  },
  category: {
    type: DataTypes.STRING(50),
    defaultValue: 'default',
    comment: '分类标签'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
    comment: '创建时间'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
    comment: '更新时间'
  }
}, {
  tableName: 'knowledge_base',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['category'] },
    { type: 'FULLTEXT', fields: ['title', 'content'] }
  ],
  comment: '知识库表'
});

module.exports = KnowledgeBase;
