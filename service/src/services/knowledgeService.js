// 知识库服务
const KnowledgeBase = require('../models/KnowledgeBase');
const { Op } = require('sequelize');

const knowledgeService = {
  // 获取知识库列表
  async getList(userId, options = {}) {
    const { page = 1, limit = 10, category } = options;
    const offset = (page - 1) * limit;

    const where = { userId };
    
    if (category) {
      where.category = category;
    }

    const result = await KnowledgeBase.findAndCountAll({
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

  // 搜索知识库
  async search(userId, query) {
    const knowledge = await KnowledgeBase.findAll({
      where: {
        userId,
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { content: { [Op.like]: `%${query}%` } }
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    return knowledge;
  },

  // 获取单个知识
  async getDetail(userId, id) {
    const knowledge = await KnowledgeBase.findOne({
      where: { id, userId }
    });

    if (!knowledge) {
      throw new Error('知识不存在');
    }

    return knowledge;
  },

  // 创建知识
  async create(userId, data) {
    const { title, content, source, category } = data;
    
    if (!title) {
      throw new Error('标题不能为空');
    }

    if (!content) {
      throw new Error('内容不能为空');
    }

    const knowledge = await KnowledgeBase.create({
      userId,
      title,
      content,
      source: source || null,
      category: category || 'default'
    });

    return knowledge;
  },

  // 更新知识
  async update(userId, id, data) {
    const knowledge = await KnowledgeBase.findOne({
      where: { id, userId }
    });

    if (!knowledge) {
      throw new Error('知识不存在');
    }

    await knowledge.update(data);
    return knowledge;
  },

  // 删除知识
  async delete(userId, id) {
    const knowledge = await KnowledgeBase.findOne({
      where: { id, userId }
    });

    if (!knowledge) {
      throw new Error('知识不存在');
    }

    await knowledge.destroy();
    return true;
  }
};

module.exports = knowledgeService;
