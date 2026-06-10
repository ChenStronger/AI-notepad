<script setup>
import { ref, computed } from 'vue'
import { FileText, Edit3, Trash2, Plus, Search } from 'lucide-vue-next'
import { useNoteStore } from '@/stores/note'
import { getRelativeTime } from '@/utils/format'
import NoteEditor from './NoteEditor.vue'

const noteStore = useNoteStore()
const showEditor = ref(false)
const editingNote = ref(null)

const openEditor = (note = null) => {
  editingNote.value = note
  showEditor.value = true
}

const closeEditor = () => {
  showEditor.value = false
  editingNote.value = null
}

const deleteNote = (id) => {
  if (confirm('确定要删除这条笔记吗？')) {
    noteStore.deleteNote(id)
  }
}
</script>

<template>
  <div class="note-list">
    <div class="list-header">
      <h2>笔记列表</h2>
      <button @click="openEditor()" class="add-btn">
        <Plus class="icon" />
        新建笔记
      </button>
    </div>

    <div class="search-bar">
      <Search class="search-icon" />
      <input v-model="noteStore.searchQuery" type="text" placeholder="搜索笔记..." class="search-input" />
    </div>

    <div v-if="noteStore.filteredNotes.length === 0" class="empty-state">
      <FileText class="empty-icon" />
      <p>暂无笔记</p>
      <p class="hint">点击上方按钮创建新笔记</p>
    </div>

    <div v-else class="notes-grid">
      <div v-for="note in noteStore.filteredNotes" :key="note.id" class="note-card">
        <div class="note-header">
          <h3 class="note-title">{{ note.title || '无标题' }}</h3>
          <div class="note-actions">
            <button @click="openEditor(note)" class="action-btn edit-btn">
              <Edit3 class="icon" />
            </button>
            <button @click="deleteNote(note.id)" class="action-btn delete-btn">
              <Trash2 class="icon" />
            </button>
          </div>
        </div>

        <p class="note-preview">{{ note.content?.substring(0, 100) }}{{ note.content?.length > 100 ? '...' : '' }}</p>

        <div v-if="note.images?.length > 0" class="note-images">
          <img :src="note.images[0]" alt="笔记图片" class="preview-image" />
        </div>

        <div class="note-meta">
          <span class="time">{{ getRelativeTime(note.createdAt) }}</span>
        </div>
      </div>
    </div>

    <NoteEditor v-if="showEditor" :note="editingNote" @saved="closeEditor" @cancel="closeEditor" />
  </div>
</template>

<style scoped>
.note-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1f2937;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.add-btn:hover {
  background: #4338ca;
}

.add-btn .icon {
  width: 16px;
  height: 16px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.search-icon {
  width: 18px;
  height: 18px;
  color: #9ca3af;
}

.search-input {
  flex: 1;
  border: none;
  font-size: 14px;
  outline: none;
}

.empty-state {
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

.empty-state p {
  margin: 4px 0;
}

.empty-state .hint {
  font-size: 12px;
  color: #d1d5db;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  overflow-y: auto;
  flex: 1;
}

.note-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s;
}

.note-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.note-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.note-card:hover .note-actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.action-btn .icon {
  width: 16px;
  height: 16px;
}

.edit-btn:hover {
  background: #e0e7ff;
}

.edit-btn .icon {
  color: #4f46e5;
}

.delete-btn:hover {
  background: #fee2e2;
}

.delete-btn .icon {
  color: #dc2626;
}

.note-preview {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.note-images {
  margin-top: 12px;
}

.preview-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.note-meta {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.time {
  font-size: 12px;
  color: #9ca3af;
}
</style>