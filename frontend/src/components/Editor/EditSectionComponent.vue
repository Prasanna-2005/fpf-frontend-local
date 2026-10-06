<template>
  <div class="editor-section">
    <editorComponent
      :fundName="fundName"
      :filingId="filingId"
      :editedFlags="editedFlags"
      @open-upload="openUpload"
      @refresh-data="handleRefreshData"
      @open-computation-logs="openComputationLogs"
      @open-history="openHistory"
      @open-mapped-files="openMappedFiles"
    />
  </div>
</template>

<script setup>
import editorComponent from './editorComponent.vue'

const props = defineProps({
  fundName: {
    type: String,
    required: true,
  },
  filingId: {
    type: String,
    required: true,
  },
  editedFlags: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits([
  'open-upload',
  'refresh-data',
  'open-computationLogs',
  'open-history',
  'open-mapped-files',
])

function openUpload() {
  emit('open-upload')
}

function openMappedFiles() {
  emit('open-mapped-files')
}

async function handleRefreshData(done) {
  emit('refresh-data', done)
}

async function openHistory(fieldNo, fundId, fieldType) {
  emit('open-history', {
    fieldNo,
    filingId: props.filingId,
    fundId,
    fieldType,
  })
}

function openComputationLogs(data) {
  emit('open-computationLogs', data)
}
</script>

<style scoped>
.editor-section {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
