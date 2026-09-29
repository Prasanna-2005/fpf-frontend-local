<template>
  <div class="modal-backdrop" @click.self="$emit('close-click')">
    <div
      class="modal-card"
      :class="{ dragging }"
      :style="{ transform: `translate(${offset.x}px, ${offset.y}px)` }"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-title"
    >
      <div class="modal-header drag-handle" @pointerdown="onPointerDown">
        <h2 id="history-title">Change History</h2>
        <button
          type="button"
          class="modal-close"
          aria-label="Close"
          @click="$emit('close-click')"
          @pointerdown.stop
        >
          <font-awesome-icon icon="xmark" />
        </button>
      </div>

      <div v-if="!tabs.length" class="empty-state">
        <p>No records found.</p>
      </div>

      <template v-else>
        <div class="selector-grid" :class="{ single: !showTableSelectors }">
          <template v-if="showTableSelectors">
            <label class="selector">
              <span class="selector-label">Row</span>
              <select v-model="selectedRow" class="selector-control" :title="selectedRowLabel">
                <option v-for="row in rowOptions" :key="row.value" :value="row.value">
                  {{ row.label }}
                </option>
              </select>
            </label>
            <label class="selector">
              <span class="selector-label">Column</span>
              <select v-model="selectedColumn" class="selector-control" :title="selectedColumnLabel">
                <option v-for="col in columnOptions" :key="col.value" :value="col.value">
                  {{ col.label }}
                </option>
              </select>
            </label>
          </template>
          <label v-else class="selector">
            <span class="selector-label">Question</span>
            <select v-model="activeKey" class="selector-control">
              <option v-for="tab in questionOptions" :key="tab.key" :value="tab.key">
                {{ tab.label }}
              </option>
            </select>
          </label>
        </div>

        <div class="modal-body">
          <div class="history-summary">
            <div class="path">
              {{ activeTabLabel }} · Question {{ displayFieldNo }}
            </div>
            <div class="label">{{ activeLabel }}</div>
            <div
              class="value value-preview"
              :title="currentValue || '—'"
            >
              {{ currentValue || '—' }}
            </div>
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
              <div
                class="timeline-value value-preview"
                :title="item.value || '—'"
              >
                {{ item.value || '—' }}
              </div>
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
import { ref, computed, watch, onBeforeUnmount } from 'vue'
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
  hasTableData: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close-click'])

const activeKey = ref('')
const selectedRow = ref('')
const selectedColumn = ref('')
const dragging = ref(false)
const offset = ref({ x: 0, y: 0 })
const dragStart = ref({ x: 0, y: 0, ox: 0, oy: 0 })

const tabs = computed(() => {
  if (!props.fieldData || typeof props.fieldData !== 'object') return []
  return Object.keys(props.fieldData)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map((key) => {
      const entries = Array.isArray(props.fieldData[key]) ? props.fieldData[key] : []
      return {
        key,
        label: tabLabel(key),
        lineText: entries[0]?.line_text || '',
      }
    })
})

const isTable = computed(() => {
  if (props.fieldType === 'table' || props.hasTableData) return true
  return tabs.value.some((tab) => /_\([^)]+\)_/.test(tab.key))
})

const cells = computed(() => {
  if (!isTable.value) return []
  return tabs.value
    .map((tab) => {
      const parsed = parseTableCell(tab.key)
      if (!parsed) return null
      return {
        ...tab,
        ...parsed,
        rowLabel: formatRowLabel(parsed.rowRaw),
        colLabel: formatColumnLabel(parsed.colRaw),
      }
    })
    .filter(Boolean)
})

const showTableSelectors = computed(() => isTable.value && cells.value.length > 0)

const rowOptions = computed(() => uniqueOptions(cells.value, 'rowRaw', 'rowLabel'))

const columnOptions = computed(() => {
  const forRow = cells.value.filter((cell) => cell.rowRaw === selectedRow.value)
  return uniqueOptions(forRow, 'colRaw', 'colLabel')
})

const questionOptions = computed(() => tabs.value)

const effectiveKey = computed(() => {
  if (!showTableSelectors.value) return activeKey.value
  const match = cells.value.find(
    (cell) => cell.rowRaw === selectedRow.value && cell.colRaw === selectedColumn.value
  )
  return match?.key || ''
})

const selectedRowLabel = computed(
  () => rowOptions.value.find((row) => row.value === selectedRow.value)?.label || ''
)

const selectedColumnLabel = computed(
  () => columnOptions.value.find((col) => col.value === selectedColumn.value)?.label || ''
)

const displayFieldNo = computed(() => {
  const parts = String(props.fieldNo || '').split('_')
  return parts[parts.length - 1] || props.fieldNo
})

const activeTabLabel = computed(() => {
  if (showTableSelectors.value) {
    const cell = cells.value.find((item) => item.key === effectiveKey.value)
    if (cell) return `${cell.rowLabel} · ${cell.colLabel}`
  }
  const tab = tabs.value.find((t) => t.key === effectiveKey.value)
  return tab?.label || `Q${displayFieldNo.value}`
})

const activeLabel = computed(() => {
  const tab = tabs.value.find((t) => t.key === effectiveKey.value)
  const text = tab?.lineText || ''
  return text ? toTitleCase(text) : activeTabLabel.value
})

const activeEntries = computed(() => {
  const raw = props.fieldData?.[effectiveKey.value]
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

watch(
  rowOptions,
  (rows) => {
    if (!rows.some((row) => row.value === selectedRow.value)) {
      selectedRow.value = rows[0]?.value || ''
    }
  },
  { immediate: true }
)

watch(
  columnOptions,
  (cols) => {
    if (!cols.some((col) => col.value === selectedColumn.value)) {
      selectedColumn.value = cols[0]?.value || ''
    }
  },
  { immediate: true }
)

function onPointerDown(event) {
  if (event.button !== 0) return
  dragging.value = true
  dragStart.value = {
    x: event.clientX,
    y: event.clientY,
    ox: offset.value.x,
    oy: offset.value.y,
  }
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

function onPointerMove(event) {
  if (!dragging.value) return
  offset.value = {
    x: dragStart.value.ox + (event.clientX - dragStart.value.x),
    y: dragStart.value.oy + (event.clientY - dragStart.value.y),
  }
}

function onPointerUp() {
  dragging.value = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
})

function uniqueOptions(list, valueKey, labelKey) {
  const seen = new Map()
  for (const item of list) {
    if (!seen.has(item[valueKey])) seen.set(item[valueKey], item[labelKey])
  }
  return [...seen.entries()].map(([value, label]) => ({ value, label }))
}

function parseTableCell(key) {
  const text = String(key)
  const first = text.indexOf('_')
  if (first <= 0) return null
  const second = text.indexOf('_', first + 1)
  if (second < 0) return null
  const rowRaw = text.slice(first + 1, second)
  const colRaw = text.slice(second + 1)
  if (!rowRaw || !colRaw) return null
  return { rowRaw, colRaw }
}

function formatRowLabel(raw) {
  const cleaned = String(raw).replaceAll(/[()]/g, '')
  if (/^[a-z]$/i.test(cleaned)) return cleaned.toUpperCase()
  return formatColumnLabel(cleaned)
}

function formatColumnLabel(raw) {
  const text = String(raw)
    .replaceAll('_', ' ')
    .replace(/\blevel(\d+)\b/gi, 'level $1')
    .replace(/\bcostbased\b/gi, 'cost-based')
    .replace(/\s+/g, ' ')
    .trim()
  return text
    .split(' ')
    .map((word) => {
      if (!word) return word
      if (word === word.toUpperCase() && /[A-Z]/.test(word)) return word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

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
  will-change: transform;
}

.modal-card.dragging {
  user-select: none;
  cursor: grabbing;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 22px;
  border-bottom: 1px solid #e5e7eb;
}

.drag-handle {
  cursor: grab;
  touch-action: none;
}

.modal-card.dragging .drag-handle {
  cursor: grabbing;
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

.selector-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px 22px 0;
}

.selector-grid.single {
  grid-template-columns: 1fr;
}

@media (max-width: 640px) {
  .selector-grid {
    grid-template-columns: 1fr;
  }
}

.selector {
  min-width: 0;
}

.selector-label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #6b7280;
}

.selector-control {
  width: 100%;
  appearance: none;
  background-color: #fff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%236b7280' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 36px 10px 12px;
  font-size: 0.9rem;
  font-family: inherit;
  color: #111827;
  cursor: pointer;
  text-overflow: ellipsis;
}

.selector-control:focus {
  outline: none;
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
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

.value-preview {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  word-break: break-word;
  transition: background-color 0.15s ease;
}

.value-preview:hover {
  display: block;
  -webkit-line-clamp: unset;
  line-clamp: unset;
  overflow: visible;
  white-space: pre-wrap;
  background: #f8fafc;
  border-radius: 6px;
  padding: 4px 6px;
  margin: -4px -6px 8px;
}

.history-summary .value-preview:hover {
  background: #eff6ff;
  margin-bottom: 8px;
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
