<template>
  <div class="upload-container d-flex flex-column gap-3">
    <!-- Header -->
    <h3 class="section-title">Uploaded Files</h3>

    <!-- Filing Name -->
    <div>
      <label for="filing_name" class="form-label">Filing Name*</label>
      <p class="filing-name"><b>{{ filingName }}</b></p>
    </div>

    <!-- Dropzone -->
    <div class="dropzone-container d-flex justify-content-center align-items-center">
      <div class="file-list-grid">
        <fileComponent
          v-for="(file, index) in files"
          :key="index"
          :filename="file.name"
          @remove-file="remove_file"
        />
      </div>
    </div>

    <!-- Footer buttons -->
    <div class="d-flex justify-content-end gap-2 mt-2">
      <button class="btn btn-outline-secondary" @click="$emit('close-click')">Cancel</button>
      <button class="btn btn-primary">Submit</button>
    </div>
  </div>
</template>

<script setup>
import fileComponent from './fileComponent.vue';
import { useFileStore } from '@/stores/fileStore'
import { ref } from 'vue'

const fileStore = useFileStore()
const files = ref(fileStore.getFiles())
const filingName = fileStore.getfilingName()

function remove_file(filename) {
  fileStore.removeFile(filename)
  files.value = fileStore.getFiles()
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

/* File grid */
.file-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); 
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
</style>
