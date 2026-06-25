import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notesAPI } from '@/api/notes'

export const useNoteStore = defineStore('note', () => {
  const notes = ref([])
  const currentNote = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const searchQuery = ref('')

  const filteredNotes = computed(() => {
    if (!searchQuery.value.trim()) {
      return notes.value
    }
    const query = searchQuery.value.toLowerCase()
    return notes.value.filter(note =>
      (note.title && note.title.toLowerCase().includes(query)) ||
      (note.content && note.content.toLowerCase().includes(query))
    )
  })

  // 从 API 获取笔记列表
  const fetchNotes = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await notesAPI.getList()
      console.log('API response:', res, 'type:', typeof res, 'isArray:', Array.isArray(res))
      // 后端返回 {"value": [...], "Count": 5} 格式
      notes.value = Array.isArray(res) ? res : (res.value || res.notes || res.data || [])
      console.log('Notes loaded:', notes.value.length)
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch notes:', err)
    } finally {
      loading.value = false
    }
  }

  // 创建笔记
  const createNote = async (data) => {
    try {
      const res = await notesAPI.create(data)
      const newNote = res.note || res
      notes.value.unshift(newNote)
      return newNote
    } catch (err) {
      error.value = err.message
      console.error('Failed to create note:', err)
      throw err
    }
  }

  // 更新笔记
  const updateNote = async (id, data) => {
    try {
      const res = await notesAPI.update(id, data)
      const updatedNote = res.note || res
      const index = notes.value.findIndex(n => n.id === id)
      if (index !== -1) {
        notes.value[index] = { ...notes.value[index], ...updatedNote }
      }
      return updatedNote
    } catch (err) {
      error.value = err.message
      console.error('Failed to update note:', err)
      throw err
    }
  }

  // 删除笔记
  const deleteNote = async (id) => {
    try {
      await notesAPI.delete(id)
      notes.value = notes.value.filter(n => n.id !== id)
      if (currentNote.value?.id === id) {
        currentNote.value = null
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to delete note:', err)
      throw err
    }
  }

  const setCurrentNote = (note) => {
    currentNote.value = note
  }

  const getNoteById = (id) => {
    return notes.value.find(n => n.id === id)
  }

  return {
    notes,
    currentNote,
    loading,
    error,
    searchQuery,
    filteredNotes,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    setCurrentNote,
    getNoteById
  }
})
