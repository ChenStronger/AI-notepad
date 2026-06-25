<script setup>
import { ref, computed, onMounted } from 'vue'
import { Upload, Sparkles, Send, Bot, User, Eye, Trash2, FileText, FileImage, File } from 'lucide-vue-next'
import { useKnowledgeStore } from '@/stores/knowledge'

const knowledgeStore = useKnowledgeStore()

// 从API获取知识库文档
const knowledgeItems = computed(() => knowledgeStore.documents)

const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const currentUploadFile = ref(null)

onMounted(() => {
  knowledgeStore.fetchDocuments()
})

const allowedTypes = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
  'application/msword': 'word',
  'text/markdown': 'markdown',
  'text/plain': 'markdown',
  '.md': 'markdown',
  '.pdf': 'pdf',
  '.docx': 'word',
  '.doc': 'word'
}

const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase()
}

const getFileType = (file) => {
  if (allowedTypes[file.type]) {
    return allowedTypes[file.type]
  }
  const ext = getFileExtension(file.name)
  const extKey = `.${ext}`
  return allowedTypes[extKey] || 'other'
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const handleDragOver = (e) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (e) => {
  e.preventDefault()
  isDragging.value = false
}

const handleDrop = (e) => {
  e.preventDefault()
  isDragging.value = false

  if (knowledgeItems.value.length >= 10) {
    alert('最多只能上传10个知识库文档！')
    return
  }

  const files = Array.from(e.dataTransfer.files)
  processFiles(files)
}

const fileInput = ref(null)

const triggerFileInput = () => {
  if (knowledgeItems.value.length >= 10) {
    alert('最多只能上传10个知识库文档！')
    return
  }
  fileInput.value?.click()
}

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files)
  processFiles(files)
  e.target.value = ''
}

const processFiles = async (files) => {
  for (const file of files) {
    if (knowledgeItems.value.length >= 10) {
      alert('最多只能上传10个知识库文档！')
      break
    }

    const fileType = getFileType(file)
    if (fileType === 'other') {
      alert(`不支持的文件类型: ${file.name}\n支持的格式: PDF、Word、Markdown`)
      continue
    }

    if (file.size > 50 * 1024 * 1024) {
      alert(`文件大小超过限制: ${file.name}\n最大支持50MB`)
      continue
    }

    await uploadFile(file)
  }
}

const uploadFile = async (file) => {
  isUploading.value = true
  currentUploadFile.value = file.name
  uploadProgress.value = 0

  const progressInterval = setInterval(() => {
    uploadProgress.value += Math.random() * 20
    if (uploadProgress.value >= 90) {
      uploadProgress.value = 90
    }
  }, 200)

  await new Promise(resolve => setTimeout(resolve, 1500))

  clearInterval(progressInterval)
  uploadProgress.value = 100

  await new Promise(resolve => setTimeout(resolve, 300))

  knowledgeStore.fetchDocuments()

  isUploading.value = false
  currentUploadFile.value = null
  uploadProgress.value = 0
}

const viewDocument = (item) => {
  alert(`查看文档: ${item.name || item.title}\n\n类型: ${item.file_type || 'unknown'}\n大小: ${item.file_size ? formatFileSize(item.file_size) : '未知'}\n上传时间: ${item.created_at || '未知'}`)
}

const deleteDocument = (id) => {
  if (confirm('确定要删除这个文档吗？')) {
    knowledgeStore.deleteDocument(id)
  }
}

const messages = ref([
  { id: 1, type: 'bot', content: '您好！我是您的AI助手，有什么可以帮助您的吗？', time: '刚刚' }
])

const newMessage = ref('')

const sendMessage = () => {
  if (!newMessage.value.trim()) return

  messages.value.push({
    id: messages.value.length + 1,
    type: 'user',
    content: newMessage.value,
    time: '刚刚'
  })

  newMessage.value = ''

  setTimeout(() => {
    messages.value.push({
      id: messages.value.length + 1,
      type: 'bot',
      content: '感谢您的提问！我正在学习更多知识，稍后为您提供更详细的回答。',
      time: '刚刚'
    })
  }, 1000)
}
</script>

<template>
  <div class="home-view">

    <div class="home-content">
      <div class="main-layout">
        <div class="ai-chat-panel">
          <div class="panel-header">
            <div class="bot-info">
              <div class="bot-avatar">
                <Bot class="bot-icon" />
              </div>
              <div class="bot-detail">
                <h3>AI 智能助手</h3>
                <span class="online-status">在线</span>
              </div>
            </div>
          </div>

          <div class="chat-messages">
            <div v-for="message in messages" :key="message.id" class="message-item" :class="message.type">
              <div class="message-avatar">
                <Bot v-if="message.type === 'bot'" class="icon" />
                <User v-else class="icon" />
              </div>
              <div class="message-content">
                <p>{{ message.content }}</p>
                <span class="message-time">{{ message.time }}</span>
              </div>
            </div>
          </div>

          <div class="chat-input">
            <input v-model="newMessage" @keyup.enter="sendMessage" type="text" placeholder="输入您的问题..."
              class="input-field" />
            <button @click="sendMessage" class="send-btn">
              <Send class="send-icon" />
            </button>
          </div>
        </div>

        <div class="knowledge-panel">
          <div class="upload-section">
            <input ref="fileInput" type="file" multiple accept=".pdf,.docx,.doc,.md,.txt" class="hidden-file-input"
              @change="handleFileSelect" />
            <div class="upload-box" :class="{ dragging: isDragging }" @click="triggerFileInput"
              @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop">
              <Upload class="upload-icon" />
              <div class="upload-text">
                <span class="upload-title">上传知识库文件</span>
                <span class="upload-hint">支持 PDF、Word、Markdown 等格式 ({{ knowledgeItems.length }}/10)</span>
              </div>
            </div>

            <div v-if="isUploading" class="upload-progress">
              <div class="progress-info">
                <span class="progress-label">正在上传: {{ currentUploadFile }}</span>
                <span class="progress-percent">{{ Math.round(uploadProgress) }}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
              </div>
            </div>
          </div>

          <div class="knowledge-list">
            <div v-if="knowledgeItems.length === 0" class="empty-state">
              <FileText class="empty-icon" />
              <p>暂无知识库文档</p>
              <span>上传文档以开始构建您的知识库</span>
            </div>
            <div v-for="(item, index) in knowledgeItems" :key="item.id" class="knowledge-card">
              <span class="card-index">{{ index + 1 }}</span>
              <div class="card-info">
                <h3 class="card-title">{{ item.name || item.title }}</h3>
                <span class="card-time">{{ item.created_at || item.uploadTime }}</span>
              </div>
              <div class="card-actions">
                <button @click="viewDocument(item)" class="action-btn view-btn">
                  <Eye class="btn-icon" />
                  <span>查看</span>
                </button>
                <button @click="deleteDocument(item.id)" class="action-btn delete-btn">
                  <Trash2 class="btn-icon" />
                  <span>删除</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 50%, #f8fafc 100%);
  background-attachment: fixed;
}

.home-content {
  flex: 1;
  padding: 24px;
}

.main-layout {
  display: flex;
  gap: 24px;
  height: calc(100vh - 180px);
}

.ai-chat-panel {
  flex: 2;
  background: white;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  min-height: 600px;
}

.panel-header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 20px 24px;
}

.bot-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.bot-avatar {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bot-icon {
  width: 22px;
  height: 22px;
  color: white;
}

.bot-detail h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: white;
}

.online-status {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 12px;
  animation: fadeSlideIn 0.3s ease;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-item.bot {
  align-self: flex-start;
}

.message-item.user {
  align-self: flex-end;
}

.message-item.user .message-content {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-radius: 16px 16px 4px 16px;
}

.message-item.user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-item.bot .message-avatar {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
}

.message-item.user .message-avatar {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

.message-avatar .icon {
  width: 18px;
  height: 18px;
}

.message-item.bot .message-avatar .icon {
  color: #6366f1;
}

.message-item.user .message-avatar .icon {
  color: white;
}

.message-content {
  max-width: 75%;
  padding: 12px 16px;
  background: #f1f5f9;
  border-radius: 16px 16px 16px 4px;
}

.message-content p {
  margin: 0 0 6px 0;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

.message-item.user .message-content p {
  color: white;
}

.message-time {
  font-size: 11px;
  color: #9ca3af;
}

.chat-input {
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
}

.input-field {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s;
}

.input-field:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.send-btn {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.send-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.send-icon {
  width: 18px;
  height: 18px;
}

.knowledge-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 320px;
}

.upload-section {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.upload-box {
  border: 2px dashed #6366f1;
  border-radius: 14px;
  padding: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f0f5ff;
}

.upload-box:hover {
  background: #e0e7ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.upload-box.dragging {
  background: #e0e7ff;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
  transform: scale(1.02);
}

.hidden-file-input {
  display: none;
}

.upload-progress {
  margin-top: 16px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 10px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 13px;
  color: #6b7280;
}

.progress-percent {
  font-size: 13px;
  font-weight: 600;
  color: #6366f1;
}

.progress-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 3px;
  transition: width 0.2s ease;
}

.upload-icon {
  width: 36px;
  height: 36px;
  color: #6366f1;
}

.upload-text {
  display: flex;
  flex-direction: column;
}

.upload-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.upload-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.knowledge-list {
  flex: 1;
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 435px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
}

.empty-state span {
  font-size: 12px;
}

.knowledge-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 16px;
}

.knowledge-card:hover {
  background: white;
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.card-index {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.card-time {
  font-size: 12px;
  color: #9ca3af;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.view-btn {
  background: #e0e7ff;
  color: #6366f1;
}

.view-btn:hover {
  background: #c7d2fe;
}

.delete-btn {
  background: #fee2e2;
  color: #ef4444;
}

.delete-btn:hover {
  background: #fecaca;
}

@media (max-width: 1024px) {
  .main-layout {
    flex-direction: column;
    height: auto;
  }

  .ai-chat-panel {
    flex: none;
    min-height: 400px;
  }

  .knowledge-panel {
    flex: none;
  }
}
</style>
