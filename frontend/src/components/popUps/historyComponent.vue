<template>
  <div class="modal-backdrop" @click.self="$emit('close-click')">
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="history-title">
      <div class="modal-header">
        <div class="modal-title-wrap">
          <h2 id="history-title">Changes history - Question: {{ displayFieldNo }}</h2>
          <span v-if="headVersion" class="lock-pill">Locked to V{{ headVersion }}</span>
        </div>
        <button type="button" class="modal-close" aria-label="Close" @click="$emit('close-click')">
          <font-awesome-icon icon="xmark" />
        </button>
      </div>

      <div v-if="loading" class="empty-state">
        <p>Loading history…</p>
      </div>

      <div v-else-if="!tabs.length" class="empty-state">
        <p>No records found.</p>
      </div>

      <template v-else>
        <div class="selector-grid" :class="{ single: !showTableSelectors }">
          <template v-if="showTableSelectors">
            <label class="selector">
              <span class="selector-label">Row</span>
              <select ref="rowSelect" v-model="selectedRow" class="selector-control" :title="selectedRowTitle">
                <option v-for="row in rowOptions" :key="row.value" :value="row.value" :title="row.title">
                  {{ row.label }}
                </option>
              </select>
            </label>
            <label class="selector">
              <span class="selector-label">Column</span>
              <select ref="columnSelect" v-model="selectedColumn" class="selector-control" :title="selectedColumnLabel">
                <option v-for="col in columnOptions" :key="col.value" :value="col.value" :title="col.title">
                  {{ col.label }}
                </option>
              </select>
            </label>
          </template>
          <label v-else class="selector">
            <span class="selector-label">Question</span>
            <select ref="questionSelect" v-model="activeKey" class="selector-control" :title="activeQuestionTitle">
              <option v-for="tab in questionOptions" :key="tab.key" :value="tab.key" :title="questionTitle(tab)">
                {{ questionLabel(tab) }}
              </option>
            </select>
          </label>
        </div>

        <div class="modal-body" @click="openFilesIndex = ''">
          <div class="history-summary">
            <div class="path">
              {{ activeTabLabel }} · Question {{ displayFieldNo }}
            </div>
            <div class="label">{{ activeLabel }}</div>
            <div class="value">{{ currentValue || '—' }}</div>
            <div class="meta">
              <span>{{ editCountLabel }}</span>
              <span v-if="currentEntry?.created_by">· Last edited by {{ currentEntry.created_by }}</span>
              <span v-if="currentEntry?.created_at">· {{ formatDate(currentEntry.created_at) }}</span>
            </div>
          </div>

          <div class="timeline-heading">Full History</div>
          <div class="version-stack">
            <section
              v-for="group in versionGroups"
              :key="group.version"
              class="version-box"
              :class="{ head: group.isHead, locked: !group.isHead }"
            >
              <button type="button" class="version-box-header" @click="toggleVersion(group.version)">
                <span class="chevron" :class="{ collapsed: collapsedVersions[group.version] }">▾</span>
                <span class="version-box-title">VERSION {{ group.version }}</span>
                <span v-if="!group.isHead" class="lock-note">Locked</span>
              </button>
              <div v-show="!collapsedVersions[group.version]" class="version-box-body">
                <div
                  v-for="(item, index) in group.entries"
                  :key="`${group.version}-${index}`"
                  class="timeline-item"
                  :class="{ current: group.isHead && item.is_current_value }"
                >
                  <div class="entry-line">
                    <span class="entry-key">Value</span>
                    <span class="entry-val">{{ item.value || '—' }}</span>
                    <span v-if="isEdited(item)" class="edited-mark">(Edited)</span>
                    <span v-if="group.isHead && item.is_current_value" class="current-badge">Current Value</span>
                  </div>
                  <div class="entry-line">
                    <span class="entry-key">Created At</span>
                    <span class="entry-val">{{ formatDate(item.created_at) }}</span>
                  </div>
                  <div class="timeline-meta">
                    <span class="byline">By: {{ isEdited(item) ? (item.created_by || '—') : 'file upload' }}</span>
                    <span v-if="!isEdited(item) && item.updated_by" class="reverted-by">Reverted by {{ item.updated_by }}</span>
                    <span v-if="fileNames(item).length" class="files-anchor">
                      <button
                        type="button"
                        class="files-btn"
                        @click.stop="toggleFiles(`${group.version}-${index}`, $event)"
                      >
                        Files
                      </button>
                      <div
                        v-if="openFilesIndex === `${group.version}-${index}`"
                        class="files-popover"
                        :class="{ up: filesOpenUp }"
                        @click.stop
                      >
                        <p class="files-popover-title">Source files</p>
                        <ul>
                          <li v-for="name in fileNames(item)" :key="name" :title="name">{{ name }}</li>
                        </ul>
                      </div>
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
          <p v-if="versionsBeforeBase" class="missing-versions">{{ versionsBeforeBase }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

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
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close-click'])

const openFilesIndex = ref('')
const filesOpenUp = ref(false)
const activeKey = ref('')
const selectedRow = ref('')
const selectedColumn = ref('')
const collapsedVersions = ref({})
const questionSelect = ref(null)
const rowSelect = ref(null)
const columnSelect = ref(null)
const questionWidth = ref(0)
const rowWidth = ref(0)
const columnWidth = ref(0)
let selectObserver = null

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

const rowOptions = computed(() => {
  const seen = new Map()
  for (const cell of cells.value) {
    if (seen.has(cell.rowRaw)) continue
    const detail = cleanLineText(cell.lineText)
    const letterOnly = /^[A-Z]$/.test(cell.rowLabel)
    const full = letterOnly && detail ? `${cell.rowLabel}  ${detail}` : cell.rowLabel
    seen.set(cell.rowRaw, {
      value: cell.rowRaw,
      label: letterOnly && detail
        ? fitPrefix(cell.rowLabel, detail, rowWidth.value, fontOf(rowSelect.value))
        : fitToWidth(cell.rowLabel, rowWidth.value, fontOf(rowSelect.value)),
      title: full,
    })
  }
  return [...seen.values()]
})

const columnOptions = computed(() => {
  const forRow = cells.value.filter((cell) => cell.rowRaw === selectedRow.value)
  const font = fontOf(columnSelect.value)
  return uniqueOptions(forRow, 'colRaw', 'colLabel').map((option) => ({
    ...option,
    title: option.label,
    label: fitToWidth(option.label, columnWidth.value, font),
  }))
})

const questionOptions = computed(() => tabs.value)

const effectiveKey = computed(() => {
  if (!showTableSelectors.value) return activeKey.value
  const match = cells.value.find(
    (cell) => cell.rowRaw === selectedRow.value && cell.colRaw === selectedColumn.value
  )
  return match?.key || ''
})

const selectedRowTitle = computed(
  () => rowOptions.value.find((row) => row.value === selectedRow.value)?.title || ''
)

const selectedColumnLabel = computed(
  () => columnOptions.value.find((col) => col.value === selectedColumn.value)?.title || ''
)

const displayFieldNo = computed(() => {
  const parts = String(props.fieldNo || '').split('_')
  return parts[parts.length - 1] || props.fieldNo
})

const activeQuestionTitle = computed(() => {
  const tab = tabs.value.find((item) => item.key === effectiveKey.value)
  return tab ? questionTitle(tab) : ''
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
  return [...raw]
})

const headVersion = computed(() => {
  const groups = props.fieldData && typeof props.fieldData === 'object' ? Object.values(props.fieldData) : []
  for (const entries of groups) {
    if (!Array.isArray(entries)) continue
    const marked = entries.find((entry) => Number(entry?.filing_current_version) > 0)
    if (marked) return Number(marked.filing_current_version)
  }
  return null
})

const baseVersion = computed(() => {
  const groups = props.fieldData && typeof props.fieldData === 'object' ? Object.values(props.fieldData) : []
  let earliest = null
  for (const entries of groups) {
    if (!Array.isArray(entries)) continue
    for (const entry of entries) {
      const version = Number(entry?.version) || 1
      if (earliest == null || version < earliest) earliest = version
    }
  }
  return earliest
})

const versionsBeforeBase = computed(() => {
  const base = baseVersion.value
  if (!base || base <= 1) return ''
  if (base === 2) return 'Version 1 is not available'
  return `Versions 1 to ${base - 1} are not available`
})

const versionGroups = computed(() => {
  const groups = new Map()
  for (const item of activeEntries.value) {
    const version = Number(item.version) || 1
    if (!groups.has(version)) groups.set(version, [])
    groups.get(version).push(item)
  }
  const versions = [...groups.keys()].sort((a, b) => b - a)
  const head = headVersion.value || versions[0] || 1
  return versions.map((version) => {
    const entries = [...groups.get(version)].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )
    const files = [...new Set(entries.filter((entry) => !isEdited(entry)).flatMap((entry) => fileNames(entry)))]
    return {
      version,
      isHead: version === head,
      entries,
      files,
      preservedOnly: entries.length > 0 && entries.every((entry) => isEdited(entry)),
    }
  })
})

const currentEntry = computed(() => {
  const head = versionGroups.value.find((group) => group.isHead)
  const headCurrent = head?.entries.find((entry) => entry.is_current_value)
  return headCurrent || activeEntries.value[0]
})

const currentValue = computed(() => currentEntry.value?.value ?? '')

const editCountLabel = computed(() => {
  const n = activeEntries.value.length
  if (!n) return '0 Edits'
  return `${ordinal(n)} Edit`
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

watch(effectiveKey, () => {
  openFilesIndex.value = ''
})

watch(
  columnOptions,
  (cols) => {
    if (!cols.some((col) => col.value === selectedColumn.value)) {
      selectedColumn.value = cols[0]?.value || ''
    }
  },
  { immediate: true }
)

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

function isEdited(item) {
  return Boolean(item?.is_edit || item?.manually_edited)
}

function toggleVersion(version) {
  collapsedVersions.value = {
    ...collapsedVersions.value,
    [version]: !collapsedVersions.value[version],
  }
}

function fileNames(item) {
  const raw = item?.source_files ?? item?.sourceFiles
  if (!Array.isArray(raw)) return []
  return raw.map((name) => String(name || '').trim()).filter(Boolean)
}

function toggleFiles(index, event) {
  if (openFilesIndex.value === index) {
    openFilesIndex.value = ''
    return
  }
  const button = event?.currentTarget
  const card = button?.closest?.('.modal-card')
  if (button && card) {
    const buttonRect = button.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    const spaceBelow = cardRect.bottom - buttonRect.bottom
    const spaceAbove = buttonRect.top - cardRect.top
    filesOpenUp.value = spaceBelow < 180 && spaceAbove > spaceBelow
  } else {
    filesOpenUp.value = true
  }
  openFilesIndex.value = index
}

function cleanLineText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim()
}

function questionTitle(tab) {
  const detail = cleanLineText(tab?.lineText)
  return detail ? `${tab.label}  ${detail}` : tab?.label || ''
}

function questionLabel(tab) {
  return fitPrefix(tab?.label || '', tab?.lineText, questionWidth.value, fontOf(questionSelect.value))
}

function contentWidth(el) {
  if (!el) return 0
  const style = window.getComputedStyle(el)
  const padLeft = Number.parseFloat(style.paddingLeft) || 0
  const padRight = Number.parseFloat(style.paddingRight) || 0
  return Math.max(0, el.clientWidth - padLeft - padRight)
}

function fontOf(el) {
  if (!el) return '600 14.4px sans-serif'
  const style = window.getComputedStyle(el)
  return `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
}

let measureCanvas
function textWidth(text, font) {
  if (!measureCanvas) measureCanvas = document.createElement('canvas')
  const context = measureCanvas.getContext('2d')
  if (!context) return String(text).length * 8
  context.font = font
  return context.measureText(String(text)).width
}

function fitToWidth(text, width, font) {
  const clean = cleanLineText(text)
  if (!clean || !width) return clean
  if (textWidth(clean, font) <= width) return clean
  const ellipsis = '…'
  let lo = 0
  let hi = clean.length
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    const sample = `${clean.slice(0, mid).trimEnd()}${ellipsis}`
    if (textWidth(sample, font) <= width) lo = mid
    else hi = mid - 1
  }
  const clipped = clean.slice(0, lo).trimEnd()
  return clipped ? `${clipped}${ellipsis}` : ellipsis
}

function fitPrefix(code, detail, width, font) {
  const lead = cleanLineText(code)
  const rest = cleanLineText(detail)
  if (!rest) return fitToWidth(lead, width, font)
  const full = `${lead}  ${rest}`
  if (!width || textWidth(full, font) <= width) return full
  const gap = '  '
  const leadWidth = textWidth(lead + gap, font)
  const fitted = fitToWidth(rest, Math.max(0, width - leadWidth), font)
  if (!fitted || fitted === '…') return fitToWidth(lead, width, font)
  return `${lead}${gap}${fitted}`
}

function measureSelects() {
  questionWidth.value = contentWidth(questionSelect.value)
  rowWidth.value = contentWidth(rowSelect.value)
  columnWidth.value = contentWidth(columnSelect.value)
}

function watchSelectSizes() {
  selectObserver?.disconnect()
  selectObserver = null
  if (typeof ResizeObserver !== 'undefined') {
    selectObserver = new ResizeObserver(measureSelects)
    for (const el of [questionSelect.value, rowSelect.value, columnSelect.value]) {
      if (el) selectObserver.observe(el)
    }
  }
  measureSelects()
}

onMounted(() => {
  nextTick(watchSelectSizes)
  window.addEventListener('resize', measureSelects)
})
onBeforeUnmount(() => {
  selectObserver?.disconnect()
  window.removeEventListener('resize', measureSelects)
})
watch(() => props.loading, (isLoading) => {
  if (!isLoading) nextTick(watchSelectSizes)
})
watch(showTableSelectors, () => nextTick(watchSelectSizes))

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

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex-wrap: wrap;
}

.lock-pill {
  border: 1px solid #d1d5db;
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 0.75rem;
  color: #374151;
  background: #fff;
  white-space: nowrap;
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
  overflow: hidden;
  white-space: nowrap;
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
  font-weight: 700;
  color: #374151;
  margin: 16px 0 10px;
}

.version-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.missing-versions {
  margin: 12px 4px 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e3a8a;
}

.version-box {
  border: 1px solid #d6d3d1;
  border-radius: 10px;
  padding: 12px;
  background: #fff;
}

.version-box.head {
  border: 1.5px solid #1e3a8a;
  background: #fff;
}

.version-box.locked {
  background: #fff;
}

.version-box-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  padding: 2px 4px 10px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  font-size: 0.80rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: #0f172a;
}

.lock-note {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #1e3a8a;
  background: #eff6ff;
  border-radius: 999px;
  padding: 3px 8px;
}

.chevron {
  display: inline-block;
  transition: transform 0.15s ease;
}

.chevron.collapsed {
  transform: rotate(-90deg);
}

.version-box-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.timeline-item {
  position: relative;
  border: 1px solid #e7e5e4;
  border-radius: 10px;
  padding: 14px 16px;
  background: #fff;
  color: #0f172a;
}

.timeline-item.current {
  background: #f8fafc;
  border-color: #bfdbfe;
  box-shadow: inset 4px 0 0 #1e3a8a;
}

.entry-line {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}

.entry-key{
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.35;
}

.entry-val {
  font-size: 0.9rem;
  font-weight: 500;
  color: #0f172a;
  line-height: 1.35;
}

.entry-val {
  word-break: break-word;
}

.edited-mark {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1e3a8a;
}

.byline{
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.35;
}

.current-badge {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 700;
  color: #166534;
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
  margin-top: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #1e293b;
  flex-wrap: wrap;
}

.reverted-by {
  font-size: 0.8rem;
  font-weight: 700;
  color: #1e3a8a;
}

.files-anchor {
  position: relative;
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.files-btn {
  border: 1px solid #1e3a8a;
  background: #fff;
  color: #1e3a8a;
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
}

.files-btn:hover {
  background: #f8fafc;
  border-color: #93c5fd;
  color: #1d4ed8;
}

.files-popover {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  z-index: 5;
  width: min(280px, 70vw);
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
  padding: 10px 12px;
}

.files-popover.up {
  top: auto;
  bottom: calc(100% + 6px);
}

.files-popover-title {
  margin: 0 0 6px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.files-popover ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.files-popover li {
  font-size: 0.8rem;
  color: #111827;
  padding: 4px 0;
  word-break: break-word;
}

.files-popover li + li {
  border-top: 1px solid #f3f4f6;
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
