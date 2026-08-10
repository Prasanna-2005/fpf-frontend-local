<template>
  <div
    class="modal-backdrop"
    role="presentation"
    @click.self="emit('close-click')"
  >
    <div
      class="modal-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="latest-changes-title"
      tabindex="-1"
      ref="dialogRef"
      @keydown.esc.stop="emit('close-click')"
    >
      <!-- Sticky header -->
      <header class="modal-header">
        <div class="header-copy">
          <div class="title-row">
            <h2 id="latest-changes-title" class="modal-title">Latest changes</h2>
            <span
              v-if="meta.count != null"
              class="count-badge"
              :aria-label="`${meta.count} changes`"
            >
              {{ meta.count }}
            </span>
          </div>
          <p class="header-subtitle">
            Recent updates for this filing
            <template v-if="meta.cacheRefreshed">
              · Synced {{ formatRelative(meta.cacheRefreshed) }}
            </template>
          </p>
        </div>

        <button
          type="button"
          class="close-btn"
          aria-label="Close latest changes"
          @click="emit('close-click')"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </header>

      <!-- Body -->
      <div class="modal-body">
        <div v-if="!timelineItems.length" class="empty-state">
          <div class="empty-icon" aria-hidden="true">◎</div>
          <p class="empty-title">No recent changes</p>
          <p class="empty-copy">
            When fields are updated, they’ll appear here in reverse chronological order.
          </p>
        </div>

        <ol v-else class="timeline" aria-label="Change timeline">
          <li
            v-for="(item, index) in timelineItems"
            :key="item.id"
            class="timeline-item"
          >
            <div class="timeline-rail" aria-hidden="true">
              <span
                class="timeline-dot"
                :class="{ current: item.isCurrent }"
              />
              <span
                v-if="index < timelineItems.length - 1"
                class="timeline-line"
              />
            </div>

            <article
              class="change-card"
              :class="{ 'is-current': item.isCurrent }"
            >
              <div class="card-top">
                <div class="identity">
                  <p v-if="item.fieldNo" class="question-line">
                    <span class="identity-label">Question</span>
                    <span class="identity-value">{{ item.fieldNo }}</span>
                  </p>
                  <p v-if="item.formLineNo" class="subquestion-line">
                    <span class="identity-label">Subquestion</span>
                    <span class="identity-value">{{ item.formLineNo }}</span>
                  </p>
                  <span v-if="item.isCurrent" class="chip chip-current">
                    Current
                  </span>
                </div>
                <time
                  class="time-stamp"
                  :datetime="item.createdAt || undefined"
                  :title="formatAbsolute(item.createdAt)"
                >
                  {{ formatRelative(item.createdAt) }}
                </time>
              </div>

              <p v-if="item.lineText" class="line-text">{{ item.lineText }}</p>

              <div class="value-block">
                <template v-if="item.oldValue != null || item.newValue != null">
                  <div v-if="item.oldValue != null" class="value-row">
                    <span class="value-label">Previous</span>
                    <span class="value-text muted">{{ displayValue(item.oldValue) }}</span>
                  </div>
                  <div v-if="item.newValue != null" class="value-row">
                    <span class="value-label">Updated</span>
                    <span class="value-text">{{ displayValue(item.newValue) }}</span>
                  </div>
                </template>
                <template v-else>
                  <div class="value-row">
                    <span class="value-label">Value</span>
                    <span class="value-text">{{ displayValue(item.value) }}</span>
                  </div>
                </template>
              </div>

              <footer class="card-footer">
                <div class="actor">
                  <span class="avatar" aria-hidden="true">
                    {{ getInitials(item.createdBy) }}
                  </span>
                  <span class="actor-email" :title="item.createdBy || ''">
                    {{ item.createdBy || 'Unknown user' }}
                  </span>
                </div>
                <span class="absolute-time">{{ formatAbsolute(item.createdAt) }}</span>
              </footer>
            </article>
          </li>
        </ol>
      </div>

      <!-- Footer -->
      <footer v-if="meta.cacheRefreshed || meta.filingId" class="modal-footer">
        <span v-if="meta.filingId" class="footer-meta" :title="meta.filingId">
          Filing {{ shortenId(meta.filingId) }}
        </span>
        <span v-if="meta.cacheRefreshed" class="footer-meta">
          Cache refreshed {{ formatAbsolute(meta.cacheRefreshed) }}
        </span>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'

const props = defineProps({
  /** Legacy: array of change groups or flat change items */
  list: {
    type: Array,
    default: () => []
  },
  /**
   * New latest_changes API response:
   * { filing_id, count, cache_refreshed, changes: [...] }
   */
  data: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close-click'])

const dialogRef = ref(null)

onMounted(async () => {
  await nextTick()
  dialogRef.value?.focus()
})

const meta = computed(() => {
  if (props.data && typeof props.data === 'object' && !Array.isArray(props.data)) {
    return {
      count: props.data.count ?? props.data.changes?.length ?? 0,
      cacheRefreshed: props.data.cache_refreshed ?? null,
      filingId: props.data.filing_id ?? null
    }
  }
  return {
    count: Array.isArray(props.list) ? props.list.length : 0,
    cacheRefreshed: null,
    filingId: null
  }
})

const sourceList = computed(() => {
  if (props.data && typeof props.data === 'object' && !Array.isArray(props.data)) {
    return Array.isArray(props.data.changes) ? props.data.changes : []
  }
  return Array.isArray(props.list) ? props.list : []
})

const timelineItems = computed(() => {
  const items = []

  sourceList.value.forEach((entry, index) => {
    if (isLatestChangeItem(entry) || isFlatChangeItem(entry)) {
      items.push(normalizeItem(entry, index))
      return
    }

    const nested = entry?.changes || entry?.items || entry?.data
    if (Array.isArray(nested) && nested.length) {
      nested.forEach((change, changeIndex) => {
        items.push(
          normalizeItem(
            {
              ...change,
              formLineNo:
                change.formLineNo ??
                change.fieldLineNo ??
                entry.formLineNo ??
                entry.fieldLineNo ??
                entry.form_line_no,
              fieldNo: change.fieldNo ?? entry.fieldNo ?? entry.field_no ?? entry.label,
              line_text: change.line_text ?? entry.line_text
            },
            `${index}-${changeIndex}`
          )
        )
      })
      return
    }

    items.push(normalizeItem(entry, index))
  })

  return items.sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return bTime - aTime
  })
})

function normalizeItem(item, id) {
  return {
    id: String(item?.id ?? item?.key ?? `${item?.fieldNo || item?.field_no || 'row'}-${id}`),
    formLineNo:
      item?.formLineNo ??
      item?.fieldLineNo ??
      item?.form_line_no ??
      item?.field_line_no ??
      null,
    fieldNo: item?.fieldNo ?? item?.field_no ?? item?.label ?? item?.title ?? null,
    value: hasOwn(item, 'value') ? item.value : null,
    oldValue: hasOwn(item, 'old_value') ? item.old_value : null,
    newValue: hasOwn(item, 'new_value') ? item.new_value : null,
    createdAt: item?.created_at ?? item?.createdAt ?? null,
    createdBy: item?.created_by ?? item?.createdBy ?? null,
    lineText: item?.line_text ?? item?.lineText ?? null,
    isCurrent: Boolean(item?.is_current_value)
  }
}

function isLatestChangeItem(item) {
  if (!item || typeof item !== 'object') return false
  return (
    (hasOwn(item, 'formLineNo') || hasOwn(item, 'fieldNo')) &&
    hasOwn(item, 'value')
  )
}

function isFlatChangeItem(item) {
  if (!item || typeof item !== 'object') return false
  const nested = item.changes || item.items || item.data
  return !Array.isArray(nested) && (hasOwn(item, 'value') || hasOwn(item, 'created_at'))
}

function hasOwn(obj, field) {
  return obj != null && Object.prototype.hasOwnProperty.call(obj, field)
}

function displayValue(value) {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

function getInitials(emailOrName) {
  if (!emailOrName) return '?'
  const base = String(emailOrName).split('@')[0]
  const parts = base.split(/[.\-_+\s]+/).filter(Boolean)
  if (!parts.length) return base.slice(0, 2).toUpperCase()
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function shortenId(id) {
  if (!id) return '—'
  const str = String(id)
  if (str.length <= 12) return str
  return `${str.slice(0, 6)}…${str.slice(-4)}`
}

function formatAbsolute(date) {
  if (!date) return '—'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

function formatRelative(date) {
  if (!date) return '—'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return '—'

  const diffMs = parsed.getTime() - Date.now()
  const absSec = Math.round(Math.abs(diffMs) / 1000)
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

  if (absSec < 60) return rtf.format(Math.round(diffMs / 1000), 'second')
  const absMin = Math.round(absSec / 60)
  if (absMin < 60) return rtf.format(Math.round(diffMs / 60000), 'minute')
  const absHr = Math.round(absMin / 60)
  if (absHr < 24) return rtf.format(Math.round(diffMs / 3600000), 'hour')
  const absDay = Math.round(absHr / 24)
  if (absDay < 30) return rtf.format(Math.round(diffMs / 86400000), 'day')
  return formatAbsolute(date)
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
}

.modal-card {
  display: flex;
  flex-direction: column;
  width: min(760px, 100%);
  max-height: min(84vh, 900px);
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow:
    0 20px 40px rgba(15, 23, 42, 0.16),
    0 2px 8px rgba(15, 23, 42, 0.06);
  outline: none;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 20px 14px;
  border-bottom: 1px solid #eef2f7;
  background: linear-gradient(180deg, #fbfdff 0%, #ffffff 100%);
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 650;
  letter-spacing: -0.01em;
  color: #0f172a;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.6rem;
  height: 1.6rem;
  padding: 0 0.45rem;
  border-radius: 999px;
  background: #e8eefc;
  color: #1d4ed8;
  font-size: 0.75rem;
  font-weight: 700;
}

.header-subtitle {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 0.85rem;
}

.close-btn {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.close-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.close-btn:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.modal-body {
  flex: 1;
  overflow: auto;
  padding: 16px 20px 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  text-align: center;
  padding: 24px;
}

.empty-icon {
  width: 42px;
  height: 42px;
  margin-bottom: 12px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #94a3b8;
  display: grid;
  place-items: center;
  font-size: 1.1rem;
}

.empty-title {
  margin: 0 0 6px;
  color: #0f172a;
  font-weight: 600;
}

.empty-copy {
  margin: 0;
  max-width: 320px;
  color: #64748b;
  font-size: 0.9rem;
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
}

.timeline-item {
  display: grid;
  grid-template-columns: 20px 1fr;
  gap: 12px;
}

.timeline-rail {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 18px;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #94a3b8;
  box-shadow: 0 0 0 4px #eef2f7;
  z-index: 1;
}

.timeline-dot.current {
  background: #16a34a;
  box-shadow: 0 0 0 4px #dcfce7;
}

.timeline-line {
  flex: 1;
  width: 2px;
  margin-top: 4px;
  background: #e2e8f0;
  min-height: 24px;
}

.change-card {
  margin-bottom: 12px;
  padding: 14px 14px 12px;
  border: 1px solid #e7ecf2;
  border-radius: 10px;
  background: #ffffff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.change-card:hover {
  border-color: #d5dde8;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
}

.change-card.is-current {
  border-color: #bbf7d0;
  background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 48%);
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.identity {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.question-line,
.subquestion-line {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0;
  min-width: 0;
}

.identity-label {
  flex-shrink: 0;
  min-width: 84px;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.identity-value {
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 650;
  word-break: break-word;
}

.subquestion-line .identity-value {
  color: #334155;
  font-weight: 600;
}

.chip {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 650;
  letter-spacing: 0.01em;
  line-height: 1.3;
}

.chip-current {
  background: #dcfce7;
  color: #15803d;
}

.time-stamp {
  flex-shrink: 0;
  color: #64748b;
  font-size: 0.78rem;
  white-space: nowrap;
}

.line-text {
  margin: 0 0 10px;
  color: #475569;
  font-size: 0.86rem;
}

.value-block {
  display: grid;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.value-row {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 10px;
  align-items: baseline;
}

.value-label {
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.value-text {
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 600;
  word-break: break-word;
}

.value-text.muted {
  color: #64748b;
  font-weight: 500;
  text-decoration: line-through;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}

.actor {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.avatar {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #e2e8f0;
  color: #334155;
  font-size: 0.68rem;
  font-weight: 700;
}

.actor-email {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #334155;
  font-size: 0.84rem;
}

.absolute-time {
  flex-shrink: 0;
  color: #94a3b8;
  font-size: 0.75rem;
}

.modal-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 16px;
  padding: 12px 20px;
  border-top: 1px solid #eef2f7;
  background: #fafbfc;
}

.footer-meta {
  color: #94a3b8;
  font-size: 0.75rem;
}

@media (max-width: 640px) {
  .modal-backdrop {
    padding: 0;
    align-items: stretch;
  }

  .modal-card {
    width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .value-row {
    grid-template-columns: 1fr;
    gap: 2px;
  }

  .card-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
