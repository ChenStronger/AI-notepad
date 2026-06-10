// 日程模型
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '日程ID'
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
    comment: '日程标题'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '备注说明'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '日程日期'
  },
  time: {
    type: DataTypes.TIME,
    defaultValue: '09:00:00',
    comment: '日程时间'
  },
  status: {
    type: DataTypes.ENUM('pending', 'in-progress', 'completed'),
    defaultValue: 'pending',
    comment: '状态：待办/进行中/已完成'
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
  tableName: 'schedules',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['date'] },
    { fields: ['status'] }
  ],
  comment: '日程表'
});

module.exports = Schedule;
