<template>
  <div class="chat-message" :class="{ user: message.role === 'user' }">
    <div class="message-avatar" v-if="message.role === 'assistant'">
      <Bot :size="20" />
    </div>
    <div class="message-content">
      <div class="message-text" v-html="formatMessage(message.content)"></div>
      <div class="message-time" v-if="message.timestamp">
        {{ formatTime(message.timestamp) }}
      </div>
    </div>
    <div class="message-avatar user" v-if="message.role === 'user'">
      <User :size="20" />
    </div>
  </div>
</template>

<script setup>
import { Bot, User } from 'lucide-vue-next'

defineProps({
  message: {
    type: Object,
    required: true
  }
})

const formatMessage = (text) => {
  if (!text) return ''
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.chat-message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.chat-message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  color: #3b82f6;
  flex-shrink: 0;
}

.message-avatar.user {
  background: #f3f4f6;
  color: #6b7280;
}

.message-content {
  max-width: 70%;
}

.message-text {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.chat-message:not(.user) .message-text {
  background: #f3f4f6;
  color: #1f2937;
  border-bottom-left-radius: 4px;
}

.chat-message.user .message-text {
  background: #3b82f6;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-text :deep(code) {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.chat-message.user .message-text :deep(code) {
  background: rgba(255, 255, 255, 0.2);
}

.message-time {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
  padding: 0 4px;
}

.chat-message.user .message-time {
  text-align: right;
}
</style>
