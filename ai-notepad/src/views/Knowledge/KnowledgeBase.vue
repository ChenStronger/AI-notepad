<template>
  <div class="knowledge-base">
    <div class="content-grid">
      <div class="left-panel">
        <div class="upload-sticky">
          <DocumentUpload @success="handleUploadSuccess" @error="handleError" @processed="handleUploadProcessed" />
        </div>
        <div class="document-list">
          <div class="list-header">
            <span>知识库文档 ({{ documents.length }})</span>
            <button class="refresh-btn" @click="refreshDocuments" title="刷新列表">
              <RefreshCw :size="16" />
            </button>
          </div>
          <div v-if="documents.length === 0" class="empty-list">
            <p>暂无知识库文档</p>
            <p class="hint">请上传文档</p>
          </div>
          <div v-for="doc in documents" :key="doc.id" class="document-item"
            :class="{ selected: selectedDocId === doc.id }" @click="handleSelectDoc(doc)">
            <div class="doc-icon">
              <FileText :size="18" />
            </div>
            <div class="doc-info">
              <span class="doc-name">{{ doc.name || doc.title }}</span>
              <span class="doc-meta">
                {{ formatFileSize(doc.file_size || doc.size) }} ·
                {{ formatDate(doc.created_at || doc.uploadTime) }}
                <span v-if="doc.embedding_status" class="status-badge" :class="doc.embedding_status">
                  {{ getStatusText(doc.embedding_status) }}
                </span>
              </span>
            </div>
            <button class="action-btn edit-btn" @click.stop="handleEditDoc(doc)" title="编辑">
              <Edit3 :size="16" />
            </button>
            <button class="action-btn delete-btn" @click.stop="handleDeleteDoc(doc.id)" title="删除">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="document-preview" v-if="selectedDoc">
          <div class="preview-header">
            <h3>{{ selectedDoc.name || selectedDoc.title }}</h3>
            <button class="close-btn" @click="handleClosePreview" title="关闭预览">
              <X :size="18" />
            </button>
          </div>
          <div class="preview-meta">
            <span>类型: {{ (selectedDoc.file_type || 'unknown').toUpperCase() }}</span>
            <span>大小: {{ formatFileSize(selectedDoc.file_size || selectedDoc.size) }}</span>
            <span>状态: {{ getStatusText(selectedDoc.embedding_status) }}</span>
            <span v-if="selectedDoc.chunk_count">分块数: {{ selectedDoc.chunk_count }}</span>
          </div>
          <div class="preview-content">
            <div v-if="loadingContent" class="loading-content">
              <Loader2 :size="24" class="content-spinner" />
              <span>加载中...</span>
            </div>
            <pre v-else-if="selectedDoc.content" class="content-text">{{ selectedDoc.content }}</pre>
            <p v-else class="no-content">文档内容为空</p>
          </div>
        </div>
        <div class="empty-preview" v-else>
          <FileText :size="48" />
          <p>选择文档查看内容</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { FileText, Edit3, Trash2, RefreshCw, X, Loader2 } from 'lucide-vue-next'
import DocumentUpload from '@/components/knowledge/DocumentUpload.vue'
import { useKnowledgeStore } from '@/stores/knowledge'

const knowledgeStore = useKnowledgeStore()

const selectedDocId = ref(null)
const loadingContent = ref(false)

// 从API获取文档列表
const documents = computed(() => knowledgeStore.documents)
const selectedDoc = computed(() => {
  // 优先使用 store 中获取的完整文档
  const storeSelected = knowledgeStore.selectedDoc
  if (storeSelected && storeSelected.id === selectedDocId.value) {
    return storeSelected
  }
  // 否则从列表中查找
  return documents.value.find(d => d.id === selectedDocId.value)
})

onMounted(() => {
  knowledgeStore.fetchDocuments()
})

const refreshDocuments = async () => {
  await knowledgeStore.fetchDocuments()
}

const handleUploadSuccess = async (doc) => {
  // 刷新文档列表
  await knowledgeStore.fetchDocuments()
}

const handleUploadProcessed = async (doc) => {
  // 上传并处理完成后，刷新列表并自动选中该文档
  await knowledgeStore.fetchDocuments()

  // 查找刚上传的文档
  const newDoc = documents.value.find(d => d.id === doc.id)
  if (newDoc) {
    // 选中并展示文档
    selectedDocId.value = newDoc.id
    loadingContent.value = true

    // 重新获取文档详情（确保内容已更新）
    setTimeout(async () => {
      try {
        await knowledgeStore.fetchDocument(doc.id)
        // 更新选中的文档内容
        await knowledgeStore.fetchDocuments()
      } catch (error) {
        console.error('Failed to fetch document:', error)
      } finally {
        loadingContent.value = false
      }
    }, 500)
  }
}

const handleSelectDoc = async (doc) => {
  selectedDocId.value = doc.id
  loadingContent.value = true

  try {
    await knowledgeStore.fetchDocument(doc.id)
    // 更新文档列表，确保内容已更新
    await knowledgeStore.fetchDocuments()
  } catch (error) {
    console.error('Failed to fetch document content:', error)
  } finally {
    loadingContent.value = false
  }
}

const handleClosePreview = () => {
  selectedDocId.value = null
}

const handleEditDoc = (doc) => {
  const newName = prompt('编辑文档名称：', doc.name || doc.title)
  if (newName && newName !== doc.name) {
    // 调用 API 更新文档名称
    knowledgeStore.updateDocument(doc.id, { name: newName })
  }
}

const handleDeleteDoc = async (id) => {
  if (confirm('确定要删除这个文档吗？删除后将无法恢复。')) {
    try {
      await knowledgeStore.deleteDocument(id)
      if (selectedDocId.value === id) {
        selectedDocId.value = null
      }
    } catch (error) {
      alert('删除失败：' + error.message)
    }
  }
}

const handleError = (msg) => {
  alert(msg)
}

const formatFileSize = (bytes) => {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': '待处理',
    'processing': '处理中',
    'done': '已完成',
    'failed': '失败'
  }
  return statusMap[status] || status || '未知'
}
</script>

<style scoped>
.knowledge-base {
  height: 100%;
}

.content-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;
  height: calc(100vh - 160px);
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100vh - 100px);
}

.upload-sticky {
  flex-shrink: 0;
}

.document-list {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 16px;
  overflow-y: auto;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
}

.refresh-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: #f3f4f6;
  color: #3b82f6;
}

.empty-list {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-list p {
  margin: 0;
  font-size: 14px;
}

.empty-list .hint {
  margin-top: 8px;
  font-size: 12px;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  border: 2px solid transparent;
}

.document-item:hover {
  background: #f3f4f6;
}

.document-item.selected {
  background: #eff6ff;
  border-color: #3b82f6;
}

.document-item .doc-info {
  flex: 1;
  min-width: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  opacity: 0;
}

.document-item:hover .action-btn {
  opacity: 1;
}

.action-btn.edit-btn:hover {
  background: #eff6ff;
  color: #3b82f6;
}

.action-btn.delete-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.doc-icon {
  width: 36px;
  height: 36px;
  background: #eff6ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  flex-shrink: 0;
}

.doc-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.doc-name {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-meta {
  font-size: 12px;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.status-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.status-badge.done {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.processing {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.failed {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge.pending {
  background: #f3f4f6;
  color: #6b7280;
}

/* 右侧预览区域 */
.right-panel {
  background: white;
  border-radius: 8px;
  padding: 24px;
  overflow-y: auto;
}

.document-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.preview-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
  color: #6b7280;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #9ca3af;
}

.content-spinner {
  animation: spin 1s linear infinite;
  color: #3b82f6;
  margin-bottom: 12px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.content-text {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  margin: 0;
}

.no-content {
  text-align: center;
  color: #9ca3af;
  padding: 40px;
}

.empty-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}

.empty-preview p {
  margin-top: 16px;
  font-size: 14px;
}
</style>
