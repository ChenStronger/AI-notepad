<template>
  <div class="chat-input">
    <input
      type="text"
      v-model="inputText"
      @keyup.enter="handleSend"
      :placeholder="placeholder"
      :disabled="disabled"
    />
    <button @click="handleSend" :disabled="disabled || !inputText.trim()">
      <Send :size="18" />
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Send } from 'lucide-vue-next'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: '输入问题...'
  }
})

const emit = defineEmits(['send'])

const inputText = ref('')

const handleSend = () => {
  const text = inputText.value.trim()
  if (text && !props.disabled) {
    emit('send', text)
    inputText.value = ''
  }
}
</script>

<style scoped>
.chat-input {
  display: flex;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: #fafafa;
}

.chat-input input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input input:focus {
  border-color: #3b82f6;
}

.chat-input input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.chat-input button {
  width: 44px;
  height: 44px;
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

.chat-input button:hover:not(:disabled) {
  background: #2563eb;
}

.chat-input button:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}
</style>
