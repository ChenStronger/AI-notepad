import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNoteStore = defineStore('note', () => {
  const notes = ref([])
  const currentNote = ref(null)
  const loading = ref(false)
  const searchQuery = ref('')
  
  const filteredNotes = computed(() => {
    if (!searchQuery.value.trim()) {
      return notes.value
    }
    const query = searchQuery.value.toLowerCase()
    return notes.value.filter(note => 
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    )
  })
  
  const setNotes = (noteList) => {
    notes.value = noteList
  }
  
  const addNote = (note) => {
    notes.value.unshift({
      id: Date.now(),
      ...note,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }
  
  const updateNote = (id, updatedData) => {
    const index = notes.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notes.value[index] = {
        ...notes.value[index],
        ...updatedData,
        updatedAt: new Date().toISOString()
      }
    }
  }
  
  const deleteNote = (id) => {
    notes.value = notes.value.filter(n => n.id !== id)
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
    searchQuery,
    filteredNotes,
    setNotes,
    addNote,
    updateNote,
    deleteNote,
    setCurrentNote,
    getNoteById
  }
})