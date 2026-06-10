// 笔记控制器
const notesService = require('../services/notesService');

const notesController = {
  // 获取笔记列表
  async getList(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const result = await notesService.getList(req.user.id, { page, limit, search });
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 获取单个笔记
  async getDetail(req, res) {
    try {
      const { id } = req.params;
      const note = await notesService.getDetail(req.user.id, id);
      res.json({ success: true, data: note });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  // 创建笔记
  async create(req, res) {
    try {
      const data = req.body;
      const note = await notesService.create(req.user.id, data);
      res.status(201).json({ success: true, data: note });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // 更新笔记
  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const note = await notesService.update(req.user.id, id, data);
      res.json({ success: true, data: note });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  // 删除笔记
  async delete(req, res) {
    try {
      const { id } = req.params;
      await notesService.delete(req.user.id, id);
      res.json({ success: true, message: '笔记删除成功' });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  // 搜索笔记
  async search(req, res) {
    try {
      const { q } = req.query;
      const results = await notesService.search(req.user.id, q);
      res.json({ success: true, data: results });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = notesController;
