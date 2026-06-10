<script setup>
import { ref, watch } from 'vue'
import { ImagePlus, Trash2, Save, X } from 'lucide-vue-next'
import { useNoteStore } from '@/stores/note'
import { uploadImage, validateImage } from '@/utils/imageUpload'

const props = defineProps({
  note: Object
})

const emit = defineEmits(['saved', 'cancel'])

const noteStore = useNoteStore()
const isEdit = ref(false)
const form = ref({
  title: '',
  content: '',
  images: []
})

watch(() => props.note, (newNote) => {
  if (newNote) {
    isEdit.value = true
    form.value = { ...newNote }
  } else {
    isEdit.value = false
    form.value = {
      title: '',
      content: '',
      images: []
    }
  }
}, { immediate: true })

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const validation = validateImage(file)
  if (!validation.valid) {
    alert(validation.message)
    return
  }
  
  try {
    const base64 = await uploadImage(file)
    form.value.images.push(base64)
  } catch (error) {
    console.error('图片上传失败:', error)
    alert('图片上传失败，请重试')
  }
}

const removeImage = (index) => {
  form.value.images.splice(index, 1)
}

const saveNote = () => {
  if (!form.value.title.trim() && !form.value.content.trim() && form.value.images.length === 0) {
    alert('请输入笔记内容')
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
        <input 
          v-model="form.title" 
          type="text" 
          placeholder="输入标题..." 
          class="note-title-input"
        />
        
        <textarea 
          v-model="form.content" 
          placeholder="输入笔记内容..." 
          class="note-content"
          rows="8"
        ></textarea>
        
        <div class="image-upload-section">
          <label class="image-upload-btn">
            <ImagePlus class="icon" />
            <span>上传图片</span>
            <input type="file" accept="image/*" @change="handleImageUpload" hidden />
          </label>
          
          <div v-if="form.images.length > 0" class="uploaded-images">
            <div 
              v-for="(img, index) in form.images" 
              :key="index" 
              class="uploaded-image"
            >
              <img :src="img" alt="上传的图片" />
              <button @click="removeImage(index)" class="remove-image-btn">
                <Trash2 class="icon" />
              </button>
            </div>
          </div>
        </div>
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.note-editor {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.editor-header h2 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #e5e7eb;
}

.close-btn .icon {
  width: 18px;
  height: 18px;
  color: #6b7280;
}

.editor-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.note-title-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 12px;
  box-sizing: border-box;
}

.note-content {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;
}

.image-upload-section {
  margin-top: 16px;
}

.image-upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #f3f4f6;
  border: 1px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
}

.image-upload-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.image-upload-btn .icon {
  width: 18px;
  height: 18px;
}

.uploaded-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}

.uploaded-image {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
}

.uploaded-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-image-btn .icon {
  width: 14px;
  height: 14px;
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid #eee;
  background: #f8f9fa;
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}

.btn-primary:hover {
  background: #4338ca;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn .icon {
  width: 16px;
  height: 16px;
}
</style>