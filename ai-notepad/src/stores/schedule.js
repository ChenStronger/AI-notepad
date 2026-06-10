import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useScheduleStore = defineStore('schedule', () => {
  const schedules = ref([])
  const currentSchedule = ref(null)
  const loading = ref(false)
  const selectedDate = ref(new Date())
  
  const todaySchedules = computed(() => {
    const today = new Date().toDateString()
    return schedules.value.filter(s => new Date(s.date).toDateString() === today)
  })
  
  const upcomingSchedules = computed(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return schedules.value
      .filter(s => new Date(s.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  })
  
  const monthlySchedules = computed(() => {
    const year = selectedDate.value.getFullYear()
    const month = selectedDate.value.getMonth()
    return schedules.value.filter(s => {
      const d = new Date(s.date)
      return d.getFullYear() === year && d.getMonth() === month
    })
  })
  
  const setSchedules = (scheduleList) => {
    schedules.value = scheduleList
  }
  
  const addSchedule = (schedule) => {
    schedules.value.push({
      id: Date.now(),
      ...schedule,
      createdAt: new Date().toISOString()
    })
  }
  
  const updateSchedule = (id, updatedData) => {
    const index = schedules.value.findIndex(s => s.id === id)
    if (index !== -1) {
      schedules.value[index] = {
        ...schedules.value[index],
        ...updatedData,
        updatedAt: new Date().toISOString()
      }
    }
  }
  
  const deleteSchedule = (id) => {
    schedules.value = schedules.value.filter(s => s.id !== id)
  }
  
  const setCurrentSchedule = (schedule) => {
    currentSchedule.value = schedule
  }
  
  const getScheduleById = (id) => {
    return schedules.value.find(s => s.id === id)
  }
  
  const getSchedulesByDate = (date) => {
    const targetDate = new Date(date).toDateString()
    return schedules.value.filter(s => new Date(s.date).toDateString() === targetDate)
  }

  return {
    schedules,
    currentSchedule,
    loading,
    selectedDate,
    todaySchedules,
    upcomingSchedules,
    monthlySchedules,
    setSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    setCurrentSchedule,
    getScheduleById,
    getSchedulesByDate
  }
})