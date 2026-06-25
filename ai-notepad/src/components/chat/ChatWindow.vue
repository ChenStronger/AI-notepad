<template>
  <div class="chat-window">
    <div class="chat-header">
      <h3>AI 问答</h3>
      <button class="btn-clear" @click="$emit('clear')" title="清空对话">
        <Trash2 :size="16" />
      </button>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-chat">
        <MessageCircle :size="48" />
        <p>开始向 AI 提问吧</p>
      </div>

      <ChatMessage
        v-for="(msg, index) in messages"
        :key="index"
        :message="msg"
      />
    </div>

    <ChatInput @send="handleSend" :disabled="loading" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { MessageCircle, Trash2 } from 'lucide-vue-next'
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'

defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send', 'clear'])

const messagesContainer = ref(null)

const handleSend = (message) => {
  emit('send', message)
}
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
}

.btn-clear {
  padding: 6px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 4px;
}

.btn-clear:hover {
  color: #ef4444;
  background: #fef2f2;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}

.empty-chat p {
  margin: 12px 0 0;
}
</style>
