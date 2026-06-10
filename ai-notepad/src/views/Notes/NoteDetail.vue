<script setup>
import { computed } from 'vue'
import { useNoteStore } from '@/stores/note'
import { formatDateTime } from '@/utils/format'
import { ArrowLeft, Edit3, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  noteId: [Number, String]
})

const emit = defineEmits(['back', 'edit', 'delete'])

const noteStore = useNoteStore()
const note = computed(() => noteStore.getNoteById(props.noteId))
</script>

<template>
  <div class="note-detail" v-if="note">
    <div class="detail-header">
      <button @click="$emit('back')" class="back-btn">
        <ArrowLeft class="icon" />
        返回
      </button>
      <div class="header-actions">
        <button @click="$emit('edit', note)" class="action-btn">
          <Edit3 class="icon" />
          编辑
        </button>
        <button @click="$emit('delete', note.id)" class="action-btn delete">
          <Trash2 class="icon" />
          删除
        </button>
      </div>
    </div>
    
    <div class="detail-body">
      <h1 class="note-title">{{ note.title || '无标题' }}</h1>
      
      <div class="note-meta">
        <span>创建时间: {{ formatDateTime(note.createdAt) }}</span>
        <span v-if="note.updatedAt">更新时间: {{ formatDateTime(note.updatedAt) }}</span>
      </div>
      
      <div class="note-content">
        <p>{{ note.content }}</p>
      </div>
      
      <div v-if="note.images?.length > 0" class="note-images">
        <h3>图片</h3>
        <div class="images-grid">
          <img 
            v-for="(img, index) in note.images" 
            :key="index" 
            :src="img" 
            alt="笔记图片" 
            class="note-image"
          />
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="note-not-found">
    <p>笔记不存在或已被删除</p>
    <button @click="$emit('back')" class="btn">返回列表</button>
  </div>
</template>

<style scoped>
.note-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  font-size: 14px;
}

.back-btn:hover {
  color: #374151;
}

.back-btn .icon {
  width: 16px;
  height: 16px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.action-btn:hover {
  background: #e5e7eb;
}

.action-btn.delete {
  color: #dc2626;
}

.action-btn.delete:hover {
  background: #fee2e2;
}

.action-btn .icon {
  width: 16px;
  height: 16px;
}

.detail-body {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
}

.note-title {
  margin: 0 0 16px 0;
  font-size: 24px;
  color: #1f2937;
}

.note-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  font-size: 14px;
  color: #9ca3af;
}

.note-content {
  margin-bottom: 24px;
}

.note-content p {
  margin: 0;
  font-size: 16px;
  line-height: 1.8;
  color: #374151;
}

.note-images h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #1f2937;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.note-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.note-not-found {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.note-not-found p {
  margin-bottom: 16px;
}

.btn {
  padding: 10px 16px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>