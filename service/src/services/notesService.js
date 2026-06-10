// 笔记服务
const Note = require('../models/Note');
const { Op } = require('sequelize');

const notesService = {
  // 获取笔记列表
  async getList(userId, options = {}) {
    const { page = 1, limit = 10, search } = options;
    const offset = (page - 1) * limit;

    const where = { userId };
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }

    const result = await Note.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });

    return {
      list: result.rows,
      total: result.count,
      page,
      limit
    };
  },

  // 获取单个笔记
  async getDetail(userId, id) {
    const note = await Note.findOne({
      where: { id, userId }
    });

    if (!note) {
      throw new Error('笔记不存在');
    }

    return note;
  },

  // 创建笔记
  async create(userId, data) {
    const { title, content } = data;
    
    if (!title) {
      throw new Error('标题不能为空');
    }

    const note = await Note.create({
      userId,
      title,
      content: content || ''
    });

    return note;
  },

  // 更新笔记
  async update(userId, id, data) {
    const note = await Note.findOne({
      where: { id, userId }
    });

    if (!note) {
      throw new Error('笔记不存在');
    }

    await note.update(data);
    return note;
  },

  // 删除笔记
  async delete(userId, id) {
    const note = await Note.findOne({
      where: { id, userId }
    });

    if (!note) {
      throw new Error('笔记不存在');
    }

    await note.destroy();
    return true;
  },

  // 搜索笔记
  async search(userId, query) {
    const notes = await Note.findAll({
      where: {
        userId,
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { content: { [Op.like]: `%${query}%` } }
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    return notes;
  }
};

module.exports = notesService;
