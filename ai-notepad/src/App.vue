<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import HomeView from '@/views/HomeView.vue'
import NoteList from '@/views/Notes/NoteList.vue'

const currentTab = ref('home')

const changeTab = (tabId) => {
  currentTab.value = tabId
}
</script>

<template>
  <div class="app-container">
    <Sidebar :active-tab="currentTab" @change-tab="changeTab" />

    <main class="app-main">
      <HomeView v-if="currentTab === 'home'" />
      <NoteList v-else-if="currentTab === 'notes'" />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
</style>
