<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bot, User, Send, FileText, Loader2 } from 'lucide-vue-next'
import { useKnowledgeStore } from '@/stores/knowledge'

const knowledgeStore = useKnowledgeStore()

const messages = ref([
  { id: 1, type: 'bot', content: '您好！我是您的AI助手，可以根据您的知识库回答问题。', sources: [] }
])

const newMessage = ref('')
const sessionId = ref(null)
const isSending = ref(false)

// 从API获取知识库文档
const knowledgeItems = computed(() => knowledgeStore.documents)

onMounted(() => {
  knowledgeStore.fetchDocuments()
})

const sendMessage = async () => {
  if (!newMessage.value.trim() || isSending.value) return

  const userQuestion = newMessage.value

  messages.value.push({
    id: messages.value.length + 1,
    type: 'user',
    content: userQuestion
  })

  newMessage.value = ''
  isSending.value = true

  try {
    const response = await knowledgeStore.chat(userQuestion, sessionId.value)

    // 更新 sessionId
    if (response.session_id) {
      sessionId.value = response.session_id
    }

    messages.value.push({
      id: messages.value.length + 1,
      type: 'bot',
      content: response.answer || '抱歉，暂时无法回答这个问题。',
      sources: response.sources || []
    })
  } catch (error) {
    messages.value.push({
      id: messages.value.length + 1,
      type: 'bot',
      content: '抱歉，发生了错误：' + error.message,
      sources: []
    })
  } finally {
    isSending.value = false
  }
}

const viewDocument = (item) => {
  alert(`查看文档: ${item.name || item.title}\n\n类型: ${(item.file_type || item.type || 'unknown').toUpperCase()}\n大小: ${item.file_size ? formatFileSize(item.file_size) : (item.size || '未知')}\n上传时间: ${item.created_at || item.uploadTime || '未知'}`)
}

const formatFileSize = (bytes) => {
  if (!bytes) return '未知'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}
</script>

<template>
  <div class="chat-view">
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
              <!-- 显示来源文档 -->
              <div v-if="message.sources && message.sources.length > 0" class="source-docs">
                <div class="source-label">参考文档：</div>
                <div v-for="(source, idx) in message.sources" :key="idx" class="source-item">
                  <FileText :size="14" />
                  <span>{{ source.metadata?.file_name || source.metadata?.name || '文档' + (idx + 1) }}</span>
                </div>
              </div>

            </div>
          </div>

          <!-- 加载中提示 -->
          <div v-if="isSending" class="message-item bot">
            <div class="message-avatar">
              <Bot class="icon" />
            </div>
            <div class="message-content">
              <p class="loading-text">
                <Loader2 class="loading-icon" />
                正在思考中...
              </p>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <input v-model="newMessage" @keyup.enter="sendMessage" type="text" placeholder="输入您的问题..." class="input-field"
            :disabled="isSending" />
          <button @click="sendMessage" class="send-btn" :disabled="isSending || !newMessage.trim()">
            <Send class="send-icon" />
          </button>
        </div>
      </div>

      <div class="knowledge-panel">
        <div class="knowledge-list">
          <div class="list-header">
            <FileText :size="18" />
            <span>知识库文档 ({{ knowledgeItems.length }})</span>
          </div>
          <div v-if="knowledgeItems.length === 0" class="empty-list">
            <p>暂无知识库文档</p>
            <p class="hint">请前往知识库页面上传文档</p>
          </div>
          <div v-for="(item, index) in knowledgeItems" :key="item.id" class="knowledge-card">
            <span class="card-index">{{ index + 1 }}</span>
            <div class="card-info">
              <h3 class="card-title">{{ item.name || item.title }}</h3>
              <span class="card-time">{{ formatDate(item.created_at || item.uploadTime) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-view {
  min-height: 100%;
}

.main-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  height: calc(100vh - 120px);
}

.ai-chat-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
}

.bot-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bot-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bot-icon {
  width: 28px;
  height: 28px;
  color: white;
}

.bot-detail h3 {
  margin: 0;
  font-size: 18px;
  color: white;
  font-weight: 600;
}

.online-status {
  font-size: 12px;
  color: #4ade80;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-item.bot .message-avatar {
  background: #eff6ff;
}

.message-item.user .message-avatar {
  background: #f3f4f6;
}

.message-avatar .icon {
  width: 20px;
  height: 20px;
}

.message-item.bot .message-avatar .icon {
  color: #3b82f6;
}

.message-item.user .message-avatar .icon {
  color: #6b7280;
}

.message-content {
  max-width: 70%;
}

.message-content p {
  margin: 0;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
}

.message-item.bot .message-content p {
  background: #f3f4f6;
  color: #1f2937;
  border-bottom-left-radius: 4px;
}

.message-item.user .message-content p {
  background: #3b82f6;
  color: white;
  border-bottom-right-radius: 4px;
}

.source-docs {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f0f9ff;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

.source-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.source-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #3b82f6;
  margin-top: 4px;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-icon {
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}



.chat-input {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
}

.input-field {
  flex: 1;
  padding: 12px 20px;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #3b82f6;
}

.input-field:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.send-btn {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #2563eb;
}

.send-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.send-icon {
  width: 20px;
  height: 20px;
}

.knowledge-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.knowledge-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.list-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #6b7280;
  font-size: 14px;
}

.knowledge-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 8px;
}

.card-index {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  flex-shrink: 0;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-title {
  margin: 0;
  font-size: 13px;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-time {
  font-size: 11px;
  color: #9ca3af;
}

.empty-list {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-list p {
  margin: 0;
  font-size: 14px;
}

.empty-list .hint {
  margin-top: 8px;
  font-size: 12px;
}
</style>
