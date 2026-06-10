// 笔记图片模型
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const NoteImage = sequelize.define('NoteImage', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '图片ID'
  },
  noteId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'note_id',
    comment: '所属笔记ID'
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'image_url',
    comment: '图片URL'
  },
  fileName: {
    type: DataTypes.STRING(255),
    field: 'file_name',
    comment: '原始文件名'
  },
  fileSize: {
    type: DataTypes.INTEGER,
    field: 'file_size',
    comment: '文件大小(字节)'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
    comment: '上传时间'
  }
}, {
  tableName: 'note_images',
  indexes: [
    { fields: ['note_id'] }
  ],
  comment: '笔记图片表'
});

module.exports = NoteImage;
