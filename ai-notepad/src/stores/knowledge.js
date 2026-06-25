import { defineStore } from 'pinia'
import { knowledgeApi } from '@/api/knowledge'

export const useKnowledgeStore = defineStore('knowledge', {
  state: () => ({
    documents: [],
    selectedDoc: null,
    chatHistory: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchDocuments() {
      this.loading = true
      this.error = null
      try {
        const res = await knowledgeApi.getDocuments()
        console.log('Documents API response:', res)
        // 后端返回 {"value": [...], "Count": N} 格式
        this.documents = Array.isArray(res) ? res : (res.value || res.documents || [])
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch documents:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchDocument(id) {
      this.loading = true
      try {
        const res = await knowledgeApi.getDocument(id)
        this.selectedDoc = res.document || res
        return this.selectedDoc
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch document:', error)
      } finally {
        this.loading = false
      }
    },

    async updateDocument(id, data) {
      try {
        await knowledgeApi.updateDocument(id, data)
        // 更新本地数据
        const index = this.documents.findIndex(d => d.id === id)
        if (index !== -1) {
          this.documents[index] = { ...this.documents[index], ...data }
        }
      } catch (error) {
        this.error = error.message
        console.error('Failed to update document:', error)
        throw error
      }
    },

    async deleteDocument(id) {
      try {
        await knowledgeApi.deleteDocument(id)
        this.documents = this.documents.filter(d => d.id !== id)
        if (this.selectedDoc?.id === id) {
          this.selectedDoc = null
        }
      } catch (error) {
        this.error = error.message
        console.error('Failed to delete document:', error)
        throw error
      }
    },

    async chat(question, sessionId = null) {
      this.loading = true
      try {
        const response = await knowledgeApi.chat(question, sessionId)
        console.log('Chat API response:', response)
        return response
      } catch (error) {
        this.error = error.message
        console.error('Failed to chat:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchChatHistory(sessionId) {
      try {
        const res = await knowledgeApi.getChatHistory(sessionId)
        this.chatHistory = res.history || res || []
      } catch (error) {
        this.error = error.message
      }
    },

    async clearChatHistory() {
      try {
        await knowledgeApi.clearChatHistory()
        this.chatHistory = []
      } catch (error) {
        this.error = error.message
      }
    }
  }
})
