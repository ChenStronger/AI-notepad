<script setup>
import { ref, watch } from 'vue'
import { Save, X, Calendar, Clock } from 'lucide-vue-next'
import { useNoteStore } from '@/stores/note'

const props = defineProps({
  note: Object
})

const emit = defineEmits(['saved', 'cancel'])

const noteStore = useNoteStore()
const isEdit = ref(false)
const form = ref({
  title: '',
  content: '',
  date: '',
  time: ''
})

watch(() => props.note, (newNote) => {
  if (newNote) {
    isEdit.value = true
    form.value = {
      title: newNote.title || '',
      content: newNote.content || '',
      date: newNote.date || '',
      time: newNote.time || ''
    }
  } else {
    isEdit.value = false
    const now = new Date()
    form.value = {
      title: '',
      content: '',
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5)
    }
  }
}, { immediate: true })

const saveNote = () => {
  if (!form.value.title.trim() && !form.value.content.trim()) {
    alert('请输入标题或内容')
    return
  }

  if (isEdit.value) {
    noteStore.updateNote(props.note.id, { ...form.value })
  } else {
    noteStore.addNote({ ...form.value })
  }

  emit('saved')
}
</script>

<template>
  <div class="note-editor-overlay" @click.self="$emit('cancel')">
    <div class="note-editor">
      <div class="editor-header">
        <h2>{{ isEdit ? '编辑笔记' : '新建笔记' }}</h2>
        <button @click="$emit('cancel')" class="close-btn">
          <X class="icon" />
        </button>
      </div>

      <div class="editor-body">
        <input v-model="form.title" type="text" placeholder="输入标题..." class="note-title-input" />

        <div class="datetime-row">
          <div class="datetime-item">
            <label class="datetime-label">
              <Calendar class="label-icon" />
              <span>日期</span>
            </label>
            <input v-model="form.date" type="date" class="datetime-input date-input" />
          </div>

          <div class="datetime-item">
            <label class="datetime-label">
              <Clock class="label-icon" />
              <span>时间</span>
            </label>
            <input v-model="form.time" type="time" class="datetime-input time-input" />
          </div>
        </div>

        <textarea v-model="form.content" placeholder="输入笔记内容..." class="note-content" rows="8"></textarea>
      </div>

      <div class="editor-footer">
        <button @click="$emit('cancel')" class="btn btn-secondary">取消</button>
        <button @click="saveNote" class="btn btn-primary">
          <Save class="icon" />
          {{ isEdit ? '保存修改' : '保存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.note-editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.note-editor {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 640px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.editor-header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  padding: 24px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.close-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.close-btn .icon {
  width: 22px;
  height: 22px;
}

.editor-body {
  padding: 28px;
  flex: 1;
  overflow-y: auto;
}

.note-title-input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 20px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.note-title-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.datetime-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.datetime-item {
  flex: 1;
}

.datetime-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
}

.label-icon {
  width: 16px;
  height: 16px;
  color: #6366f1;
}

.datetime-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s;
  box-sizing: border-box;
  background: #fafafa;
}

.datetime-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
  background: white;
}

.datetime-input:hover {
  border-color: #cbd5e1;
}

.date-input {
  color: #374151;
}

.time-input {
  color: #374151;
}

.note-content {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 15px;
  line-height: 1.8;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s;
  box-sizing: border-box;
  min-height: 180px;
}

.note-content:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.editor-footer {
  padding: 22px 28px;
  background: #f8fafc;
  display: flex;
  gap: 14px;
  justify-content: flex-end;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 14px 30px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
}

.btn .icon {
  width: 20px;
  height: 20px;
}

.btn-secondary {
  background: #e2e8f0;
  color: #64748b;
}

.btn-secondary:hover {
  background: #cbd5e1;
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
}
</style>
