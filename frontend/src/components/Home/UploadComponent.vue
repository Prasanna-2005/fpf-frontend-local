<template>
  <FilingWizardShell :step="1">
    <label for="filing_name" class="field-label">
      Filing Name <span class="req">*</span>
    </label>
    <p v-if="!newFiling || uploadMore" class="filing-name-display">{{ filingName }}</p>
    <input
      v-else
      type="text"
      class="text-input"
      id="filing_name"
      placeholder="Unique filing name"
      v-model="filingName"
      @input="validateName"
    />
    <p v-if="errorMessage" class="error-text" role="alert">{{ errorMessage }}</p>

    <div
      v-bind="getRootProps({ 'aria-label': 'Upload files' })"
      class="dropzone"
    >
      <input id="filing-file-input" v-bind="getInputProps()" />
      <font-awesome-icon icon="cloud-arrow-up" class="dropzone-icon" aria-hidden="true" />
      <h3>Drag &amp; Drop Files Here</h3>
      <p>Supported formats: {{ UPLOAD_FORMATS_LABEL }}</p>
      <button type="button" class="btn-browse" @click.stop="openFileDialog">
        Browse Files
      </button>
    </div>

    <div v-if="files.length" class="file-list">
      <div
        v-for="(file, index) in files"
        :key="`${file.name}-${file.size}-${index}`"
        class="file-row"
      >
        <div class="file-icon" aria-hidden="true">
          <font-awesome-icon icon="file" />
        </div>
        <div class="file-meta">
          <div class="name" :title="file.name">{{ file.name }}</div>
          <div class="size">{{ fileExtension(file.name) }} · {{ formatBytes(file.size) }}</div>
        </div>
        <button
          type="button"
          class="file-remove"
          aria-label="Remove file"
          @click.stop="removeFile(index)"
        >
          <font-awesome-icon icon="xmark" />
        </button>
      </div>
    </div>

    <template #footer>
      <div></div>
      <div class="footer-right">
        <button type="button" class="btn-ghost" @click="handleCancel">Cancel</button>
        <button
          type="button"
          class="btn-primary"
          @click="submitUpload"
          :disabled="files.length === 0 || !filingName || !isNameValid"
        >
          Next
        </button>
      </div>
    </template>
  </FilingWizardShell>
</template>

<script setup>
import { useDropzone } from 'vue3-dropzone'
import { useFileStore } from '@/stores/fileStore'
import { ref, watch } from 'vue'
import { useToast } from 'vue-toast-notification'
import { useUserStore } from '@/stores/userStore'
import api_call_methods from '@/assets/api_calls/api_calls'
import FilingWizardShell from './FilingWizardShell.vue'
import {
  formatBytes,
  fileExtension,
  isAllowedUploadFile,
  UPLOAD_ACCEPT,
  UPLOAD_FORMATS_LABEL,
} from '@/assets/utils/filingUploadUtils'

const toast = useToast()
const fileStore = useFileStore()
const userStore = useUserStore()
const userId = userStore.userID

const newFiling = ref(fileStore.getNewFilingField())
const filingName = ref(fileStore.getfilingName() || '')
const uploadMore = ref(fileStore.getUploadMore())
const files = ref([...fileStore.getFiles()])
const errorMessage = ref('')
const isNameValid = ref(true)
const emit = defineEmits(['upload-done', 'close-click'])

function onDrop(acceptedFiles, rejectReasons = []) {
  const validFiles = []
  const invalidFiles = []

  acceptedFiles.forEach((file) => {
    if (isAllowedUploadFile(file.name)) {
      if (!files.value.some((f) => f.name === file.name)) {
        validFiles.push(file)
      }
    } else {
      invalidFiles.push(file.name)
    }
  })

  rejectReasons.forEach((rejection) => {
    const name = rejection?.file?.name
    if (name) invalidFiles.push(name)
  })

  if (invalidFiles.length > 0) {
    toast.error(
      `Invalid file type: ${[...new Set(invalidFiles)].join(', ')}. Only ${UPLOAD_FORMATS_LABEL} allowed.`
    )
  }

  if (validFiles.length > 0) {
    files.value = [...files.value, ...validFiles]
    fileStore.addFiles(filingName.value, files.value)
  }
}


function removeFile(index) {
  const filename = files.value[index]?.name
  if (!filename) return
  fileStore.removeFile(filename)
  files.value = fileStore.getFiles()
}

watch(filingName, (newVal) => {
  if (newVal) {
    fileStore.add_filing_name(newVal)
  }
})

function submitUpload() {
  if (filingName.value !== '' && files.value.length > 0) {
    emit('upload-done')
  }
}

function validateName() {
  let value = filingName.value
  const allowedPattern = /^[A-Za-z0-9 _-]*$/

  if (!allowedPattern.test(value)) {
    isNameValid.value = false
    errorMessage.value = 'Allow only A–Z, 0–9, spaces, _ and -'
    filingName.value = value.replace(/[^A-Za-z0-9 _-]/g, '')
    return
  }

  value = value.replace(/\s{2,}/g, ' ').replace(/^\s+/, '')
  filingName.value = value

  if (fileStore.isNameTaken(value.trim())) {
    isNameValid.value = false
    errorMessage.value = 'Filing name already exists.'
    return
  }

  isNameValid.value = true
  errorMessage.value = ''
}

async function handleCancel() {
  try {
    if (fileStore.getUploadMore()) {
      await api_call_methods.discard_filing(
        { filing_name: filingName.value },
        userId
      )
      toast.success('Filing cancelled!')
      fileStore.clearAllData()
    }
    emit('close-click')
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to cancel filing')
  }
}

const { getRootProps, getInputProps, open } = useDropzone({
  onDrop,
  accept: UPLOAD_ACCEPT,
  multiple: true,
})

function openFileDialog() {
  open()
}
</script>

<style scoped>
.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1f2937;
  flex-shrink: 0;
}

.field-label .req {
  color: #dc2626;
}

.text-input {
  width: 100%;
  max-width: 480px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 11px 14px;
  font-size: 0.9rem;
  outline: none;
  margin-bottom: 20px;
  background: #fff;
  flex-shrink: 0;
}

.text-input:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.filing-name-display {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px;
  flex-shrink: 0;
}

.error-text {
  color: #dc2626;
  font-size: 0.8rem;
  margin: -12px 0 16px;
  flex-shrink: 0;
}

.dropzone {
  border: 2px dashed #93c5fd;
  border-radius: 12px;
  background: #f3f7fd;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.dropzone:hover {
  background: #e8f0fe;
  border-color: #2563eb;
}

.dropzone-icon {
  font-size: 2.5rem;
  color: #2563eb;
  margin-bottom: 12px;
}

.dropzone h3 {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0 0 6px;
  color: #1f2937;
}

.dropzone p {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0 0 14px;
}

.btn-browse {
  background: #fff;
  border: 1px solid #93c5fd;
  color: #2563eb;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-browse:hover {
  background: #eff6ff;
}

.file-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: auto;
  margin-bottom: 8px;
}

.file-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 4px;
  border-bottom: 1px solid #f3f4f6;
}

.file-row:last-child {
  border-bottom: none;
}

.file-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #dcfce7;
  color: #166534;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.file-meta {
  flex: 1;
  min-width: 0;
}

.file-meta .name {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #1f2937;
}

.file-meta .size {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
}

.file-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 4px;
  display: flex;
  font-size: 0.95rem;
}

.file-remove:hover {
  color: #dc2626;
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

.btn-primary {
  background: #1e3a8a;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 22px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: #1e40af;
}

.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
