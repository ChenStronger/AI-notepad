<template>
  <div class="document-list">
    <div class="list-header">
      <h3>知识库文档</h3>
      <button class="btn-upload" @click="$emit('upload')">
        <Plus :size="16" />
        上传文档
      </button>
    </div>

    <div class="document-items" v-if="documents.length > 0">
      <DocumentItem
        v-for="doc in documents"
        :key="doc.id"
        :document="doc"
        @select="$emit('select', doc)"
        @delete="$emit('delete', doc.id)"
      />
    </div>

    <div class="empty-state" v-else>
      <FileText :size="48" />
      <p>暂无文档</p>
      <p class="hint">上传文档开始构建知识库</p>
    </div>
  </div>
</template>

<script setup>
import { Plus, FileText } from 'lucide-vue-next'
import DocumentItem from './DocumentItem.vue'

defineProps({
  documents: {
    type: Array,
    default: () => []
  }
})

defineEmits(['upload', 'select', 'delete'])
</script>

<style scoped>
.document-list {
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
}

.btn-upload {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-upload:hover {
  background: #2563eb;
}

.document-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 32px;
  color: #9ca3af;
}

.empty-state p {
  margin: 8px 0 0;
}

.empty-state .hint {
  font-size: 12px;
}
</style>
