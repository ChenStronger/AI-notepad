<script setup>
import { computed } from 'vue'
import { Bell } from 'lucide-vue-next'
import { useScheduleStore } from '@/stores/schedule'

const scheduleStore = useScheduleStore()

const todayCount = computed(() => scheduleStore.todaySchedules.length)
const hasReminder = computed(() => todayCount.value > 0)
</script>

<template>
  <div class="reminder-bell" :class="{ 'has-reminder': hasReminder }">
    <Bell class="bell-icon" />
    <span v-if="hasReminder" class="reminder-count">{{ todayCount }}</span>
  </div>
</template>

<style scoped>
.reminder-bell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f3f4f6;
  cursor: pointer;
}

.reminder-bell:hover {
  background: #e5e7eb;
}

.reminder-bell.has-reminder {
  background: #fef3c7;
}

.bell-icon {
  width: 18px;
  height: 18px;
  color: #6b7280;
}

.reminder-bell.has-reminder .bell-icon {
  color: #d97706;
}

.reminder-count {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: #dc2626;
  color: white;
  font-size: 12px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>