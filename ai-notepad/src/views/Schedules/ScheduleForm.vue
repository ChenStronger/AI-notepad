<script setup>
import { ref, watch } from 'vue'
import { X, Save } from 'lucide-vue-next'
import { useScheduleStore } from '@/stores/schedule'
import { formatDate } from '@/utils/format'

const props = defineProps({
  schedule: Object,
  selectedDate: [Date, String]
})

const emit = defineEmits(['saved', 'closed'])

const scheduleStore = useScheduleStore()
const isEdit = ref(false)
const form = ref({
  title: '',
  description: '',
  date: '',
  time: '09:00',
  status: 'pending'
})

watch(() => props.schedule, (newSchedule) => {
  if (newSchedule) {
    isEdit.value = true
    form.value = { ...newSchedule }
  } else {
    isEdit.value = false
    form.value = {
      title: '',
      description: '',
      date: formatDate(props.selectedDate || new Date()),
      time: '09:00',
      status: 'pending'
    }
  }
}, { immediate: true })

const saveSchedule = () => {
  if (!form.value.title.trim()) {
    alert('请输入日程标题')
    return
  }
  
  if (isEdit.value) {
    scheduleStore.updateSchedule(props.schedule.id, { ...form.value })
  } else {
    scheduleStore.addSchedule({ ...form.value })
  }
  
  emit('saved')
}
</script>

<template>
  <div class="schedule-form-overlay" @click.self="$emit('closed')">
    <div class="schedule-form">
      <div class="form-header">
        <h2>{{ isEdit ? '编辑日程' : '新建日程' }}</h2>
        <button @click="$emit('closed')" class="close-btn">
          <X class="icon" />
        </button>
      </div>
      
      <div class="form-body">
        <div class="form-group">
          <label>标题</label>
          <input 
            v-model="form.title" 
            type="text" 
            placeholder="输入日程标题..." 
            class="form-input"
          />
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>日期</label>
            <input v-model="form.date" type="date" class="form-input" />
          </div>
          <div class="form-group">
            <label>时间</label>
            <input v-model="form.time" type="time" class="form-input" />
          </div>
        </div>
        
        <div class="form-group">
          <label>状态</label>
          <select v-model="form.status" class="form-select">
            <option value="pending">待办</option>
            <option value="in-progress">进行中</option>
            <option value="completed">已完成</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>备注</label>
          <textarea 
            v-model="form.description" 
            placeholder="输入备注信息..." 
            class="form-textarea"
            rows="3"
          ></textarea>
        </div>
      </div>
      
      <div class="form-footer">
        <button @click="$emit('closed')" class="btn btn-secondary">取消</button>
        <button @click="saveSchedule" class="btn btn-primary">
          <Save class="icon" />
          {{ isEdit ? '保存修改' : '创建日程' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.schedule-form {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.form-header h2 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #e5e7eb;
}

.close-btn .icon {
  width: 18px;
  height: 18px;
  color: #6b7280;
}

.form-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid #eee;
  background: #f8f9fa;
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}

.btn-primary:hover {
  background: #4338ca;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn .icon {
  width: 16px;
  height: 16px;
}
</style>