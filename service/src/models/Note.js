// 笔记模型
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Note = sequelize.define('Note', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '笔记ID'
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
    comment: '笔记标题'
  },
  content: {
    type: DataTypes.TEXT,
    comment: '笔记内容'
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
  tableName: 'notes',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['created_at'] },
    { type: 'FULLTEXT', fields: ['title', 'content'] }
  ],
  comment: '笔记表'
});

module.exports = Note;
