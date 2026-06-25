<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import NoteList from '@/views/Notes/NoteList.vue'
import KnowledgeBase from '@/views/Knowledge/KnowledgeBase.vue'
import ChatView from '@/views/Chat/ChatView.vue'

const currentTab = ref('chat')

const changeTab = (tabId) => {
  currentTab.value = tabId
}
</script>

<template>
  <div class="app-container">
    <Sidebar :active-tab="currentTab" @change-tab="changeTab" />

    <main class="app-main">
      <ChatView v-if="currentTab === 'chat'" />
      <NoteList v-else-if="currentTab === 'notes'" />
      <KnowledgeBase v-else-if="currentTab === 'knowledge'" />
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
