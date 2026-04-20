<template>
  <div class="modal-backdrop">
    <div class="modal-card">

      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5>
          File Mapping Details
        </h5>

        <button
          class="btn btn-sm btn-danger"
          @click="$emit('close-click')"
        >
          ✕
        </button>
      </div>
      <!-- Loader -->
        <div v-if="loading" class="text-center py-4">
            <div class="spinner-border" role="status"></div>
            <p class="mt-2">Loading file mappings...</p>
        </div>

        <div v-else>


        <table class="table table-bordered w-100">
            <thead>
                <tr>
                <th>File Name</th>
                <th>Quarter</th>
                <th>Fund Name</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="(file, index) in mapper_data" :key="index">
                <td>{{ file.filename }}</td>
                <td>{{ file.quarter }}</td>
                <td>{{ file.fundname }}</td>
                </tr>
            </tbody>
            </table>

        </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api_call_methods from '@/assets/api_calls/api_calls';
import { useFileStore } from '@/stores/fileStore';
const fileStore=useFileStore()

const filingName=fileStore.getfilingName()

const props = defineProps({
  userId: {
    type: String,
    required: true
  },
})
const mapper_data=ref({})
const loading=ref(false)
onMounted(async () => {
  loading.value = true
  try {
    const result = await api_call_methods.get_mapped_files(props.userId, filingName);
    mapper_data.value = result.data.file_mappings
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})






</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-card {
  background: white;
  width: 700px;
  max-height: 80vh;
  overflow: auto;
  padding: 20px;
  border-radius: 8px;
}

.subfield-header {
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  padding: 8px 0;
  border-bottom: 1px solid #dee2e6;
}

.history-block {
  border-radius: 6px;
  position: relative;
}

.current-block {
  background: #e9f7ef;
  border-left: 4px solid #28a745;
}

.previous-block {
  background: #f8f9fa;
}

.current-label {
  position: absolute;
  top: 8px;
  right: 10px;
  font-size: 12px;
  color: #28a745;
  font-weight: 600;
}
</style>