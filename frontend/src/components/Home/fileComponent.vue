<template>
  <div class="file-card">
    <!-- File Icon + Name -->
    <div class="d-flex align-items-center gap-3">
      <font-awesome-icon :icon="fileIcon" :class="['file-icon', fileClass]" />
      <p class="filename mb-0" :title="filename">{{ filename }}</p>
    </div>

    <!-- Remove Button -->
    <button class="remove-btn" @click="remove_file(filename)">
      <font-awesome-icon icon="xmark" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  filename: String,
})
const emit = defineEmits(['remove-file'])

function remove_file(filename) {
  emit('remove-file', filename)
}

const fileIcon = computed(() => {
  const name = props.filename?.toLowerCase() || ''
  if (name.endsWith('.pdf')) return 'file-pdf'
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) return 'file-excel'
  if (name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z')) return 'file-archive'
  return 'file'
})

const fileClass = computed(() => {
  const name = props.filename?.toLowerCase() || ''
  if (name.endsWith('.pdf')) return 'pdf-icon'
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) return 'excel-icon'
  if (name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z')) return 'zip-icon'
  return 'default-icon'
})
</script>

<style scoped>
.file-card {
  width: 100%;
  height: 80px;
  padding: 10px 15px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.file-icon {
  font-size: 2rem;
}

/* Colors per type */
.pdf-icon {
  color: #e74c3c;
}
.excel-icon {
  color: #2ecc71;
}
.word-icon {
  color: #3498db;
}
.zip-icon {
  color: #f39c12;
}
.default-icon {
  color: #4a90e2;
}

.filename {
  max-width: 180px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 1rem;
  font-weight: 500;
  color: #222;
}

.remove-btn {
  border: none;
  background: transparent;
  color: #999;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
}

.remove-btn:hover {
  color: #e74c3c;
}
</style>
