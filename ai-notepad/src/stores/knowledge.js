import { reactive } from 'vue'

const knowledgeStore = reactive({
  documents: [],
  conversations: [],
  addDocument(doc) {
    this.documents.push({
      id: Date.now(),
      ...doc,
      createdAt: new Date().toISOString()
    })
  },
  deleteDocument(id) {
    this.documents = this.documents.filter(d => d.id !== id)
  },
  addConversation(question, answer) {
    this.conversations.unshift({
      id: Date.now(),
      question,
      answer,
      createdAt: new Date().toISOString()
    })
  },
  getDocumentById(id) {
    return this.documents.find(d => d.id === id)
  }
})

export default knowledgeStore