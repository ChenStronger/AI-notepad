import api from './index'

export const schedulesAPI = {
  // 获取日程列表
  getList(params) {
    return api.get('/schedules', { params })
  },
  
  // 获取单个日程
  getDetail(id) {
    return api.get(`/schedules/${id}`)
  },
  
  // 创建日程
  create(data) {
    return api.post('/schedules', data)
  },
  
  // 更新日程
  update(id, data) {
    return api.put(`/schedules/${id}`, data)
  },
  
  // 删除日程
  delete(id) {
    return api.delete(`/schedules/${id}`)
  },
  
  // 获取月度日程
  getMonthly(year, month) {
    return api.get('/schedules/monthly', { params: { year, month } })
  },
  
  // 获取今日日程
  getToday() {
    return api.get('/schedules/today')
  }
}