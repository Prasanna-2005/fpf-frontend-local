<template>
  <div class="upload-container d-flex flex-column gap-3">
    <!-- Header -->
    <h3 class="section-title">Uploaded Files</h3>

    <!-- Filing Name -->
    <div>
      <label for="filing_name" class="form-label">
        Filing Name*
      </label>
      <p class="filing-name">
        <b>{{ filingName }}</b>
      </p>
    </div>

    <!-- Files Area -->
    <div
      class="dropzone-container d-flex flex-column justify-content-start"
    >
      <div class="file-list-grid">
        <fileComponent
          v-for="(file, index) in files"
          :key="index"
          :filename="file.name"
          :class="{ 'duplicate-highlight': isDuplicate(file.name) }"
          @remove-file="remove_file"
        />
      </div>

      <!-- Duplicate Files Warning -->
<div
  v-if="skippedFiles.length"
  class="duplicate-files-container mt-3"
>
  <div
    class="duplicate-header"
    @click="showDuplicates = !showDuplicates"
  >
    <div>
      <strong>{{ duplicateMessage }}</strong>
      <span class="duplicate-count">
        ({{ skippedFiles.length }} file(s))
      </span>
    </div>

    <span
      class="duplicate-arrow"
      :class="{ open: showDuplicates }"
    >
      ▼
    </span>
  </div>

  <div
    v-if="showDuplicates"
    class="duplicate-files-list"
  >
    <div
      v-for="file in skippedFiles"
      :key="file"
      class="duplicate-file-item"
    >
      ⚠ {{ getFileName(file) }}
    </div>
  </div>
</div>
    </div>

    <!-- Footer Buttons -->
    <div class="d-flex justify-content-end gap-2 mt-2">
      <button
        class="btn btn-outline-secondary"
        @click="$emit('close-click')"
        :disabled="isLoading_uploading || isLoading_mapping"
      >
        Cancel
      </button>

      <button
        type="submit"
        class="btn btn-primary"
        @click="upload_files"
        :disabled="isLoading_uploading || isLoading_mapping"
      >
        <span
          v-if="isLoading_uploading || isLoading_mapping"
          class="spinner-border spinner-border-sm me-2"
          role="status"
          aria-hidden="true"
        ></span>

        <span
          v-if="!isLoading_uploading && !isLoading_mapping"
        >
          Submit
        </span>

        <span
          v-else-if="isLoading_uploading"
        >
          Uploading...
        </span>

        <span v-else>
          Mapping...
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import fileComponent from './fileComponent.vue'
import { useFileStore } from '@/stores/fileStore'
import { useUserStore } from '@/stores/userStore'
import { ref } from 'vue'
import api_call_methods from '@/assets/api_calls/api_calls'
import { useToast } from 'vue-toast-notification'

const toast = useToast()

const fileStore = useFileStore()
const files = ref(fileStore.getFiles())
const filingName = fileStore.getfilingName()

const userStore = useUserStore()
const user_id = userStore.userID

const isLoading_uploading = ref(false)
const isLoading_mapping = ref(false)

const mapped_data = ref('')

const skippedFiles = ref([])
const duplicateMessage = ref('')
const showDuplicates = ref(false)
const emit = defineEmits([
  'files-mapped',
  'open-uploader',
  'close-preview'
])

function remove_file(filename) {
  fileStore.removeFile(filename)
  files.value = fileStore.getFiles()
}

function getFileName(path) {
  if (!path) return ''

  return path
    .split('\\')
    .filter(Boolean)
    .pop()
}

function isDuplicate(fileName) {
  return skippedFiles.value.some(
    path => getFileName(path) === fileName
  )
}

async function upload_files() {
  try {
    skippedFiles.value = []
    duplicateMessage.value = ''

    isLoading_uploading.value = true

    const formData = fileStore.getFormData()
    const current_time = new Date()

    formData.append('user_id', user_id)
    formData.append('filing_name', filingName)
    formData.append('timestamp', current_time.toISOString())

    await api_call_methods.upload(formData, user_id)

    isLoading_uploading.value = false
    isLoading_mapping.value = true

    const data = {
      filing_name: filingName
    }

    const result = await api_call_methods.map_files(data, user_id)

    mapped_data.value = result || {}

    fileStore.clearFiles()

    emit('files-mapped', mapped_data.value)

    toast.success('Files uploaded successfully')
  } catch (error) {
    if (error.response?.status === 409) {
      duplicateMessage.value =
        error.response.data?.message ||
        'Duplicate files found'

      skippedFiles.value =
        error.response.data?.skipped_files || []

      toast.warning(duplicateMessage.value)

      return
    }

    toast.error(
      error.response?.data?.message ||
      'Upload failed'
    )
  } finally {
    isLoading_uploading.value = false
    isLoading_mapping.value = false
  }
}
</script>

<style scoped>
/* Container */
.upload-container {
  width: 70%;
  height: 70%;
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* Section title */
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 6px;
  margin-bottom: 10px;
  color: #333;
}

/* Filing name */
.filing-name {
  font-size: 1rem;
  color: #444;
  margin: 0;
}

/* Dropzone */
.dropzone-container {
  flex: 1;
  border: 2px dashed #bbb;
  border-radius: 10px;
  background-color: #fafafa;
  padding: 15px;
  min-height: 200px;
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.dropzone-container:hover {
  border-color: #4a90e2;
  background-color: #f9fcff;
}

.file-list-grid {
  display: grid;
  gap: 16px;
  width: 100%;
  overflow-y: auto;
  max-height: 100%;
  padding: 4px;
}


/* Buttons */
.btn {
  min-width: 100px;
}

.btn-outline-secondary {
  border-radius: 8px;
}

.btn-primary {
  border-radius: 8px;
  font-weight: 500;
}
.duplicate-files-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border: 1px solid #ffc107;
  border-radius: 8px;
  background: #fff8e1;
  margin-top: 16px;
  overflow: hidden;
  flex-shrink: 0;
}
.dropzone-container {
  position: relative;
}



.duplicate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
  min-height: 52px;
}

.duplicate-header:hover {
  background: rgba(255, 193, 7, 0.1);
}

.duplicate-count {
  margin-left: 8px;
  color: #666;
}

.duplicate-arrow {
  font-size: 18px;
  transition: transform 0.2s ease;
}

.duplicate-arrow.open {
  transform: rotate(180deg);
}

.duplicate-files-list {
  border-top: 1px solid rgba(0, 0, 0, 0.08);

  /* Increase height */
  max-height: 350px;

  overflow-y: auto;
  background: white;
}

.duplicate-file-item {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  word-break: break-word;
  line-height: 1.5;
}

.duplicate-file-item:last-child {
  border-bottom: none;
}
</style>
