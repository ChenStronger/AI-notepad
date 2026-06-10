// 日程控制器
const schedulesService = require('../services/schedulesService');

const schedulesController = {
  // 获取日程列表
  async getList(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const result = await schedulesService.getList(req.user.id, { page, limit, status });
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 获取今日日程
  async getToday(req, res) {
    try {
      const schedules = await schedulesService.getToday(req.user.id);
      res.json({ success: true, data: schedules });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 获取月度日程
  async getMonthly(req, res) {
    try {
      const { year, month } = req.query;
      const schedules = await schedulesService.getMonthly(req.user.id, year, month);
      res.json({ success: true, data: schedules });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // 获取单个日程
  async getDetail(req, res) {
    try {
      const { id } = req.params;
      const schedule = await schedulesService.getDetail(req.user.id, id);
      res.json({ success: true, data: schedule });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  // 创建日程
  async create(req, res) {
    try {
      const data = req.body;
      const schedule = await schedulesService.create(req.user.id, data);
      res.status(201).json({ success: true, data: schedule });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // 更新日程
  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const schedule = await schedulesService.update(req.user.id, id, data);
      res.json({ success: true, data: schedule });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  // 删除日程
  async delete(req, res) {
    try {
      const { id } = req.params;
      await schedulesService.delete(req.user.id, id);
      res.json({ success: true, message: '日程删除成功' });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
};

module.exports = schedulesController;
