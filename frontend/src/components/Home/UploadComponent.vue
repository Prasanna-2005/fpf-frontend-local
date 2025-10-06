<template>
  <div class="upload-container d-flex flex-column gap-3 custom-view">
    <h3>Upload Files</h3>

    <!-- Filing Name -->
    <div>
      <label for="filing_name" class="form-label">Filing Name*</label>
      <p v-if="!new_filing" class="filing-name"><b>{{ filingName }}</b></p>
      <input 
        v-else
        type="text"
        class="f-20 form-control"
        id="filing_name"
        placeholder="Unique Name"
        v-model="filingName"
      />
    </div>

    <!-- Dropzone -->
    <div class="dropzone-container d-flex justify-content-center align-items-center">
      <div
        v-bind="getRootProps()"
        class="w-100 d-flex justify-content-center align-items-center flex-column py-4"
      >
        <input v-bind="getInputProps()" class="w-100" />
        <font-awesome-icon icon="cloud-arrow-up" class="upload-icon mb-2" />
        <h5 class="dropMessage">Drop files here</h5>
        <p>Supported formats: XLSX, XLS, ZIP</p>
        <p><b>OR</b></p>
        <button class="btn browse-btn">Browse files</button>

        <!-- File count feedback -->
        <div v-if="files.length > 0" class="mt-3 file-count">
          <font-awesome-icon icon="check-circle" class="me-2 text-success" />
          <span><b>{{ files.length }}</b> file<span v-if="files.length > 1">s</span> uploaded</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="d-flex justify-content-end gap-2 mt-3">
      <button class="btn btn-outline-secondary" @click="$emit('close-click')">
        Cancel
      </button>
      <button class="btn btn-primary" @click="submitUpload" :disabled="files.length === 0 || !filingName">
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { useDropzone } from "vue3-dropzone"
import { useFileStore } from '@/stores/fileStore'
import { ref } from 'vue'
const fileStore = useFileStore()

const new_filing=ref(fileStore.getNewFilingField())
const filingName = ref(fileStore.getfilingName() || '')
const files = ref([])
const emit = defineEmits(['Upload-done'])

function onDrop(acceptedFiles) {
  files.value = acceptedFiles
  fileStore.addFiles(filingName.value, acceptedFiles)
}

function submitUpload() {
  if (filingName.value !== '' && files.value.length > 0) {
    emit('Upload-done')
  }
}

const { getRootProps, getInputProps } = useDropzone({ onDrop })
</script>

<style scoped>
.upload-container {
  width: 70%;
  height: 70%;
  padding: 20px;
  background-color: white;
  border-radius: 15px;
}

.dropzone-container {
  height: 70%;
  border: 2px dashed grey;
  border-radius: 10px;
  background-color: #FAF9F6;
  width: 100%;
  transition: border-color 0.3s, background-color 0.3s;
}
.dropzone-container:hover {
  border-color: #4a90e2;
  background-color: #f9fcff;
}

.upload-icon {
  font-size: 3rem;
  color: #4a90e2;
}

.browse-btn {
  color: #4a90e2;
  font-weight: 500;
}

.file-count {
  font-size: 0.95rem;
  color: #333;
}
</style>
