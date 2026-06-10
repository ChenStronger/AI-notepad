<script setup>
import { ref } from 'vue'
import { ImagePlus, X } from 'lucide-vue-next'
import { uploadImage, validateImage } from '@/utils/imageUpload'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  maxImages: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['update:modelValue'])

const images = ref([...props.modelValue])

const handleUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  if (images.value.length >= props.maxImages) {
    alert(`最多只能上传${props.maxImages}张图片`)
    return
  }
  
  const validation = validateImage(file)
  if (!validation.valid) {
    alert(validation.message)
    return
  }
  
  try {
    const base64 = await uploadImage(file)
    images.value.push(base64)
    emit('update:modelValue', images.value)
  } catch (error) {
    alert('图片上传失败')
  }
}

const removeImage = (index) => {
  images.value.splice(index, 1)
  emit('update:modelValue', images.value)
}
</script>

<template>
  <div class="image-uploader">
    <div class="upload-area">
      <label class="upload-btn" v-if="images.length < maxImages">
        <ImagePlus class="icon" />
        <span>上传图片</span>
        <input type="file" accept="image/*" @change="handleUpload" hidden />
      </label>
      
      <div class="images-preview">
        <div 
          v-for="(img, index) in images" 
          :key="index" 
          class="preview-item"
        >
          <img :src="img" alt="预览图片" />
          <button @click="removeImage(index)" class="remove-btn">
            <X class="icon" />
          </button>
        </div>
      </div>
    </div>
    
    <p class="hint">最多上传{{ maxImages }}张图片，单张不超过5MB</p>
  </div>
</template>

<style scoped>
.image-uploader {
  width: 100%;
}

.upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px;
  background: #f3f4f6;
  border: 1px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
}

.upload-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.upload-btn .icon {
  width: 18px;
  height: 18px;
}

.images-preview {
  display: flex;
  gap: 12px;
}

.preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn .icon {
  width: 12px;
  height: 12px;
}

.hint {
  margin-top: 8px;
  font-size: 12px;
  color: #9ca3af;
}
</style>