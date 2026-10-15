<template>
  <div class="mapper-root">
  <FilingWizardShell v-if="!uploaderFlag" :step="2" wide>
    <div class="section-bar">
      <div class="section-tabs" role="tablist" aria-label="File mapping views">
        <button
          type="button"
          role="tab"
          class="section-tab"
          :class="{ active: mappingView === 'mapped' }"
          :aria-selected="mappingView === 'mapped'"
          @click="mappingView = 'mapped'"
        >
          Mapped Files
        </button>
        <button
          type="button"
          role="tab"
          class="section-tab"
          data-testid="unmapped-tab"
          :class="{ active: mappingView === 'unmapped' }"
          :aria-selected="mappingView === 'unmapped'"
          @click="mappingView = 'unmapped'"
        >
          Unmapped Files
          <span v-if="unmappedCount" class="tab-count">{{ unmappedCount }}</span>
        </button>
      </div>
      <button type="button" class="btn-outline" @click="openUploader">
        <font-awesome-icon icon="cloud-arrow-up" />
        Upload More Files
      </button>
    </div>

    <div v-if="mappingView === 'mapped'" class="table-wrap" role="tabpanel">
      <table>
        <thead>
          <tr>
            <th>S/N</th>
            <th>Fund Name</th>
            <th v-if="series === 'Private Investors'">Quarter</th>
            <th v-else>File Type</th>
            <th v-if="series === 'Curio'">Period</th>
            <th>Mapped File</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in mappedRows" :key="row.key">
            <td class="sn">{{ row.serial }}</td>
            <td>{{ row.fund.fundname }}</td>
            <td>
              <span
                v-if="row.isQuarter"
                class="quarter"
                :class="row.quarterClass"
              >
                {{ row.fund.quarter }}
              </span>
              <span v-else>{{ row.fund.quarter }}</span>
            </td>
            <td v-if="series === 'Curio'">{{ row.fund.period }}</td>
            <td>
              <div v-if="row.mappedFile" class="mapped-cell">
                <span class="mapped-indicator" title="Mapped successfully" aria-label="Mapped successfully">
                  <font-awesome-icon icon="check" />
                </span>
                <span class="fname" :title="displayFileName(row.mappedFile)">{{ displayFileName(row.mappedFile) }}</span>
                <button
                  type="button"
                  class="file-remove"
                  aria-label="Remove mapping"
                  @click="removeFileFromFund(row.fund, row.mappedFile)"
                >
                  <font-awesome-icon icon="xmark" />
                </button>
              </div>

              <div v-else class="unmapped-cell">
                <div class="select-file-wrap dropdown">
                <button
                  class="btn-select dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  :disabled="!localData.unmapped_files?.length"
                >
                  Select File
                </button>
                <ul class="dropdown-menu">
                  <li v-for="(item, idx) in localData.unmapped_files" :key="item.filepath || item.volfilename || item.filename || idx">
                    <button
                      type="button"
                      class="dropdown-item"
                      @click="updateUnmappedFiles(row.fund, item)"
                    >
                      {{ displayFileName(item.filename) }}
                    </button>
                  </li>
                  <li v-if="!localData.unmapped_files?.length">
                    <button type="button" class="dropdown-item" disabled>
                      No files available
                    </button>
                  </li>
                </ul>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="table-wrap" role="tabpanel" data-testid="unmapped-panel">
      <div v-if="!unmappedCount" class="empty-unmapped">
        All uploaded files are mapped.
      </div>
      <table v-else>
        <thead>
          <tr>
            <th>S/N</th>
            <th>File</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in localData.unmapped_files" :key="item.filepath || item.volfilename || item.filename || idx">
            <td class="sn">{{ String(idx + 1).padStart(2, '0') }}</td>
            <td class="fname" :title="displayFileName(item.filename)">{{ displayFileName(item.filename) }}</td>
            <td class="reason">{{ item.reason || 'No reason recorded.' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <template #footer>
      <button type="button" class="btn-secondary" @click="openUploader">Back</button>
      <div class="footer-right">
        <button type="button" class="btn-ghost" @click="handleCancel">Cancel</button>
        <button
          type="button"
          class="btn-primary"
          @click="proceed"
          :disabled="isLoading || !hasMappedFiles"
          :title="!hasMappedFiles ? 'Map at least one file before submitting' : undefined"
        >
          <span
            v-if="isLoading"
            class="spinner-border spinner-border-sm me-2"
            aria-hidden="true"
          ></span>
          <span v-if="!isLoading">Submit</span>
          <span v-else>Submitting...</span>
        </button>
      </div>
    </template>
  </FilingWizardShell>

  <div
    v-if="showSuccessModal"
    class="backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="success-title"
  >
    <div class="modal-card">
      <div class="modal-icon" aria-hidden="true">
        <font-awesome-icon icon="check" />
      </div>
      <h2 id="success-title">File Submitted Successfully</h2>
      <p>
        Your filing has been submitted and is now being processed. Track progress from the
        dashboard.
      </p>
      <button
        type="button"
        class="btn-primary modal-btn"
        ref="successBtnRef"
        @click="backToDashboard"
      >
        Back to Dashboard
        <font-awesome-icon icon="arrow-right" />
      </button>
    </div>
  </div>
  </div>
</template>

<script setup>
import api_call_methods from '@/assets/api_calls/api_calls'
import { ref, computed, watch, nextTick } from 'vue'
import { useFileStore } from '@/stores/fileStore'
import { useUserStore } from '@/stores/userStore'
import { useToast } from 'vue-toast-notification'
import FilingWizardShell from './FilingWizardShell.vue'
import { fundRowKey } from '@/assets/utils/filingUploadUtils'
import { dedupeMappings, dedupeStoredFiles, displayFileName } from '@/assets/utils/unmappedReason'

const toast = useToast()
const emit = defineEmits(['open-uploader', 'close-click', 'submit-success'])
const isLoading = ref(false)
const showSuccessModal = ref(false)
const uploaderFlag = ref(false)
const successBtnRef = ref(null)
const fileStore = useFileStore()
const filingName = fileStore.getfilingName()
const userStore = useUserStore()
const userId = userStore.userID

let removeEscapeListener = null

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

function cloneData(source) {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(source)
    } catch {
      // Fall through for non-cloneable values
    }
  }
  return JSON.parse(JSON.stringify(source))
}

const fileMappings = dedupeMappings(props.data.file_mappings)
const mappedNames = new Set(
  fileMappings.map((file) => displayFileName(file.filename).toLowerCase())
)
const unmappedFiles = dedupeStoredFiles(props.data.unmapped_files).filter(
  (file) => !mappedNames.has(displayFileName(file.filename).toLowerCase())
)
const reasonByFilename = new Map(
  dedupeStoredFiles(props.data.unmapped_files)
    .filter((file) => file.reason)
    .map((file) => [displayFileName(file.filename).toLowerCase(), file.reason])
)
const localData = ref({
  ...cloneData(props.data),
  file_mappings: fileMappings,
  unmapped_files: unmappedFiles,
})

const series = localData.value.series
const mappingView = ref('mapped')

const periodOrder = {
  q1: 1,
  january: 2,
  february: 3,
  march: 4,
  q2: 5,
  april: 6,
  may: 7,
  june: 8,
  q3: 9,
  july: 10,
  august: 11,
  september: 12,
  q4: 13,
  october: 14,
  november: 15,
  december: 16,
}

function getPeriodSortValue(period) {
  if (!period) return 999
  const normalized = period.toString().trim().toLowerCase()
  return periodOrder[normalized] ?? 999
}

const sortedFundDetails = computed(() => {
  const details = localData.value.fund_details || []
  if (series !== 'Curio') return details
  return [...details].sort(
    (a, b) => getPeriodSortValue(a.period) - getPeriodSortValue(b.period)
  )
})

function normalizePeriod(val) {
  return val ?? null
}

function isSameMapping(fm, fund) {
  return (
    fm.shortcode === fund.shortcode &&
    fm.quarter === fund.quarter &&
    (fm.period || fund.period
      ? normalizePeriod(fm.period) === normalizePeriod(fund.period)
      : true)
  )
}

function getMappedEntry(fund) {
  return (localData.value.file_mappings || []).find((fm) => isSameMapping(fm, fund)) || null
}

function getMappedFile(fund) {
  const entry = getMappedEntry(fund)
  return entry ? entry.filename : ''
}

function isQuarterLabel(value) {
  return /^q[1-4]$/i.test(String(value || '').trim())
}

function quarterClass(value) {
  return String(value || '').trim().toLowerCase()
}

const mappedRows = computed(() =>
  sortedFundDetails.value.map((fund, index) => {
    const entry = getMappedEntry(fund)
    const mappedFile = entry ? entry.filename : ''
    return {
      fund,
      key: fundRowKey(fund, index),
      serial: String(index + 1).padStart(2, '0'),
      mappedFile,
      isQuarter: isQuarterLabel(fund.quarter),
      quarterClass: quarterClass(fund.quarter),
    }
  })
)

const unmappedCount = computed(() => localData.value.unmapped_files?.length || 0)

const hasMappedFiles = computed(() =>
  mappedRows.value.some((row) => Boolean(row.mappedFile))
)

function updateUnmappedFiles(fund, file) {
  if (!localData.value.unmapped_files) {
    localData.value.unmapped_files = []
  }

  const filename = typeof file === 'string' ? file : file?.filename
  const idx = localData.value.unmapped_files.findIndex((f) => f.filename === filename)
  let fileObj = null
  if (idx !== -1) {
    fileObj = localData.value.unmapped_files[idx]
    localData.value.unmapped_files.splice(idx, 1)
  } else if (file && typeof file === 'object') {
    fileObj = file
  }

  localData.value.file_mappings.push({
    // Spread first so volume identity (filepath, volfilename, version,
    // group_id, timestamp) survives the move; slot fields are overridden.
    ...fileObj,
    filename,
    filepath: fileObj?.filepath || '',
    shortcode: fund.shortcode,
    quarter: fund.quarter,
    fundname: fund.fundname,
    period: normalizePeriod(fileObj?.period ?? fund.period),
    reason: fileObj?.reason || reasonByFilename.get(displayFileName(filename).toLowerCase()) || '',
  })
}

function removeFileFromFund(fund, filename) {
  if (!localData.value.unmapped_files) {
    localData.value.unmapped_files = []
  }

  const idx = localData.value.file_mappings.findIndex(
    (fm) => isSameMapping(fm, fund) && fm.filename === filename
  )
  if (idx === -1) return

  const fileObj = localData.value.file_mappings[idx]
  localData.value.file_mappings.splice(idx, 1)

  const exists = localData.value.unmapped_files.some((f) => f.filename === filename)
  if (!exists) {
    const reason =
      fileObj.reason ||
      reasonByFilename.get(displayFileName(filename).toLowerCase()) ||
      ''
    localData.value.unmapped_files.push({
      ...fileObj,
      filename: fileObj.filename,
      filepath: fileObj.filepath,
      shortcode: fileObj.shortcode || fund.shortcode,
      fundname: fileObj.fundname || fund.fundname,
      quarter: fileObj.quarter || fund.quarter,
      period: normalizePeriod(fileObj.period ?? fund.period),
      reason,
    })
  }
}

async function proceed() {
  if (!hasMappedFiles.value) {
    toast.error('Please map at least one file before submitting.')
    return
  }

  try {
    isLoading.value = true
    await api_call_methods.submit_files(
      {
        user_id: userId,
        filing_name: filingName,
        file_mappings: localData.value.file_mappings,
        new_filing: fileStore.getNewFilingField(),
        timestamp: new Date(),
        series: localData.value.series,
      },
      userId
    )
    showSuccessModal.value = true
  } catch (error) {
    console.error('Error updating mappings:', error)
  } finally {
    isLoading.value = false
  }
}

function backToDashboard() {
  showSuccessModal.value = false
  fileStore.clearAllData()
  emit('submit-success')
}

async function handleCancel() {
  try {
    if (fileStore.getNewFilingField()) {
      await api_call_methods.discard_filing({ filing_name: filingName }, userId)
      toast.success('Filing cancelled!')
      fileStore.clearAllData()
    }
    emit('close-click')
  } catch (error) {
    console.error(error)
  }
}

function openUploader() {
  fileStore.upload_more()
  emit('open-uploader')
  uploaderFlag.value = true
}

watch(showSuccessModal, async (open) => {
  if (removeEscapeListener) {
    removeEscapeListener()
    removeEscapeListener = null
  }
  if (!open) return
  await nextTick()
  successBtnRef.value?.focus()
  const onKeydown = (event) => {
    if (event.key === 'Escape') backToDashboard()
  }
  window.addEventListener('keydown', onKeydown)
  removeEscapeListener = () => window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.mapper-root {
  width: 100%;
  height: 100%;
  max-height: 100%;
  max-width: 1100px;
}

.mapper-root :deep(.filing-panel) {
  height: 100%;
  max-height: 100%;
}

.section-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.section-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-tab {
  background: #fff;
  border: 1px solid #dbe3f0;
  color: #6b7280;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.section-tab.active {
  background: #1e3a8a;
  border-color: #1e3a8a;
  color: #fff;
}

.section-tab:hover:not(.active) {
  background: #eff6ff;
  color: #1e3a8a;
}

.tab-count {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 0.7rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.section-tab.active .tab-count {
  background: #fff;
  color: #1e3a8a;
}

.empty-unmapped {
  padding: 28px 16px;
  color: #6b7280;
  font-size: 0.9rem;
}

.reason {
  white-space: normal;
  line-height: 1.45;
  max-width: 560px;
}

.btn-outline {
  background: #fff;
  border: 1px solid #1e3a8a;
  color: #1e3a8a;
  border-radius: 8px;
  padding: 9px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-outline:hover {
  background: #eff6ff;
}

.table-wrap {
  overflow: auto;
  flex: 1;
  min-height: 0;
  margin-bottom: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.875rem;
}

thead th {
  position: sticky;
  top: 0;
  z-index: 2;
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
}

.quarter {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
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

.mapped-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.mapped-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #16a34a;
  color: #fff;
  font-size: 0.7rem;
  flex-shrink: 0;
}

.mapped-cell .fname,
td.fname {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.85rem;
}

.file-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 4px;
  display: flex;
  font-size: 0.85rem;
}

.file-remove:hover {
  color: #dc2626;
}

.unmapped-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-file-wrap {
  position: relative;
  display: inline-block;
}

.btn-select {
  background: #1e3a8a;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-select:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.select-file-wrap :deep(.dropdown-menu) {
  min-width: 280px;
  max-width: 420px;
  max-height: 220px;
  overflow: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 6px 0;
}

.select-file-wrap :deep(.dropdown-item) {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 10px 14px;
  font-size: 0.8rem;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.select-file-wrap :deep(.dropdown-item:hover) {
  background: #f3f4f6;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.btn-ghost {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  padding: 10px 14px;
}

.btn-ghost:hover {
  color: #1f2937;
}

.btn-secondary {
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #1f2937;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #f9fafb;
}

.btn-primary {
  background: #1e3a8a;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 22px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  background: #1e40af;
}

.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 24px;
}

.modal-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px 36px 32px;
  max-width: 440px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.modal-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #dcfce7;
  color: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 1.5rem;
}

.modal-card h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 10px;
  color: #111827;
}

.modal-card p {
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 24px;
}

.modal-btn {
  width: 100%;
  justify-content: center;
}
</style>
