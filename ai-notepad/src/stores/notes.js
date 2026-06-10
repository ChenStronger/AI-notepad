import { reactive } from 'vue'

const notesStore = reactive({
  notes: [],
  addNote(note) {
    this.notes.unshift({
      id: Date.now(),
      ...note,
      createdAt: new Date().toISOString()
    })
  },
  updateNote(id, updatedNote) {
    const index = this.notes.findIndex(n => n.id === id)
    if (index !== -1) {
      this.notes[index] = { ...this.notes[index], ...updatedNote, updatedAt: new Date().toISOString() }
    }
  },
  deleteNote(id) {
    this.notes = this.notes.filter(n => n.id !== id)
  },
  getNoteById(id) {
    return this.notes.find(n => n.id === id)
  }
})

export default notesStore