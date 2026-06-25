<template>
  <div class="document-item" :class="{ active: selected }" @click="$emit('select')">
    <div class="doc-icon">
      <FileText :size="20" />
    </div>
    <div class="doc-info">
      <span class="doc-name">{{ document.name }}</span>
      <span class="doc-meta">
        {{ formatSize(document.size) }} · {{ formatDate(document.created_at) }}
      </span>
    </div>
    <div class="doc-actions">
      <button class="btn-delete" @click.stop="$emit('delete')" title="删除">
        <Trash2 :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { FileText, Trash2 } from 'lucide-vue-next'

defineProps({
  document: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

defineEmits(['select', 'delete'])

const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.document-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.document-item:hover {
  background: #f3f4f6;
}

.document-item.active {
  background: #eff6ff;
  border: 1px solid #3b82f6;
}

.doc-icon {
  color: #6b7280;
}

.doc-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.doc-name {
  font-size: 14px;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-meta {
  font-size: 12px;
  color: #9ca3af;
}

.doc-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.document-item:hover .doc-actions {
  opacity: 1;
}

.btn-delete {
  padding: 4px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 4px;
}

.btn-delete:hover {
  color: #ef4444;
  background: #fef2f2;
}
</style>
