<template>
  <div class="overlay-panel-wrap">
    <UploadComponent
      v-if="upload"
      @close-click="closeUpload"
      @upload-done="uploadCompleted"
    />
    <UploadedFilePreview
      v-if="uploadedFilePreview"
      @close-click="closeUpload"
      @files-mapped="openMapperComp"
      @open-uploader="openUploaderComp"
      @close-preview="closePreview"
    />
    <MapperComponent
      v-if="openMapper"
      :data="mappedData"
      @close-click="closeUpload"
      @open-uploader="openUploaderComp"
      @submit-success="handleSubmitSuccess"
    />
  </div>
</template>

<script setup>
import UploadComponent from './UploadComponent.vue'
import UploadedFilePreview from './UploadedFilePreview.vue'
import MapperComponent from './MapperComponent.vue'
import { ref } from 'vue'
import { useFileStore } from '@/stores/fileStore'

const fileStore = useFileStore()
const upload = ref(true)
const uploadedFilePreview = ref(false)
const openMapper = ref(false)
const mappedData = ref({})
const emit = defineEmits(['close-upload', 'submit-success'])

function closeUpload() {
  emit('close-upload')
  if (fileStore.getNewFilingField()) {
    fileStore.clearAllData()
  }
}

function uploadCompleted() {
  upload.value = false
  uploadedFilePreview.value = true
}

function closePreview() {
  uploadedFilePreview.value = false
}

function openMapperComp(payload) {
  uploadedFilePreview.value = false
  mappedData.value = payload?.data ?? payload ?? {}
  openMapper.value = true
}

function openUploaderComp() {
  openMapper.value = false
  upload.value = true
}

function handleSubmitSuccess() {
  emit('submit-success')
  emit('close-upload')
}
</script>

<style scoped>
.overlay-panel-wrap {
  width: 100%;
  height: 100%;
  padding: 28px 32px 24px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: stretch;
  background: #eef1f6;
  box-sizing: border-box;
}

.overlay-panel-wrap > * {
  height: 100%;
  max-height: 100%;
}

@media (max-width: 900px) {
  .overlay-panel-wrap {
    padding: 16px;
  }
}
</style>
