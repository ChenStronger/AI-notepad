<script setup>
import { ref } from 'vue'
import { Upload, FileText, Send, MessageCircle, HelpCircle } from 'lucide-vue-next'
import { getRelativeTime } from '@/utils/format'

const documents = ref([])
const conversations = ref([])
const newQuestion = ref('')
const isGenerating = ref(false)

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    documents.value.push({
      id: Date.now(),
      name: file.name,
      content: e.target.result,
      createdAt: new Date().toISOString()
    })
  }
  reader.readAsText(file)
}

const simulateAIAnswer = () => {
  if (!newQuestion.value.trim()) return
  
  isGenerating.value = true
  
  const questions = [
    { q: '你好', a: '你好！我是AI助手，有什么可以帮助你的？' },
    { q: '什么是人工智能', a: '人工智能（AI）是计算机科学的一个分支，旨在创建能够模拟人类智能行为的系统。它包括机器学习、深度学习、自然语言处理等多个领域。' },
    { q: '天气怎么样', a: '抱歉，我无法访问实时数据。请查看天气应用获取最新天气信息。' },
    { q: '如何学习编程', a: '学习编程的最佳方式是：1.选择一门编程语言开始；2.通过项目实践学习；3.加入社区交流；4.持续不断地练习。' },
    { q: '谢谢', a: '不客气！很高兴能帮到你。' }
  ]
  
  const matched = questions.find(q => newQuestion.value.toLowerCase().includes(q.q.toLowerCase()))
  
  setTimeout(() => {
    const answer = matched 
      ? matched.a 
      : `这是一个很好的问题！关于"${newQuestion.value}"，我可以提供一些基本信息。如果你有更具体的问题，请随时问我。`
    
    conversations.value.unshift({
      id: Date.now(),
      question: newQuestion.value,
      answer,
      createdAt: new Date().toISOString()
    })
    newQuestion.value = ''
    isGenerating.value = false
  }, 1500)
}
</script>

<template>
  <div class="knowledge-chat">
    <div class="chat-header">
      <h2>知识库问答</h2>
    </div>
    
    <div class="chat-body">
      <div class="upload-section">
        <label class="upload-btn">
          <Upload class="icon" />
          上传文档
          <input type="file" accept=".txt,.md,.json" @change="handleFileUpload" hidden />
        </label>
        
        <div v-if="documents.length > 0" class="document-list">
          <h3>已上传文档</h3>
          <div 
            v-for="doc in documents" 
            :key="doc.id" 
            class="document-item"
          >
            <FileText class="icon" />
            <span>{{ doc.name }}</span>
            <span class="doc-time">{{ getRelativeTime(doc.createdAt) }}</span>
          </div>
        </div>
      </div>
      
      <div class="chat-section">
        <div class="chat-title">
          <MessageCircle class="icon" />
          <h3>AI 助手</h3>
        </div>
        
        <div v-if="conversations.length === 0" class="empty-chat">
          <HelpCircle class="empty-icon" />
          <p>有什么问题想问我？</p>
        </div>
        
        <div v-else class="chat-messages">
          <div 
            v-for="conv in conversations" 
            :key="conv.id" 
            class="message-group"
          >
            <div class="message user-message">
              <div class="message-avatar user">用户</div>
              <div class="message-content">
                <p>{{ conv.question }}</p>
                <span class="message-time">{{ getRelativeTime(conv.createdAt) }}</span>
              </div>
            </div>
            <div class="message ai-message">
              <div class="message-avatar ai">AI</div>
              <div class="message-content">
                <p>{{ conv.answer }}</p>
                <span class="message-time">{{ getRelativeTime(conv.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chat-input">
          <input 
            v-model="newQuestion" 
            type="text" 
            placeholder="问我关于你笔记的任何问题，比如：'我上周三做了什么？' 或 '整理一下我的待办事项'" 
            class="question-input"
            @keyup.enter="simulateAIAnswer"
          />
          <button 
            @click="simulateAIAnswer" 
            :disabled="isGenerating || !newQuestion.trim()" 
            class="send-btn"
          >
            <Send class="icon" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.knowledge-chat {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  margin-bottom: 16px;
}

.chat-header h2 {
  margin: 0;
  font-size: 20px;
}

.chat-body {
  flex: 1;
  display: flex;
  gap: 16px;
  overflow: hidden;
}

.upload-section {
  width: 280px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #e0e7ff;
  border: 2px dashed #4f46e5;
  border-radius: 8px;
  cursor: pointer;
  color: #4f46e5;
  font-weight: 500;
  margin-bottom: 16px;
}

.upload-btn:hover {
  background: #c7d2fe;
}

.upload-btn .icon {
  width: 20px;
  height: 20px;
}

.document-list h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #6b7280;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f9fafb;
  border-radius: 6px;
  margin-bottom: 8px;
}

.document-item .icon {
  width: 16px;
  height: 16px;
  color: #4f46e5;
}

.document-item span {
  flex: 1;
  font-size: 13px;
}

.doc-time {
  font-size: 11px;
  color: #9ca3af;
}

.chat-section {
  flex: 1;
  background: white;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.chat-title .icon {
  width: 20px;
  height: 20px;
  color: #4f46e5;
}

.chat-title h3 {
  margin: 0;
  font-size: 16px;
}

.empty-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.message-group {
  margin-bottom: 20px;
}

.message {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.message-avatar.user {
  background: #e0e7ff;
  color: #4f46e5;
}

.message-avatar.ai {
  background: #dcfce7;
  color: #16a34a;
}

.message-content {
  max-width: 70%;
}

.message-content p {
  margin: 0;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
}

.user-message .message-content p {
  background: #4f46e5;
  color: white;
}

.ai-message .message-content p {
  background: #f3f4f6;
  color: #374151;
}

.message-time {
  display: block;
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

.chat-input {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #eee;
  background: #f8f9fa;
}

.question-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
}

.question-input:focus {
  border-color: #4f46e5;
}

.send-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: #4f46e5;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  background: #4338ca;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn .icon {
  width: 18px;
  height: 18px;
}
</style>