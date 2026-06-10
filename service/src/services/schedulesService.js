// 日程服务
const Schedule = require('../models/Schedule');
const { Op } = require('sequelize');
const dayjs = require('dayjs');

const schedulesService = {
  // 获取日程列表
  async getList(userId, options = {}) {
    const { page = 1, limit = 10, status } = options;
    const offset = (page - 1) * limit;

    const where = { userId };
    
    if (status) {
      where.status = status;
    }

    const result = await Schedule.findAndCountAll({
      where,
      order: [['date', 'ASC'], ['time', 'ASC']],
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

  // 获取今日日程
  async getToday(userId) {
    const today = dayjs().format('YYYY-MM-DD');
    
    const schedules = await Schedule.findAll({
      where: {
        userId,
        date: today
      },
      order: [['time', 'ASC']]
    });

    return schedules;
  },

  // 获取月度日程
  async getMonthly(userId, year, month) {
    const startDate = dayjs(`${year}-${month.toString().padStart(2, '0')}-01`).format('YYYY-MM-DD');
    const endDate = dayjs(`${year}-${month.toString().padStart(2, '0')}-01`).endOf('month').format('YYYY-MM-DD');

    const schedules = await Schedule.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'ASC'], ['time', 'ASC']]
    });

    return schedules;
  },

  // 获取单个日程
  async getDetail(userId, id) {
    const schedule = await Schedule.findOne({
      where: { id, userId }
    });

    if (!schedule) {
      throw new Error('日程不存在');
    }

    return schedule;
  },

  // 创建日程
  async create(userId, data) {
    const { title, description, date, time, status } = data;
    
    if (!title) {
      throw new Error('标题不能为空');
    }

    if (!date) {
      throw new Error('日期不能为空');
    }

    const schedule = await Schedule.create({
      userId,
      title,
      description: description || '',
      date,
      time: time || '09:00:00',
      status: status || 'pending'
    });

    return schedule;
  },

  // 更新日程
  async update(userId, id, data) {
    const schedule = await Schedule.findOne({
      where: { id, userId }
    });

    if (!schedule) {
      throw new Error('日程不存在');
    }

    await schedule.update(data);
    return schedule;
  },

  // 删除日程
  async delete(userId, id) {
    const schedule = await Schedule.findOne({
      where: { id, userId }
    });

    if (!schedule) {
      throw new Error('日程不存在');
    }

    await schedule.destroy();
    return true;
  }
};

module.exports = schedulesService;
