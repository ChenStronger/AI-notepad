// 用户模型
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '用户ID'
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '用户名'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '邮箱地址'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码(BCrypt加密)'
  },
  avatar: {
    type: DataTypes.STRING(500),
    defaultValue: null,
    comment: '头像URL'
  },
  nickname: {
    type: DataTypes.STRING(50),
    defaultValue: null,
    comment: '昵称'
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
  tableName: 'users',
  indexes: [
    { fields: ['email'] },
    { fields: ['username'] }
  ],
  comment: '用户表'
});

module.exports = User;
