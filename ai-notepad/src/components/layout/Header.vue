<script setup>
import { Brain, User } from 'lucide-vue-next'
import ReminderBell from '@/components/common/ReminderBell.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'AI 记事本'
  }
})

const emit = defineEmits(['go-to-schedules', 'user-click'])

const goToSchedules = () => {
  emit('go-to-schedules')
}

const handleUserClick = () => {
  emit('user-click')
}
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <Brain class="logo-icon" />
      <h1 class="app-title">{{ title }}</h1>
    </div>
    
    <div class="header-right">
      <ReminderBell />
      <div class="user-avatar">
        <User class="user-icon" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: #4f46e5;
}

.app-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.user-icon {
  width: 18px;
  height: 18px;
  color: #4f46e5;
}
</style>