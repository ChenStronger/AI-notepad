<script setup>
import { ref } from 'vue'
import { ImagePlus, Trash2, ZoomIn } from 'lucide-vue-next'
import { uploadImage, validateImage } from '@/utils/imageUpload'

const images = ref([])
const selectedImage = ref(null)

const handleUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const validation = validateImage(file)
  if (!validation.valid) {
    alert(validation.message)
    return
  }
  
  try {
    const base64 = await uploadImage(file)
    images.value.unshift({
      id: Date.now(),
      url: base64,
      name: file.name,
      createdAt: new Date().toISOString()
    })
  } catch (error) {
    alert('图片上传失败')
  }
}

const deleteImage = (id) => {
  if (confirm('确定要删除这张图片吗？')) {
    images.value = images.value.filter(img => img.id !== id)
  }
}

const viewImage = (image) => {
  selectedImage.value = image
}

const closeViewer = () => {
  selectedImage.value = null
}
</script>

<template>
  <div class="image-gallery">
    <div class="gallery-header">
      <h2>图片库</h2>
      <label class="upload-btn">
        <ImagePlus class="icon" />
        上传图片
        <input type="file" accept="image/*" @change="handleUpload" hidden />
      </label>
    </div>
    
    <div v-if="images.length === 0" class="empty-state">
      <ImagePlus class="empty-icon" />
      <p>暂无图片</p>
      <p class="hint">点击上方按钮上传图片</p>
    </div>
    
    <div v-else class="images-grid">
      <div 
        v-for="image in images" 
        :key="image.id" 
        class="image-card"
      >
        <img :src="image.url" :alt="image.name" class="image-preview" />
        <div class="image-overlay">
          <button @click="viewImage(image)" class="overlay-btn">
            <ZoomIn class="icon" />
          </button>
          <button @click="deleteImage(image.id)" class="overlay-btn delete">
            <Trash2 class="icon" />
          </button>
        </div>
        <div class="image-info">
          <span class="image-name">{{ image.name }}</span>
        </div>
      </div>
    </div>
    
    <!-- 图片查看器 -->
    <div v-if="selectedImage" class="image-viewer" @click="closeViewer">
      <img :src="selectedImage.url" :alt="selectedImage.name" class="viewer-image" />
      <button @click="closeViewer" class="close-btn">×</button>
    </div>
  </div>
</template>

<style scoped>
.image-gallery {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.gallery-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1f2937;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #4f46e5;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.upload-btn:hover {
  background: #4338ca;
}

.upload-btn .icon {
  width: 16px;
  height: 16px;
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

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  overflow-y: auto;
  flex: 1;
}

.image-card {
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.image-preview {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 60px;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-card:hover .image-overlay {
  opacity: 1;
}

.overlay-btn {
  width: 40px;
  height: 40px;
  background: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-btn .icon {
  width: 20px;
  height: 20px;
  color: #374151;
}

.overlay-btn.delete .icon {
  color: #dc2626;
}

.image-info {
  padding: 12px;
  background: white;
}

.image-name {
  font-size: 14px;
  color: #374151;
}

.image-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.viewer-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: white;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
}
</style>