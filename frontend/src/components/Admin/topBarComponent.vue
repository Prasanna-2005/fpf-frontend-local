<template>
  <div class="admin-toolbar">
    <div class="toolbar-left">
      <h2>Users</h2>
      <p class="hint">Filter and manage organization users</p>
    </div>

    <div class="toolbar-actions">
      <label class="visually-hidden" for="admin-year">Filter by year</label>
      <select id="admin-year" class="select" v-model="selectedYear" @change="selectYear(selectedYear)">
        <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
      </select>

      <button type="button" class="btn-primary" @click="emitAddUser">
        <font-awesome-icon icon="user-plus" />
        Add New User
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['add-user', 'update:year'])

const years = ['2026', '2025']
const selectedYear = ref(years[0])

function selectYear(year) {
  selectedYear.value = year
  emit('update:year', year)
}

function emitAddUser() {
  emit('add-user')
}
</script>

<style scoped>
.admin-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.toolbar-left h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #111827;
}

.hint {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.select {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 0.875rem;
  font-family: inherit;
  background: #fff;
  color: #1f2937;
  min-width: 120px;
}

.select:focus {
  outline: none;
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #1e3a8a;
  border: 1px solid #1e3a8a;
  color: #fff;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}

.btn-primary:hover {
  background: #1e40af;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
