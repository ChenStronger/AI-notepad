<script setup>
import { Home, FileText, BookOpen } from 'lucide-vue-next'

defineProps({
  activeTab: {
    type: String,
    default: 'home'
  }
})

const emit = defineEmits(['change-tab'])

const menuItems = [
  { id: 'home', label: '主页', icon: Home },
  { id: 'notes', label: '记事本', icon: FileText }
]
</script>

<template>
  <header class="sidebar">
    <div class="sidebar-left">
      <BookOpen class="logo-icon" />
      <span class="logo-text">AI Notepad</span>
    </div>
    <nav class="sidebar-nav">
      <button v-for="item in menuItems" :key="item.id" @click="emit('change-tab', item.id)" class="nav-item"
        :class="{ active: activeTab === item.id }">
        <component :is="item.icon" class="nav-icon" />
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </nav>
  </header>
</template>

<style scoped>
.sidebar {
  background: linear-gradient(180deg, #1e1b4b 0%, #312e81 100%);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.sidebar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 28px;
  height: 28px;
  color: rgba(255, 255, 255, 0.9);
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.sidebar-nav {
  display: flex;
  flex-direction: row;
  gap: 12px;
}

.nav-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  gap: 8px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.nav-icon {
  width: 20px;
  height: 20px;
  color: rgba(255, 255, 255, 0.8);
  transition: color 0.3s;
}

.nav-item.active .nav-icon {
  color: white;
}

.nav-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  transition: color 0.3s;
}

.nav-item.active .nav-label {
  color: white;
}
</style>
