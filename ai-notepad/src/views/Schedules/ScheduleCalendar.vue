<script setup>import { ref, computed } from 'vue';
import { Plus, AlertCircle, ChevronLeft, ChevronRight, Calendar } from 'lucide-vue-next';
import { useScheduleStore } from '@/stores/schedule';
import { formatDate } from '@/utils/format';
import ScheduleForm from './ScheduleForm.vue';
const scheduleStore = useScheduleStore();
const selectedYear = ref(new Date().getFullYear());
const showForm = ref(false);
const selectedSchedule = ref(null);
const selectedMonth = ref(null);
const yearRange = Array.from({ length: 51 }, (_, i) => 2026 + i);
const prevYear = () => {
  const currentIndex = yearRange.indexOf(selectedYear.value);
  if (currentIndex > 0) {
    selectedYear.value = yearRange[currentIndex - 1];
  }
};
const nextYear = () => {
  const currentIndex = yearRange.indexOf(selectedYear.value);
  if (currentIndex < yearRange.length - 1) {
    selectedYear.value = yearRange[currentIndex + 1];
  }
};
const months = computed(() => {
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  return monthNames.map((name, index) => ({
    index,
    name,
    year: selectedYear.value,
    schedules: getMonthSchedules(index),
    calendarDays: generateCalendarDays(index)
  }));
});
const generateCalendarDays = (month) => {
  const year = selectedYear.value;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null);
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(i);
  }
  return days;
};
const getMonthSchedules = (month) => {
  return scheduleStore.schedules.filter(s => {
    const d = new Date(s.date);
    return d.getFullYear() === selectedYear.value && d.getMonth() === month;
  });
};
const hasScheduleOnDay = (month, day) => {
  if (!day)
    return false;
  const d = new Date(selectedYear.value, month, day);
  return scheduleStore.getSchedulesByDate(d).length > 0;
};
const isToday = (month, day) => {
  if (!day)
    return false;
  const d = new Date(selectedYear.value, month, day);
  const today = new Date();
  return d.toDateString() === today.toDateString();
};
const isTodayMonth = (month) => {
  const now = new Date();
  return now.getFullYear() === selectedYear.value && now.getMonth() === month;
};
const openForm = (schedule = null) => {
  selectedSchedule.value = schedule;
  showForm.value = true;
};
const closeForm = () => {
  showForm.value = false;
  selectedSchedule.value = null;
};
const handleMonthClick = (month) => {
  selectedMonth.value = month;
  const date = new Date(selectedYear.value, month, 1);
  scheduleStore.selectedDate = date;
  openForm();
};
const handleDayClick = (month, day) => {
  if (!day)
    return;
  const date = new Date(selectedYear.value, month, day);
  scheduleStore.selectedDate = date;
  openForm();
};
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
</script>

<template>
  <div class="schedule-year-view">
    <div class="year-header">
      <div class="year-selector">
        <button @click="prevYear" class="year-nav-btn" :disabled="selectedYear === yearRange[0]">
          <ChevronLeft class="icon" />
        </button>
        <div class="year-display">
          <Calendar class="calendar-icon" />
          <span class="year-text">{{ selectedYear }}年</span>
        </div>
        <button @click="nextYear" class="year-nav-btn" :disabled="selectedYear === yearRange[yearRange.length - 1]">
          <ChevronRight class="icon" />
        </button>
      </div>
      <div class="header-actions">
        <button @click="openForm()" class="add-btn">
          <Plus class="icon" />
          新建日程
        </button>
      </div>
    </div>

    <div class="months-grid">
      <div v-for="month in months" :key="month.index" class="month-card"
        :class="{ 'today': isTodayMonth(month.index), 'has-schedules': month.schedules.length > 0 }"
        @click="handleMonthClick(month.index)">
        <div class="month-header">
          <h3 class="month-name">{{ month.name }}</h3>
          <span v-if="month.schedules.length > 0" class="schedule-count">
            {{ month.schedules.length }}
          </span>
        </div>

        <div class="mini-calendar">
          <div class="weekday-row">
            <span v-for="(day, idx) in weekDays" :key="idx" class="weekday">{{ day }}</span>
          </div>
          <div class="days-grid">
            <span v-for="(day, idx) in month.calendarDays" :key="idx" class="day-cell" :class="{
              'empty': !day,
              'today': isToday(month.index, day),
              'has-schedule': hasScheduleOnDay(month.index, day)
            }" @click.stop="handleDayClick(month.index, day)">{{ day }}</span>
          </div>
        </div>

        <div v-if="month.schedules.length > 0" class="month-schedules">
          <div v-for="schedule in month.schedules.slice(0, 2)" :key="schedule.id" class="mini-schedule"
            :class="schedule.status">
            <span class="schedule-date">{{ formatDate(schedule.date).slice(5) }}</span>
            <span class="schedule-title">{{ schedule.title }}</span>
          </div>
          <div v-if="month.schedules.length > 2" class="more-schedules">
            +{{ month.schedules.length - 2 }}
          </div>
        </div>
      </div>
    </div>

    <div class="upcoming-section">
      <div class="section-header">
        <AlertCircle class="icon" />
        <h3>即将到来的日程</h3>
      </div>

      <div v-if="scheduleStore.upcomingSchedules.length === 0" class="empty-state">
        <p>暂无日程安排</p>
      </div>

      <div v-else class="schedule-list">
        <div v-for="schedule in scheduleStore.upcomingSchedules.slice(0, 5)" :key="schedule.id" class="schedule-item"
          @click="openForm(schedule)">
          <div class="schedule-time">
            <span class="date">{{ formatDate(schedule.date) }}</span>
            <span class="time">{{ schedule.time }}</span>
          </div>
          <div class="schedule-info">
            <h4>{{ schedule.title }}</h4>
            <p v-if="schedule.description">{{ schedule.description.substring(0, 50) }}...</p>
          </div>
          <div class="schedule-status" :class="schedule.status">
            {{ schedule.status === 'completed' ? '已完成' : schedule.status === 'pending' ? '待办' : '进行中' }}
          </div>
        </div>
      </div>
    </div>

    <ScheduleForm v-if="showForm" :schedule="selectedSchedule" :selected-date="scheduleStore.selectedDate"
      @saved="closeForm" @closed="closeForm" />
  </div>
</template>

<style scoped>
.schedule-year-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.year-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.year-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.year-nav-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: #f3f4f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.year-nav-btn:hover:not(:disabled) {
  background: #e0e7ff;
}

.year-nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.year-nav-btn .icon {
  width: 18px;
  height: 18px;
  color: #4f46e5;
}

.year-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
}

.calendar-icon {
  width: 20px;
  height: 20px;
  color: #4f46e5;
}

.year-text {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  min-width: 100px;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  transition: all 0.2s;
}

.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
}

.add-btn .icon {
  width: 16px;
  height: 16px;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding-right: 8px;
}

.month-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.month-card:hover {
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.15);
  transform: translateY(-4px);
}

.month-card.today {
  border: 2px solid #4f46e5;
  background: linear-gradient(135deg, #f8faff 0%, white 100%);
}

.month-card.has-schedules {
  border: 1px solid #e0e7ff;
}

.month-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.month-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.schedule-count {
  font-size: 12px;
  color: white;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.mini-calendar {
  margin-bottom: 12px;
}

.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 6px;
}

.weekday {
  text-align: center;
  font-size: 10px;
  color: #9ca3af;
  font-weight: 500;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.day-cell.empty {
  cursor: default;
  color: transparent;
}

.day-cell:not(.empty):hover {
  background: #e0e7ff;
}

.day-cell.today {
  background: #4f46e5;
  color: white;
  font-weight: 600;
}

.day-cell.has-schedule {
  background: #fef3c7;
  color: #d97706;
  font-weight: 500;
}

.day-cell.today.has-schedule {
  background: linear-gradient(135deg, #4f46e5 0%, #f59e0b 100%);
}

.month-schedules {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.mini-schedule {
  display: flex;
  gap: 6px;
  padding: 4px 8px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 12px;
  overflow: hidden;
}

.mini-schedule.pending {
  border-left: 3px solid #f59e0b;
}

.mini-schedule.in-progress {
  border-left: 3px solid #3b82f6;
}

.mini-schedule.completed {
  border-left: 3px solid #10b981;
}

.schedule-date {
  color: #9ca3af;
  white-space: nowrap;
  font-size: 11px;
}

.schedule-title {
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.more-schedules {
  font-size: 11px;
  color: #4f46e5;
  text-align: center;
  padding: 2px;
  font-weight: 500;
}

.upcoming-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  max-height: 200px;
  overflow-y: auto;
  flex-shrink: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.section-header .icon {
  width: 22px;
  height: 22px;
  color: #f59e0b;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  color: #9ca3af;
  padding: 24px;
}

.empty-state p {
  margin: 0;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  background: #f9fafb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.schedule-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.schedule-time {
  min-width: 80px;
}

.schedule-time .date {
  display: block;
  font-size: 12px;
  color: #9ca3af;
}

.schedule-time .time {
  display: block;
  font-size: 14px;
  font-weight: 600;
}

.schedule-info {
  flex: 1;
}

.schedule-info h4 {
  margin: 0;
  font-size: 14px;
}

.schedule-info p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #6b7280;
}

.schedule-status {
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.schedule-status.pending {
  background: #fef3c7;
  color: #d97706;
}

.schedule-status.completed {
  background: #dcfce7;
  color: #16a34a;
}

.schedule-status.in-progress {
  background: #dbeafe;
  color: #2563eb;
}
</style>