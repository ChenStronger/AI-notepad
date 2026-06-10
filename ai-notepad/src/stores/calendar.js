import { reactive } from 'vue'

const calendarStore = reactive({
  events: [],
  addEvent(event) {
    this.events.push({
      id: Date.now(),
      ...event,
      createdAt: new Date().toISOString()
    })
  },
  updateEvent(id, updatedEvent) {
    const index = this.events.findIndex(e => e.id === id)
    if (index !== -1) {
      this.events[index] = { ...this.events[index], ...updatedEvent, updatedAt: new Date().toISOString() }
    }
  },
  deleteEvent(id) {
    this.events = this.events.filter(e => e.id !== id)
  },
  getEventsByDate(date) {
    const targetDate = new Date(date).toDateString()
    return this.events.filter(e => new Date(e.date).toDateString() === targetDate)
  },
  getUpcomingEvents() {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return this.events.filter(e => new Date(e.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date))
  }
})

export default calendarStore