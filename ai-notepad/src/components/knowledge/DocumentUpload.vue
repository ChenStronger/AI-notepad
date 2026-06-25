<template>
  <div class="document-upload">
    <div class="upload-area" :class="{ dragging: isDragging, disabled: uploading }"
      @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop"
      @click="triggerFileInput">
      <input type="file" ref="fileInput" @change="handleFileSelect" accept=".txt,.md,.pdf,.docx" hidden />
      <Upload :size="32" />
      <p>拖拽文件到此处，或 <span class="link">点击上传</span></p>
      <p class="hint">支持 TXT, MD, PDF, DOCX 格式</p>
    </div>

    <!-- 处理中弹窗 -->
    <div v-if="showProcessingModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <Loader2 :size="24" class="spinner" />
          <span>{{ processingText }}</span>
        </div>

        <!-- 错误信息 -->
        <div v-if="errorMessage" class="error-message">
          <AlertCircle :size="16" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- 操作按钮 -->
        <div class="modal-footer">
          <button v-if="allowRetry" class="retry-btn" @click="retryProcessing">
            <RefreshCw :size="16" />
            重试
          </button>
          <button v-if="showCancel" class="cancel-btn" @click="cancelProcessing">
            取消
          </button>
        </div>
      </div>
    </div>

    <!-- 成功提示 -->
    <div v-if="showSuccessToast" class="success-toast">
      <CheckCircle :size="20" />
      <span>文档上传成功！</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Upload, Loader2, AlertCircle, RefreshCw, CheckCircle } from 'lucide-vue-next'
import { knowledgeApi } from '@/api/knowledge'

const emit = defineEmits(['success', 'error', 'processed'])

const fileInput = ref(null)
const isDragging = ref(false)
const uploading = ref(false)
const showProcessingModal = ref(false)
const showSuccessToast = ref(false)
const processingText = ref('')
const errorMessage = ref('')
const allowRetry = ref(false)
const showCancel = ref(false)
const currentDocId = ref(null)
const processingFile = ref(null)

const triggerFileInput = () => {
  if (!uploading.value) {
    fileInput.value?.click()
  }
}

const handleFileSelect = (event) => {
  const files = event.target.files
  if (files.length > 0 && !uploading.value) {
    uploadFile(files[0])
  }
}

const handleDrop = (event) => {
  isDragging.value = false
  const files = event.dataTransfer.files
  if (files.length > 0 && !uploading.value) {
    uploadFile(files[0])
  }
}

const closeModal = () => {
  showProcessingModal.value = false
  processingText.value = ''
  errorMessage.value = ''
  allowRetry.value = false
  showCancel.value = false
  currentDocId.value = null
}

const uploadFile = async (file) => {
  uploading.value = true
  showProcessingModal.value = true
  errorMessage.value = ''
  allowRetry.value = false
  showCancel.value = false
  processingFile.value = file

  const formData = new FormData()
  formData.append('file', file)

  try {
    processingText.value = '正在上传文档...'

    const response = await knowledgeApi.uploadDocument(formData)
    currentDocId.value = response.id

    processingText.value = '正在处理文档...'

    // 轮询检查向量化状态
    await pollEmbeddingStatus(response.id)

    // 关闭处理弹窗
    closeModal()

    // 显示成功提示
    showSuccessToast.value = true
    setTimeout(() => {
      showSuccessToast.value = false
    }, 3000)

    emit('success', response)
    emit('processed', response)

    uploading.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }

  } catch (error) {
    console.error('上传失败:', error)
    processingText.value = '处理失败'
    errorMessage.value = error.message || '上传失败'
    allowRetry.value = true
    showCancel.value = true
    emit('error', error.message || '上传失败')
  }
}

const pollEmbeddingStatus = async (docId) => {
  const maxRetries = 180
  let retryCount = 0

  const getInterval = (count) => {
    if (count < 5) return 1000
    if (count < 15) return 2000
    if (count < 30) return 3000
    return 4000
  }

  while (retryCount < maxRetries) {
    const interval = getInterval(retryCount)
    await new Promise(resolve => setTimeout(resolve, interval))

    try {
      const doc = await knowledgeApi.getDocument(docId)

      if (doc.embedding_status === 'done') {
        return
      } else if (doc.embedding_status === 'failed') {
        throw new Error('向量化处理失败')
      }
    } catch (error) {
      // 如果是 404 错误，说明文档不存在
      if (error.response?.status === 404) {
        throw new Error('文档上传失败，服务器未找到该文档')
      }
      // 其他错误继续重试
      console.warn('轮询时发生错误:', error)
    }

    retryCount++
  }

  throw new Error('处理超时，请重试')
}

const retryProcessing = () => {
  if (processingFile.value) {
    uploadFile(processingFile.value)
  }
}

const cancelProcessing = () => {
  uploading.value = false
  closeModal()
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.document-upload {
  background: white;
  border-radius: 8px;
  padding: 24px;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: #3b82f6;
  background-color: #f8fafc;
}

.upload-area.dragging {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.upload-area.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-area .link {
  color: #3b82f6;
  text-decoration: underline;
}

.upload-area .hint {
  color: #9ca3af;
  font-size: 12px;
  margin-top: 8px;
}

/* 弹窗样式 */
.modal-overlay {
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

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  min-width: 320px;
  text-align: center;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.spinner {
  animation: spin 1s linear infinite;
  color: #3b82f6;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #ef4444;
  margin-bottom: 16px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-footer button {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.retry-btn {
  background-color: #3b82f6;
  color: white;
}

.cancel-btn {
  background-color: #e5e7eb;
  color: #374151;
}

/* 成功提示 */
.success-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #10b981;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2000;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}
</style>