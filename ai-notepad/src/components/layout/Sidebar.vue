<script setup>
import { FileText, Calendar, Image, Brain } from 'lucide-vue-next'

const props = defineProps({
  activeTab: {
    type: String,
    default: 'notes'
  }
})

const emit = defineEmits(['change-tab'])

const tabs = [
  { id: 'notes', name: '笔记', icon: FileText },
  { id: 'images', name: '图片', icon: Image },
  { id: 'schedules', name: '日程', icon: Calendar },
  { id: 'chat', name: '问答', icon: Brain }
]

const changeTab = (tabId) => {
  emit('change-tab', tabId)
}
</script>

<template>
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="changeTab(tab.id)"
        class="nav-item"
        :class="{ active: activeTab === tab.id }"
      >
        <component :is="tab.icon" class="nav-icon" />
        <span class="nav-text">{{ tab.name }}</span>
      </button>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 200px;
  background: white;
  border-right: 1px solid #e5e7eb;
  padding: 16px 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  transition: all 0.2s;
  border-radius: 0;
}

.nav-item:hover {
  background: #f3f4f6;
  color: #374151;
}

.nav-item.active {
  background: #e0e7ff;
  color: #4f46e5;
}

.nav-icon {
  width: 18px;
  height: 18px;
}

.nav-text {
  font-weight: 500;
}
</style>