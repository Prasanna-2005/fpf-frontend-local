<template>
  <div class="modal-backdrop">
    <div class="modal-card">
      <div class="compare-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Compare with a related filing</h5>
        <button class="btn btn-sm btn-danger" @click="$emit('close-click')">✕</button>
      </div>

      <p class="text-muted small mb-3 px-0">
        Only filings from the same reporting company are listed.
      </p>

      <div class="compare-body">
        <div v-if="loading" class="text-center py-4">
          <span class="spinner-border text-primary" role="status"></span>
          <p class="text-muted mt-2 mb-0">Loading related filings…</p>
        </div>

        <div v-else-if="error" class="text-center py-4">
          <p class="text-danger mb-0">Could not load related filings.</p>
        </div>

        <div v-else-if="!relatedFilings.length" class="text-center py-4">
          <p class="mb-0 text-muted">No related filings found</p>
        </div>

        <div v-else class="related-list">
          <label
            v-for="filing in relatedFilings"
            :key="filing.id"
            class="related-item"
            :class="{ selected: selectedId === filing.id }"
          >
            <input
              type="radio"
              class="form-check-input me-2"
              name="relatedFiling"
              :value="filing.id"
              v-model="selectedId"
            />
            <span>
              <strong>{{ filing.filing_name }}</strong>
              <small class="d-block text-muted">
                {{ formatDate(filing.modified_on) }}
                <span v-if="filing.filingStatus"> · {{ filing.filingStatus }}</span>
              </small>
            </span>
          </label>
        </div>
      </div>

      <div class="compare-footer d-flex justify-content-end gap-2">
        <button class="btn btn-outline-secondary" @click="$emit('close-click')">Cancel</button>
        <button
          class="btn btn-primary"
          :disabled="!selectedId"
          @click="confirmCompare"
        >
          Compare
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api_call_methods from '@/assets/api_calls/api_calls'
import { useUserStore } from '@/stores/userStore'

const props = defineProps({
  filingId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close-click', 'compare-selected'])
const userStore = useUserStore()
const relatedFilings = ref([])
const selectedId = ref('')
const loading = ref(true)
const error = ref(false)

onMounted(async () => {
  try {
    loading.value = true
    const result = await api_call_methods.get_related_filings(userStore.userID, props.filingId)
    relatedFilings.value = result.data?.data || []
  } catch (err) {
    error.value = true
    console.error('Error fetching related filings:', err)
  } finally {
    loading.value = false
  }
})

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString()
}

function confirmCompare() {
  const selected = relatedFilings.value.find((filing) => filing.id === selectedId.value)
  if (!selected) return
  emit('compare-selected', selected)
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-card {
  background: white;
  width: 650px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 8px;
}

.compare-header {
  flex-shrink: 0;
  margin-bottom: 12px;
}

.compare-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

.compare-footer {
  flex-shrink: 0;
  padding-top: 16px;
  margin-top: 12px;
  border-top: 1px solid #e9ecef;
  background: white;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.related-item {
  display: flex;
  align-items: flex-start;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 10px 12px;
  cursor: pointer;
}

.related-item.selected {
  border-color: #0d6efd;
  background: #f0f6ff;
}
</style>
