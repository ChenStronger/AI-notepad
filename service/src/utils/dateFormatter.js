// 日期格式化工具
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const dateFormatter = {
  // 格式化日期为 YYYY-MM-DD
  formatDate(date) {
    return dayjs(date).format('YYYY-MM-DD');
  },

  // 格式化时间为 HH:mm:ss
  formatTime(time) {
    return dayjs(time).format('HH:mm:ss');
  },

  // 格式化日期时间为 YYYY-MM-DD HH:mm:ss
  formatDateTime(dateTime) {
    return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss');
  },

  // 获取今天的日期字符串
  getTodayString() {
    return dayjs().format('YYYY-MM-DD');
  },

  // 获取本周开始日期
  getWeekStart(date = new Date()) {
    return dayjs(date).startOf('week').format('YYYY-MM-DD');
  },

  // 获取本周结束日期
  getWeekEnd(date = new Date()) {
    return dayjs(date).endOf('week').format('YYYY-MM-DD');
  },

  // 获取本月开始日期
  getMonthStart(year, month) {
    return dayjs(`${year}-${month.toString().padStart(2, '0')}-01`).format('YYYY-MM-DD');
  },

  // 获取本月结束日期
  getMonthEnd(year, month) {
    return dayjs(`${year}-${month.toString().padStart(2, '0')}-01`).endOf('month').format('YYYY-MM-DD');
  },

  // 判断是否是今天
  isToday(date) {
    return dayjs(date).isSame(dayjs(), 'day');
  },

  // 判断日期是否在范围内
  isInRange(date, startDate, endDate) {
    const d = dayjs(date);
    return d.isBetween(dayjs(startDate), dayjs(endDate), null, '[]');
  },

  // 计算两个日期之间的天数
  daysBetween(date1, date2) {
    return Math.abs(dayjs(date1).diff(dayjs(date2), 'day'));
  }
};

module.exports = dateFormatter;
