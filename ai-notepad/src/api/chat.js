import api from './index'

export const chatAPI = {
  // 发送问题
  ask(data) {
    return api.post('/chat/ask', data)
  },
  
  // 获取历史记录
  getHistory(sessionId) {
    return api.get('/chat/history', { params: { session_id: sessionId } })
  },
  
  // 清空历史
  clearHistory(sessionId) {
    return api.delete('/chat/history', { params: { session_id: sessionId } })
  }
}

export const searchAPI = {
  // 语义搜索
  semanticSearch(data) {
    return api.post('/search/semantic', data)
  },
  
  // 关键词搜索
  keywordSearch(query) {
    return api.get('/search/keyword', { params: { q: query } })
  }
}