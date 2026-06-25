import api from './index'

export const knowledgeApi = {
  getDocuments() {
    return api.get('/documents/')
  },

  getDocument(id) {
    return api.get(`/documents/${id}`)
  },

  uploadDocument(formData) {
    return api.post('/documents/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  updateDocument(id, data) {
    return api.put(`/documents/${id}`, data)
  },

  deleteDocument(id) {
    return api.delete(`/documents/${id}`)
  },

  chat(question, sessionId = null) {
    return api.post('/chat/', { question, session_id: sessionId })
  },

  getChatHistory(sessionId) {
    return api.get(`/chat/history/${sessionId}`)
  },

  getAllSessions() {
    return api.get('/chat/sessions')
  },

  clearChatHistory() {
    return api.delete('/chat/history')
  }
}
