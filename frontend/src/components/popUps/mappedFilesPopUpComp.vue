<template>
  <div class="modal-backdrop" @click.self="$emit('close-click')">
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="mapped-title">
      <div class="modal-header">
        <div>
          <h2 id="mapped-title">Mapped Files</h2>
          <p class="subtitle">{{ filingName || 'File mapping details for this filing' }}</p>
        </div>
        <button type="button" class="modal-close" aria-label="Close" @click="$emit('close-click')">
          <font-awesome-icon icon="xmark" />
        </button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="state-box">
          <span class="ui-spinner" role="status" aria-hidden="true"></span>
          <p>Loading file mappings…</p>
        </div>

        <div v-else-if="error" class="state-box error">
          <font-awesome-icon icon="info-circle" />
          <p>{{ error }}</p>
        </div>

        <div v-else-if="!rows.length" class="state-box">
          <p>No mapped files found for this filing.</p>
        </div>

        <template v-else>
          <div class="summary-bar">
            <span class="summary-label">Total mappings</span>
            <span class="summary-count">{{ rows.length }}</span>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Fund Name</th>
                  <th>Quarter</th>
                  <th>Mapped File</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(file, index) in rows" :key="index">
                  <td class="sn">{{ String(index + 1).padStart(2, '0') }}</td>
                  <td>{{ file.fundname || '—' }}</td>
                  <td>
                    <span class="quarter" :class="quarterClass(file.quarter)">
                      {{ file.quarter || '—' }}
                    </span>
                  </td>
                  <td>
                    <div class="file-cell">
                      <font-awesome-icon icon="file" class="file-icon" />
                      <span class="filename" :title="file.filename">
                        {{ file.filename || '—' }}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api_call_methods from '@/assets/api_calls/api_calls'
import { useFileStore } from '@/stores/fileStore'
import { useUserStore } from '@/stores/userStore'

const fileStore = useFileStore()
const userStore = useUserStore()
const filingName = ref(fileStore.getfilingName() || '')

const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
  filingId: {
    type: String,
    default: '',
  },
})

defineEmits(['close-click'])

const mapper_data = ref([])
const loading = ref(false)
const error = ref('')

const rows = computed(() => {
  const data = mapper_data.value
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') return Object.values(data)
  return []
})

function quarterClass(quarter) {
  const q = String(quarter || '')
    .toLowerCase()
    .replace(/\s+/g, '')
  if (q.includes('q1') || q === '1') return 'q1'
  if (q.includes('q2') || q === '2') return 'q2'
  if (q.includes('q3') || q === '3') return 'q3'
  if (q.includes('q4') || q === '4') return 'q4'
  return ''
}

// The filing name used to live only in localStorage/pinia, set once by the
// dashboard table. Any path that skips the table (direct link, fresh
// browser, cleared storage) left it empty and the mapper call 404'd.
// Resolve it here, falling back to the filings list via filing id.
async function resolveFilingName() {
  const stored = fileStore.getfilingName() || localStorage.getItem('filingName')
  if (stored) return stored
  if (!props.filingId) return ''
  const result = await api_call_methods.filings_list(props.userId, userStore.clientCode)
  const match = (result?.data || []).find((f) => f.id === props.filingId)
  return match?.filing_name || ''
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const name = await resolveFilingName()
    if (!name) {
      error.value = 'Could not determine the filing name for this filing. Please reopen it from the dashboard.'
      return
    }
    filingName.value = name
    fileStore.add_filing_name(name)
    const result = await api_call_methods.get_mapped_files(props.userId, name)
    mapper_data.value = result.data?.file_mappings || []
  } catch (err) {
    console.error(err)
    error.value = 'Failed to load file mappings. Please try again.'
  } finally {
    loading.value = false
  }
})
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
  align-items: flex-start;
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

.subtitle {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: #6b7280;
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
  flex-shrink: 0;
}

.modal-close:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 16px 22px 22px;
}

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 16px;
  color: #6b7280;
  text-align: center;
}

.state-box.error {
  color: #dc2626;
}

.state-box p {
  margin: 0;
  font-size: 0.9rem;
}

.ui-spinner {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2.5px solid rgba(30, 58, 138, 0.18);
  border-top-color: #1e3a8a;
  animation: ui-spin 0.75s linear infinite;
  display: inline-block;
}

@keyframes ui-spin {
  to {
    transform: rotate(360deg);
  }
}

.summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  margin-bottom: 14px;
}

.summary-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.summary-count {
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: 999px;
  background: #2563eb;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.table-wrap {
  overflow: auto;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #e8eef8;
  color: #6b7280;
  font-weight: 600;
  text-align: left;
  padding: 14px 16px;
  white-space: nowrap;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.03em;
  border-bottom: 1px solid #dbe3f0;
}

tbody td {
  padding: 14px 16px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
  color: #374151;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background: #fafbfc;
}

.sn {
  color: #6b7280;
  font-weight: 500;
  width: 56px;
}

.quarter {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #64748b;
}

.quarter.q1 {
  background: #dbeafe;
  color: #1e40af;
}

.quarter.q2 {
  background: #ede9fe;
  color: #6d28d9;
}

.quarter.q3 {
  background: #d1fae5;
  color: #047857;
}

.quarter.q4 {
  background: #ffedd5;
  color: #9a3412;
}

.file-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.file-icon {
  color: #16a34a;
  flex-shrink: 0;
}

.filename {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  color: #111827;
}
</style>
