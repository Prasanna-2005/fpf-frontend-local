<template>
  <div class="modal-backdrop">
    <div class="modal-card">

      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5>Changes</h5>

        <button
          class="btn btn-sm btn-danger"
          @click="$emit('close-click')"
        >
          ✕
        </button>
      </div>

      <!-- No Records -->
      <div v-if="!list || list.length === 0" class="text-center py-4">
        <p class="mb-0 text-muted">No changes found.</p>
      </div>

      <div v-else>
        <div
          v-for="(item, index) in list"
          :key="getItemKey(item, index)"
          class="mb-4"
        >

          <!-- Collapsible Header -->
          <div
            class="subfield-header"
            @click="toggle(getItemKey(item, index))"
          >
            <strong>{{ getItemLabel(item, index) }}</strong>
            <span>{{ isOpen(getItemKey(item, index)) ? '−' : '+' }}</span>
          </div>

          <!-- Collapsible Content -->
          <div v-if="isOpen(getItemKey(item, index))" class="mt-3">

            <!-- Nested changes array -->
            <template v-if="getChangeEntries(item).length">
              <div
                v-for="(change, changeIndex) in getChangeEntries(item)"
                :key="changeIndex"
                class="history-block mb-3 p-3"
                :class="change.is_current_value ? 'current-block' : 'previous-block'"
              >
                <p v-if="hasField(change, 'value')" class="mb-1">
                  <strong>Value:</strong>
                  {{ change.value || '—' }}
                </p>

                <p v-if="hasField(change, 'old_value')" class="mb-1">
                  <strong>Old Value:</strong>
                  {{ change.old_value || '—' }}
                </p>

                <p v-if="hasField(change, 'new_value')" class="mb-1">
                  <strong>New Value:</strong>
                  {{ change.new_value || '—' }}
                </p>

                <p v-if="hasField(change, 'created_at')" class="mb-1">
                  <strong>Created At:</strong>
                  {{ formatDate(change.created_at) }}
                </p>

                <p v-if="hasField(change, 'created_by')" class="mb-0">
                  <strong>Created By:</strong>
                  {{ change.created_by || '—' }}
                </p>

                <div v-if="change.is_current_value" class="current-label">
                  Current Value
                </div>
              </div>
            </template>

            <!-- Flat change item (no nested array) -->
            <div
              v-else
              class="history-block mb-3 p-3"
              :class="item.is_current_value ? 'current-block' : 'previous-block'"
            >
              <p v-if="item.line_text" class="mb-1 text-muted">
                {{ item.line_text }}
              </p>

              <p v-if="hasField(item, 'value')" class="mb-1">
                <strong>Value:</strong>
                {{ item.value || '—' }}
              </p>

              <p v-if="hasField(item, 'old_value')" class="mb-1">
                <strong>Old Value:</strong>
                {{ item.old_value || '—' }}
              </p>

              <p v-if="hasField(item, 'new_value')" class="mb-1">
                <strong>New Value:</strong>
                {{ item.new_value || '—' }}
              </p>

              <p v-if="hasField(item, 'created_at')" class="mb-1">
                <strong>Created At:</strong>
                {{ formatDate(item.created_at) }}
              </p>

              <p v-if="hasField(item, 'created_by')" class="mb-0">
                <strong>Created By:</strong>
                {{ item.created_by || '—' }}
              </p>

              <div v-if="item.is_current_value" class="current-label">
                Current Value
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  list: {
    type: Array,
    default: () => []
  }
})

defineEmits(['close-click'])

const openSections = ref({})

function toggle(key) {
  openSections.value[key] = !openSections.value[key]
}

function isOpen(key) {
  return !!openSections.value[key]
}

function getItemKey(item, index) {
  return item?.key ?? item?.field_no ?? item?.id ?? index
}

function getItemLabel(item, index) {
  return (
    item?.label ||
    item?.field_no ||
    item?.title ||
    item?.line_text ||
    item?.name ||
    `Change ${index + 1}`
  )
}

function getChangeEntries(item) {
  const nested = item?.changes || item?.items || item?.data
  return Array.isArray(nested) ? nested : []
}

function hasField(obj, field) {
  return obj != null && Object.prototype.hasOwnProperty.call(obj, field)
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString()
}
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
