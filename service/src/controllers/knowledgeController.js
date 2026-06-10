// 知识库控制器
const knowledgeService = require('../services/knowledgeService');

const knowledgeController = {
  // 获取知识库列表
  async getList(req, res) {
    try {
      const { page = 1, limit = 10, category } = req.query;
      const result = await knowledgeService.getList(req.user.id, { page, limit, category });
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 搜索知识库
  async search(req, res) {
    try {
      const { q } = req.query;
      const results = await knowledgeService.search(req.user.id, q);
      res.json({ success: true, data: results });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 获取单个知识
  async getDetail(req, res) {
    try {
      const { id } = req.params;
      const knowledge = await knowledgeService.getDetail(req.user.id, id);
      res.json({ success: true, data: knowledge });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  // 创建知识
  async create(req, res) {
    try {
      const data = req.body;
      const knowledge = await knowledgeService.create(req.user.id, data);
      res.status(201).json({ success: true, data: knowledge });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // 更新知识
  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const knowledge = await knowledgeService.update(req.user.id, id, data);
      res.json({ success: true, data: knowledge });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  // 删除知识
  async delete(req, res) {
    try {
      const { id } = req.params;
      await knowledgeService.delete(req.user.id, id);
      res.json({ success: true, message: '知识删除成功' });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
};

module.exports = knowledgeController;
