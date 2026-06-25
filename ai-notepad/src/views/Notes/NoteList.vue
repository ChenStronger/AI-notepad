<script setup>
import { ref, computed, onMounted } from 'vue'
import { FileText, Edit3, Trash2, Plus, Search, Calendar, Clock, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import { useNoteStore } from '@/stores/note'
import NoteEditor from './NoteEditor.vue'

const noteStore = useNoteStore()
const showEditor = ref(false)
const editingNote = ref(null)
const searchQuery = ref('')
const selectedYear = ref('')
const selectedMonth = ref('')
const selectedDay = ref('')

const currentPage = ref(1)
const pageSize = ref(10)

// 页面加载时获取数据
onMounted(() => {
  noteStore.fetchNotes()
})

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

const years = Array.from({ length: 50 }, (_, i) => 2024 + i)
const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))

const allFilteredNotes = computed(() => {
  let notes = noteStore.notes

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    notes = notes.filter(note =>
      note.title?.toLowerCase().includes(query) ||
      note.content?.toLowerCase().includes(query)
    )
  }

  // 日期过滤：支持年份、月份、日期单独或组合搜索
  if (selectedYear.value || selectedMonth.value || selectedDay.value) {
    notes = notes.filter(note => {
      const noteDate = new Date(note.createdAt || note.created_at)
      const noteYear = noteDate.getFullYear().toString()
      const noteMonth = String(noteDate.getMonth() + 1).padStart(2, '0')
      const noteDay = String(noteDate.getDate()).padStart(2, '0')

      // 检查年份匹配
      if (selectedYear.value && noteYear !== selectedYear.value.toString()) {
        return false
      }

      // 检查月份匹配
      if (selectedMonth.value && noteMonth !== selectedMonth.value) {
        return false
      }

      // 检查日期匹配
      if (selectedDay.value && noteDay !== selectedDay.value) {
        return false
      }

      return true
    })
  }

  console.log('Filtered notes:', notes.length, 'Total:', noteStore.notes.length)
  return notes
})

const totalPages = computed(() => {
  return Math.ceil(allFilteredNotes.value.length / pageSize.value)
})

const filteredNotes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return allFilteredNotes.value.slice(start, end)
})

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

const goToFirstPage = () => {
  currentPage.value = 1
}

const goToPrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const goToLastPage = () => {
  currentPage.value = totalPages.value
}

const handleSearch = () => {
  currentPage.value = 1
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}
</script>

<template>
  <div class="note-list">

    <div class="search-section">
      <div class="search-bar">
        <div class="search-input-wrapper">
          <Search class="search-icon" />
          <input v-model="searchQuery" type="text" placeholder="搜索笔记标题或内容..." class="search-input" />
        </div>

        <div class="date-selector">
          <select v-model="selectedYear" class="date-select year-select">
            <option value="">年份</option>
            <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
          </select>
          <select v-model="selectedMonth" class="date-select month-select">
            <option value="">月份</option>
            <option v-for="month in months" :key="month" :value="month">{{ month }}月</option>
          </select>
          <select v-model="selectedDay" class="date-select day-select">
            <option value="">日期</option>
            <option v-for="day in days" :key="day" :value="day">{{ day }}日</option>
          </select>
        </div>
        <button @click="handleSearch" class="search-btn">
          <Search class="btn-icon" />
          <span>搜索</span>
        </button>
        <button @click="openEditor()" class="add-btn">
          <Plus class="icon" />
          <span>新建笔记</span>
        </button>

      </div>
    </div>

    <div class="notes-table-container">
      <div class="table-header">
        <div class="th th-index">序号</div>
        <div class="th th-title">标题</div>
        <div class="th th-time">时间</div>
        <div class="th th-remark">备注</div>
        <div class="th th-action">操作</div>
      </div>

      <div class="table-body">
        <div v-for="(note, index) in filteredNotes" :key="note.id" class="table-row">
          <div class="td td-index">{{ index + 1 }}</div>
          <div class="td td-title" @click="openEditor(note)">{{ note.title || '无标题' }}</div>
          <div class="td td-time">{{ formatDate(note.created_at || note.createdAt) }}</div>
          <div class="td td-remark">{{ note.content?.substring(0, 30) }}{{ note.content?.length > 30 ? '...' : '' }}
          </div>
          <div class="td td-action">
            <button @click="openEditor(note)" class="action-btn edit-btn">
              <Edit3 class="btn-icon" />
              <span>编辑</span>
            </button>
            <button @click="deleteNote(note.id)" class="action-btn delete-btn">
              <Trash2 class="btn-icon" />
              <span>删除</span>
            </button>
          </div>
        </div>

        <div v-if="filteredNotes.length === 0" class="empty-row">
          <div class="empty-content">
            <FileText class="empty-icon" />
            <span>暂无笔记</span>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button @click="goToFirstPage" :disabled="currentPage === 1" class="pagination-btn first-btn">
          <ChevronsLeft class="pagination-icon" />
        </button>
        <button @click="goToPrevPage" :disabled="currentPage === 1" class="pagination-btn prev-btn">
          <ChevronLeft class="pagination-icon" />
        </button>

        <div class="page-numbers">
          <span v-for="page in totalPages" :key="page" @click="goToPage(page)" class="page-number"
            :class="{ active: currentPage === page }">
            {{ page }}
          </span>
        </div>

        <button @click="goToNextPage" :disabled="currentPage === totalPages" class="pagination-btn next-btn">
          <ChevronRight class="pagination-icon" />
        </button>
        <button @click="goToLastPage" :disabled="currentPage === totalPages" class="pagination-btn last-btn">
          <ChevronsRight class="pagination-icon" />
        </button>

        <span class="pagination-info">
          第 {{ currentPage }} / {{ totalPages }} 页
        </span>
      </div>
    </div>

    <NoteEditor v-if="showEditor" :note="editingNote" @saved="closeEditor" @cancel="closeEditor" />
  </div>
</template>

<style scoped>
.note-list {
  min-height: calc(100vh - 120px);
  height: 500px;
  display: flex;
  flex-direction: column;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 50%, #f8fafc 100%);
  background-attachment: fixed;
}

.page-header {
  margin-bottom: 20px;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.header-info h1 {
  margin: 0;
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
}

.header-subtitle {
  margin: 8px 0 0 0;
  font-size: 16px;
  color: #6b7280;
}

.search-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
}

.search-bar {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-input-wrapper {
  flex: 2;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #9ca3af;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.date-selector {
  flex: 1;
  display: flex;
  gap: 8px;
}

.date-select {
  flex: 1;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 14px;
  padding: 12px 32px 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s;
}

.date-select:hover {
  border-color: #d1d5db;
}

.date-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.add-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
}

.add-btn .icon {
  width: 18px;
  height: 18px;
}

.search-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
}

.search-btn .btn-icon {
  width: 18px;
  height: 18px;
}

.notes-table-container {
  flex: 1;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);

  border: 1px solid #e5e7eb;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 220px);
}

.table-header {
  display: flex;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  font-weight: 600;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.th {
  padding: 18px 16px;
  font-size: 13px;
  text-align: center;
  letter-spacing: 0.8px;
  box-sizing: border-box;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.th-index {
  width: 60px;
  flex-shrink: 0;
}

.th-title {
  width: 20%;
  text-align: center;
}

.th-time {
  width: 160px;
  flex-shrink: 0;
}

.th-remark {
  width: 50%;
  text-align: center;
}

.th-action {
  width: 160px;
  flex-shrink: 0;
}

.table-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
}

.table-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  position: relative;
}

.table-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.table-row:hover::before {
  opacity: 1;
}

.table-row:hover {
  background-color: #f8fafc;
  transform: translateX(2px);
}

.table-row:last-child {
  border-bottom: none;
  border-radius: 0 0 20px 20px;
}

.td {
  padding: 16px 20px;
  font-size: 13px;
  color: #374151;
  box-sizing: border-box;
}

.td-index {
  width: 60px;
  flex-shrink: 0;
  color: #9ca3af;
  font-weight: 600;
  font-size: 13px;
  text-align: center;
}

.td-title {
  width: 20%;
  font-weight: 500;
  cursor: pointer;
  color: #1f2937;
  font-size: 14px;
  line-height: 1.5;
  transition: color 0.2s;
  text-align: center;
}

.td-title:hover {
  color: #6366f1;
}

.td-time {
  width: 160px;
  flex-shrink: 0;
  color: #6b7280;
  font-size: 13px;
  text-align: center;
}

.td-remark {
  width: 50%;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
  padding-right: 24px;
}

.td-action {
  width: 160px;
  flex-shrink: 0;
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.btn-icon {
  width: 14px;
  height: 14px;
}

.edit-btn {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #6366f1;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
}

.edit-btn:hover {
  background: linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 100%);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.25);
  transform: translateY(-1px);
}

.edit-btn:active {
  transform: translateY(0);
}

.delete-btn {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #ef4444;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.15);
}

.delete-btn:hover {
  background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.25);
  transform: translateY(-1px);
}

.delete-btn:active {
  transform: translateY(0);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid #f1f5f9;
  background: #fafafa;
}

.pagination-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.pagination-btn:hover:not(:disabled) {
  background: #f0f5ff;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-icon {
  width: 16px;
  height: 16px;
  color: #6366f1;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #6b7280;
  transition: all 0.2s;
}

.page-number:hover {
  background: #f0f5ff;
  color: #6366f1;
}

.page-number.active {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  font-weight: 600;
}

.pagination-info {
  margin-left: 12px;
  font-size: 13px;
  color: #9ca3af;
}

.empty-row {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #9ca3af;
}

.empty-icon {
  width: 48px;
  height: 48px;
}

@media (max-width: 900px) {
  .search-bar {
    flex-wrap: wrap;
  }

  .search-input-wrapper {
    width: 100%;
  }

  .date-selector {
    width: 100%;
  }

  .th-time,
  .td-time {
    display: none;
  }

  .th-action {
    width: 120px;
  }

  .td-action {
    width: 120px;
  }
}
</style>
