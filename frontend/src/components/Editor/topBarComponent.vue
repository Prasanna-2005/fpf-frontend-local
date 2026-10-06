<template>
  <header class="edit-topbar">
    <div class="topbar-left">
      <button type="button" class="back-btn" aria-label="Back to dashboard" @click="goHome">
        <font-awesome-icon icon="arrow-left" />
      </button>
      <h1 class="topbar-title">Editing: {{ filingName }}</h1>
      <span class="status-badge" :class="statusTone">{{ statusDisplay }}</span>
    </div>

    <div class="topbar-right">
      <button type="button" class="btn-outline" @click="emit('pdf-preview')">
        <font-awesome-icon icon="eye" />
        PDF Preview
      </button>
      <button
        type="button"
        class="btn-outline"
        :disabled="downloading"
        @click="emit('input-files')"
      >
        <span
          v-if="downloading"
          class="ui-spinner"
          role="status"
          aria-hidden="true"
        ></span>
        <template v-else>
          <font-awesome-icon icon="download" />
          Input Files
        </template>
      </button>

      <div class="fund-select-wrap" ref="fundWrap">
        <button
          type="button"
          class="fund-select-btn"
          :aria-expanded="dropdownOpen"
          @click="dropdownOpen = !dropdownOpen"
        >
          <span class="fund-label">{{ selectedFund || 'Select fund' }}</span>
          <font-awesome-icon icon="angle-down" />
        </button>
        <div v-if="dropdownOpen" class="fund-dropdown">
          <button
            v-for="(item, index) in fundList"
            :key="index"
            type="button"
            class="fund-option"
            :class="{ active: item === selectedFund }"
            @click="selectFund(item)"
          >
            <span class="name">{{ item }}</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useFileStore } from '@/stores/fileStore'
import { statusClass, statusLabel } from '@/assets/utils/filingDashboardUtils'

const props = defineProps({
  fundNames: {
    type: Array,
    required: true,
  },
  status: {
    type: String,
    default: 'Draft',
  },
  downloading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['selected-fund', 'pdf-preview', 'input-files'])

const fileStore = useFileStore()
const filingName = fileStore.getfilingName()
const selectedFund = ref('')
const dropdownOpen = ref(false)
const fundWrap = ref(null)

const fundList = computed(() => (Array.isArray(props.fundNames) ? props.fundNames : []))

const statusTone = computed(() => statusClass(props.status))
const statusDisplay = computed(() => {
  const label = statusLabel(props.status)
  if (statusClass(props.status) === 'review') return 'In Review'
  return label
})

function selectFund(item) {
  selectedFund.value = item
  dropdownOpen.value = false
  emit('selected-fund', selectedFund.value)
}

function goHome() {
  window.location = '/home'
}

function onDocClick(e) {
  if (fundWrap.value && !fundWrap.value.contains(e.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  if (fundList.value.length > 0) {
    selectedFund.value = fundList.value[0]
    emit('selected-fund', selectedFund.value)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
})

watch(
  fundList,
  (list) => {
    if (!list.length) return
    if (!selectedFund.value || !list.includes(selectedFund.value)) {
      selectedFund.value = list[0]
      emit('selected-fund', selectedFund.value)
    }
  },
  { deep: true }
)
</script>

<style scoped>
.edit-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 28px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  flex-wrap: wrap;
  width: 100%;
}

.topbar-left,
.topbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  min-width: 0;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #1f2937;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  padding: 0;
}

.back-btn:hover {
  background: #f3f4f6;
}

.topbar-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  white-space: nowrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-badge.review {
  background: #ffedd5;
  color: #ea580c;
}

.status-badge.approved {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.draft {
  background: #f1f5f9;
  color: #64748b;
}

.status-badge.archived {
  background: #fee2e2;
  color: #dc2626;
}

.btn-outline {
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #374151;
  border-radius: 8px;
  padding: 9px 14px;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
}

.btn-outline:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ui-spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(30, 58, 138, 0.2);
  border-top-color: #1e3a8a;
  animation: ui-spin 0.7s linear infinite;
  display: inline-block;
  flex-shrink: 0;
}

@keyframes ui-spin {
  to {
    transform: rotate(360deg);
  }
}

.fund-select-wrap {
  position: relative;
}

.fund-select-btn {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 9px 14px;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  max-width: 360px;
  color: #1f2937;
}

.fund-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fund-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: min(380px, 90vw);
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  z-index: 40;
  padding: 8px;
  max-height: 320px;
  overflow: auto;
}

.fund-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  text-align: left;
  background: none;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 12px 14px;
  font-family: inherit;
  cursor: pointer;
  color: #1f2937;
}

.fund-option:hover {
  background: #f8fafc;
}

.fund-option.active {
  border-color: #93c5fd;
  background: #eff6ff;
}

.fund-option .name {
  font-size: 0.875rem;
  font-weight: 600;
}
</style>
