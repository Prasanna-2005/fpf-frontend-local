<template>
  <FilingWizardShell :step="1">
    <p class="field-label">Filing Name <span class="req">*</span></p>
    <p class="filing-name-display">{{ filingName }}</p>

    <div class="file-list">
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
          @click="removeFile(file.name)"
        >
          <font-awesome-icon icon="xmark" />
        </button>
      </div>
      <p v-if="files.length === 0" class="empty-state">No files selected</p>
    </div>

    <template #footer>
      <div></div>
      <div class="footer-right">
        <button type="button" class="btn-ghost" @click="emit('close-click')">Cancel</button>
        <button
          type="button"
          class="btn-primary"
          @click="uploadFiles"
          :disabled="isUploading || isMapping || files.length === 0"
        >
          <span
            v-if="isUploading || isMapping"
            class="spinner-border spinner-border-sm me-2"
            aria-hidden="true"
          ></span>
          <span v-if="!isUploading && !isMapping">Next</span>
          <span v-else-if="isUploading && !isMapping">Uploading...</span>
          <span v-else>Mapping...</span>
        </button>
      </div>
    </template>
  </FilingWizardShell>
</template>

<script setup>
import { useFileStore } from '@/stores/fileStore'
import { useUserStore } from '@/stores/userStore'
import { ref } from 'vue'
import api_call_methods from '@/assets/api_calls/api_calls'
import { useToast } from 'vue-toast-notification'
import FilingWizardShell from './FilingWizardShell.vue'
import { formatBytes, fileExtension } from '@/assets/utils/filingUploadUtils'

const toast = useToast()
const fileStore = useFileStore()
const userStore = useUserStore()
const userId = userStore.userID

const files = ref(fileStore.getFiles())
const filingName = fileStore.getfilingName()
const isUploading = ref(false)
const isMapping = ref(false)

const emit = defineEmits(['files-mapped', 'open-uploader', 'close-preview', 'close-click'])

function removeFile(filename) {
  fileStore.removeFile(filename)
  files.value = fileStore.getFiles()
}

async function uploadFiles() {
  try {
    isUploading.value = true
    const formData = fileStore.getFormData()
    formData.append('user_id', userId)
    formData.append('filing_name', filingName)
    formData.append('timestamp', new Date().toISOString())
    await api_call_methods.upload(formData, userId)

    isMapping.value = true
    const result = await api_call_methods.map_files(
      { filing_name: filingName },
      userId
    )

    const payload = result && typeof result === 'object' ? result : {}
    fileStore.clearFiles()
    emit('files-mapped', payload)
  } catch (error) {
    console.error(error)
  } finally {
    isUploading.value = false
    isMapping.value = false
  }
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

.filing-name-display {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px;
  flex-shrink: 0;
}

.file-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: auto;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 4px 12px;
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

.empty-state {
  color: #6b7280;
  text-align: center;
  padding: 40px 16px;
  margin: 0;
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
  display: inline-flex;
  align-items: center;
}

.btn-primary:hover:not(:disabled) {
  background: #1e40af;
}

.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
