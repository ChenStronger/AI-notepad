import api from './index'

export const notesAPI = {
  // 获取笔记列表
  getList(params) {
    return api.get('/notes', { params })
  },
  
  // 获取单个笔记
  getDetail(id) {
    return api.get(`/notes/${id}`)
  },
  
  // 创建笔记
  create(data) {
    return api.post('/notes', data)
  },
  
  // 更新笔记
  update(id, data) {
    return api.put(`/notes/${id}`, data)
  },
  
  // 删除笔记
  delete(id) {
    return api.delete(`/notes/${id}`)
  },
  
  // 搜索笔记
  search(query) {
    return api.get('/notes/search', { params: { q: query } })
  }
}