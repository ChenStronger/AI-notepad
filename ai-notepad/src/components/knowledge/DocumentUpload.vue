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
          <span>文档处理中</span>
        </div>
        <div class="modal-body">
          <!-- 步骤指示器 -->
          <div class="steps-container">
            <div class="processing-step" :class="{ active: currentStep >= 1, done: currentStep > 1 }">
              <span class="step-number">{{ currentStep > 1 ? '✓' : '1' }}</span>
              <span>加载文档</span>
            </div>
            <div class="step-line" :class="{ active: currentStep >= 2 }"></div>
            <div class="processing-step" :class="{ active: currentStep >= 2, done: currentStep > 2 }">
              <span class="step-number">{{ currentStep > 2 ? '✓' : '2' }}</span>
              <span>文档分块</span>
            </div>
            <div class="step-line" :class="{ active: currentStep >= 3 }"></div>
            <div class="processing-step" :class="{ active: currentStep >= 3, done: currentStep > 3 }">
              <span class="step-number">{{ currentStep > 3 ? '✓' : '3' }}</span>
              <span>向量化</span>
            </div>
            <div class="step-line" :class="{ active: currentStep >= 4 }"></div>
            <div class="processing-step" :class="{ active: currentStep >= 4, done: currentStep > 4 }">
              <span class="step-number">{{ currentStep > 4 ? '✓' : '4' }}</span>
              <span>保存</span>
            </div>
          </div>

          <!-- 进度条 -->
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
              <div class="progress-text">{{ progressPercent }}%</div>
            </div>
          </div>

          <!-- 状态信息 -->
          <div class="status-info">
            <p class="processing-text">{{ processingText }}</p>
            <p v-if="estimatedTime" class="estimated-time">预计剩余时间: {{ estimatedTime }}</p>
          </div>

          <!-- 错误信息 -->
          <div v-if="errorMessage" class="error-message">
            <AlertCircle :size="16" />
            <span>{{ errorMessage }}</span>
          </div>
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
import { ref, computed } from 'vue'
import { Upload, Loader2, AlertCircle, RefreshCw } from 'lucide-vue-next'
import { knowledgeApi } from '@/api/knowledge'

const emit = defineEmits(['success', 'error', 'processed'])

const fileInput = ref(null)
const isDragging = ref(false)
const uploading = ref(false)
const showProcessingModal = ref(false)
const currentStep = ref(0)
const processingText = ref('')
const progressPercent = ref(0)
const startTime = ref(null)
const errorMessage = ref('')
const allowRetry = ref(false)
const showCancel = ref(false)
const currentDocId = ref(null)
const processingFile = ref(null)

// 计算预计剩余时间
const estimatedTime = computed(() => {
  if (!startTime.value || progressPercent.value <= 0) return ''

  const elapsed = (Date.now() - startTime.value) / 1000
  const rate = progressPercent.value / elapsed

  if (rate <= 0) return '计算中...'

  const remainingPercent = 100 - progressPercent.value
  const remainingSeconds = Math.ceil(remainingPercent / rate)

  if (remainingSeconds < 60) {
    return `${remainingSeconds}秒`
  } else if (remainingSeconds < 3600) {
    const minutes = Math.floor(remainingSeconds / 60)
    const seconds = remainingSeconds % 60
    return `${minutes}分${seconds}秒`
  } else {
    const hours = Math.floor(remainingSeconds / 3600)
    const minutes = Math.floor((remainingSeconds % 3600) / 60)
    return `${hours}小时${minutes}分`
  }
})

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

const setProcessingStep = (step, text) => {
  currentStep.value = step
  processingText.value = text
  errorMessage.value = ''
}

const closeModal = () => {
  showProcessingModal.value = false
  currentStep.value = 0
  processingText.value = ''
  progressPercent.value = 0
  startTime.value = null
  errorMessage.value = ''
  allowRetry.value = false
  showCancel.value = false
  currentDocId.value = null
}

const uploadFile = async (file) => {
  uploading.value = true
  showProcessingModal.value = true
  startTime.value = Date.now()
  progressPercent.value = 0
  errorMessage.value = ''
  allowRetry.value = false
  showCancel.value = false
  processingFile.value = file

  const formData = new FormData()
  formData.append('file', file)

  try {
    setProcessingStep(1, '正在上传文档...')
    progressPercent.value = 5

    const response = await knowledgeApi.uploadDocument(formData)
    currentDocId.value = response.id

    setProcessingStep(2, '正在分割文档...')
    progressPercent.value = 25

    // 轮询检查向量化状态
    await pollEmbeddingStatus(response.id)

    setProcessingStep(4, '处理完成！')
    progressPercent.value = 100
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('success', response)
    emit('processed', response)

    // 完成后关闭弹窗
    closeModal()
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
  setProcessingStep(3, '正在向量化处理...')

  const maxRetries = 180 // 最多等待180秒（3分钟）
  let retryCount = 0
  let lastProgressUpdate = Date.now()

  const getInterval = (count) => {
    if (count < 5) return 800
    if (count < 15) return 1200
    if (count < 30) return 2000
    return 3000
  }

  while (retryCount < maxRetries) {
    const interval = getInterval(retryCount)
    await new Promise(resolve => setTimeout(resolve, interval))

    try {
      const doc = await knowledgeApi.getDocument(docId)

      // 更新进度
      if (doc.embedding_progress !== undefined) {
        progressPercent.value = Math.min(95, doc.embedding_progress)
        lastProgressUpdate = Date.now()
      }

      // 更新状态消息
      if (doc.embedding_message) {
        processingText.value = doc.embedding_message
      }

      if (doc.embedding_status === 'done') {
        return
      } else if (doc.embedding_status === 'failed') {
        throw new Error(doc.embedding_message || '向量化失败')
      }
    } catch (error) {
      console.warn('轮询时发生错误:', error)
    }

    // 检查进度是否停滞
    const now = Date.now()
    if (now - lastProgressUpdate > 30000 && retryCount > 10) {
      processingText.value = '连接中...'
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
  cursor: not-allowed;
  opacity: 0.6;
}

.upload-area svg {
  display: block;
  margin: 0 auto 12px;
  color: #6b7280;
}

.upload-area p {
  margin: 0 0 8px;
  color: #374151;
}

.upload-area .link {
  color: #3b82f6;
  text-decoration: underline;
}

.upload-area .hint {
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 0;
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.modal-header .spinner {
  color: #3b82f6;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.modal-header span {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

/* 步骤容器 */
.steps-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 0 8px;
}

.processing-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

.processing-step.active .step-number {
  background: #3b82f6;
  color: white;
}

.processing-step.done .step-number {
  background: #10b981;
  color: white;
}

.processing-step span:last-child {
  font-size: 12px;
  color: #6b7280;
}

.processing-step.active span:last-child {
  color: #3b82f6;
}

.processing-step.done span:last-child {
  color: #10b981;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #e5e7eb;
  margin: 0 4px;
  transition: all 0.3s;
}

.step-line.active {
  background: #3b82f6;
}

/* 进度条 */
.progress-container {
  margin-bottom: 16px;
}

.progress-bar {
  position: relative;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

/* 状态信息 */
.status-info {
  text-align: center;
}

.processing-text {
  font-size: 14px;
  color: #374151;
  margin: 0 0 8px;
}

.estimated-time {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

/* 错误信息 */
.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #fef2f2;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  margin-top: 16px;
}

/* 弹窗按钮 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.retry-btn,
.cancel-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn {
  background: #3b82f6;
  color: white;
  border: none;
}

.retry-btn:hover {
  background: #2563eb;
}

.cancel-btn {
  background: #e5e7eb;
  color: #374151;
  border: none;
}

.cancel-btn:hover {
  background: #d1d5db;
}
</style>
