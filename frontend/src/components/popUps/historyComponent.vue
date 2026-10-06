<template>
  <div class="modal-backdrop" @click.self="$emit('close-click')">
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="history-title">
      <div class="modal-header">
        <h2 id="history-title">Change History</h2>
        <button type="button" class="modal-close" aria-label="Close" @click="$emit('close-click')">
          <font-awesome-icon icon="xmark" />
        </button>
      </div>

      <div v-if="!tabs.length" class="empty-state">
        <p>No records found.</p>
      </div>

      <template v-else>
        <div class="history-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="history-tab"
            :class="{ active: tab.key === activeKey }"
            @click="activeKey = tab.key"
          >
            {{ tab.label }}
            <span class="count">{{ tab.count }}</span>
          </button>
        </div>

        <div class="modal-body">
          <div class="history-summary">
            <div class="path">
              {{ activeTabLabel }} · Question {{ displayFieldNo }}
            </div>
            <div class="label">{{ activeLabel }}</div>
            <div class="value">{{ currentValue || '—' }}</div>
            <div class="meta">
              <span>{{ editCountLabel }}</span>
              <span v-if="currentEntry?.created_by">· Last edits by {{ currentEntry.created_by }}</span>
              <span v-if="currentEntry?.created_at">· {{ formatDate(currentEntry.created_at) }}</span>
            </div>
          </div>

          <div class="timeline-heading">Full History</div>
          <div class="timeline">
            <div
              v-for="(item, index) in activeEntries"
              :key="index"
              class="timeline-item"
              :class="{ current: item.is_current_value }"
            >
              <div class="timeline-top">
                <span class="value-label">Value:</span>
                <span v-if="item.is_current_value" class="current-badge">Current Value</span>
              </div>
              <div class="timeline-value">{{ item.value || '—' }}</div>
              <div class="timeline-meta">
                <span v-if="item.created_by" class="avatar">{{ initials(item.created_by) }}</span>
                <span>{{ item.created_by || '—' }}</span>
                <span>· {{ formatDate(item.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getInitials } from '@/assets/utils/filingDashboardUtils'

const props = defineProps({
  fieldNo: {
    type: String,
    required: true,
  },
  fieldData: {
    type: Object,
    required: true,
  },
  fieldType: {
    type: [String, Object],
    default: '',
  },
})

defineEmits(['close-click'])

const activeKey = ref('')

const tabs = computed(() => {
  if (!props.fieldData || typeof props.fieldData !== 'object') return []
  return Object.keys(props.fieldData).map((key) => {
    const entries = Array.isArray(props.fieldData[key]) ? props.fieldData[key] : []
    return {
      key,
      label: tabLabel(key),
      count: entries.length,
      lineText: entries[0]?.line_text || '',
    }
  })
})

const displayFieldNo = computed(() => {
  const parts = String(props.fieldNo || '').split('_')
  return parts[parts.length - 1] || props.fieldNo
})

const activeTabLabel = computed(() => {
  const tab = tabs.value.find((t) => t.key === activeKey.value)
  return tab?.label || `Q${displayFieldNo.value}`
})

const activeLabel = computed(() => {
  const tab = tabs.value.find((t) => t.key === activeKey.value)
  const text = tab?.lineText || ''
  return text ? toTitleCase(text) : activeTabLabel.value
})

const activeEntries = computed(() => {
  const raw = props.fieldData?.[activeKey.value]
  if (!Array.isArray(raw)) return []
  return [...raw].sort((a, b) => Number(b.is_current_value) - Number(a.is_current_value))
})

const currentEntry = computed(() => activeEntries.value.find((e) => e.is_current_value) || activeEntries.value[0])

const currentValue = computed(() => currentEntry.value?.value ?? '')

const editCountLabel = computed(() => {
  const n = activeEntries.value.length
  if (!n) return '0 Edits'
  return `${ordinal(n)} Edits`
})

watch(
  tabs,
  (list) => {
    if (!list.length) {
      activeKey.value = ''
      return
    }
    if (!list.some((t) => t.key === activeKey.value)) {
      activeKey.value = list[0].key
    }
  },
  { immediate: true }
)

function tabLabel(key) {
  const display = getDisplayFieldNo(key)
  const q = displayFieldNo.value
  if (/^[a-z]$/i.test(display) || /^\([a-z]\)$/i.test(display)) {
    const letter = display.replaceAll(/[()]/g, '')
    return `Q${q}(${letter})`
  }
  if (display === q || display === `${q})`) return `Q${q}`
  return `Q${q} · ${display}`
}

function getDisplayFieldNo(fieldNo) {
  if (props.fieldType == 'table') {
    const parts = fieldNo.split('_')
    if (parts[1]?.startsWith('(')) {
      const letterPart = parts[1].replace('(', '')
      const remaining = parts.slice(2).join(' ')
      return `${letterPart} ${remaining.replaceAll('_', ' ')}`
    }
    if (parts.length === 3) {
      const label = parts[1]
      const type = parts[2]
      const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1)
      return `${type} ${capitalizedLabel}`
    }
  }
  const parts = String(fieldNo).split('_')
  if (parts.length == 3) {
    return parts[1] + ': ' + parts[2] + ')'
  }
  return parts[parts.length - 1]
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function toTitleCase(str) {
  return String(str)
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function initials(name) {
  return getInitials(name)
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 24px;
}

.modal-card {
  background: #fff;
  width: min(860px, 100%);
  max-height: calc(100vh - 48px);
  overflow: auto;
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 22px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: #f3f4f6;
}

.empty-state {
  padding: 40px 22px;
  text-align: center;
  color: #6b7280;
}

.history-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 16px 22px 0;
}

.history-tab {
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  color: #6b7280;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.history-tab.active {
  border-color: #93c5fd;
  color: #2563eb;
  background: #eff6ff;
}

.history-tab .count {
  background: #2563eb;
  color: #fff;
  border-radius: 999px;
  min-width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

.modal-body {
  padding: 8px 22px 22px;
}

.history-summary {
  margin: 16px 0 8px;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.history-summary .path {
  font-size: 0.8rem;
  color: #2563eb;
  margin-bottom: 6px;
  font-weight: 500;
}

.history-summary .label {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: #111827;
}

.history-summary .value {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #111827;
}

.history-summary .meta {
  font-size: 0.75rem;
  color: #6b7280;
}

.timeline-heading {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  margin: 16px 0 10px;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.timeline-item {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px 16px;
  background: #fff;
}

.timeline-item.current {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.timeline-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.value-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.current-badge {
  font-size: 0.7rem;
  font-weight: 600;
  color: #16a34a;
  background: #dcfce7;
  padding: 3px 8px;
  border-radius: 999px;
}

.timeline-value {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #111827;
  word-break: break-word;
}

.timeline-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: #6b7280;
  flex-wrap: wrap;
}

.avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #dbeafe;
  color: #1e40af;
  font-size: 0.65rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
