<script setup>
import { ref } from 'vue'
import Header from '@/components/layout/Header.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import NoteList from '@/views/Notes/NoteList.vue'
import ImageGallery from '@/views/Images/ImageGallery.vue'
import ScheduleCalendar from '@/views/Schedules/ScheduleCalendar.vue'
import KnowledgeChat from '@/views/Chat/KnowledgeChat.vue'

const currentTab = ref('notes')

const changeTab = (tabId) => {
  currentTab.value = tabId
}

const handleGoToSchedules = () => {
  currentTab.value = 'schedules'
}

const handleUserClick = () => {
  // 用户点击可以显示用户菜单或设置页面，这里暂时只是切换到笔记页面
  currentTab.value = 'notes'
}
</script>

<template>
  <div class="app-container">
    <Header title="AI 记事本" @go-to-schedules="handleGoToSchedules" @user-click="handleUserClick" />

    <div class="app-body">
      <Sidebar :active-tab="currentTab" @change-tab="changeTab" />

      <main class="app-main">
        <NoteList v-if="currentTab === 'notes'" />
        <ImageGallery v-else-if="currentTab === 'images'" />
        <ScheduleCalendar v-else-if="currentTab === 'schedules'" />
        <KnowledgeChat v-else-if="currentTab === 'chat'" />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.app-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>