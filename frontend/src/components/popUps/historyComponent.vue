<template>
  <div class="modal-backdrop">
    <div class="modal-card">

      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5>
          Changes history – Question: {{ fieldNo }}
        </h5>

        <button
          class="btn btn-sm btn-danger"
          @click="$emit('close-click')"
        >
          ✕
        </button>
      </div>

      <!-- Subfields -->
       <!-- No Records -->
      <div v-if="!fieldData || Object.keys(fieldData).length === 0" class="text-center py-4">
        <p class="mb-0 text-muted">No records found.</p>
      </div>
      <div v-else>
        <div
          v-for="(subFieldData, subFieldKey) in fieldData"
          :key="subFieldKey"
          class="mb-4"
        >

          <!-- Collapsible Header -->
          
          <div
            class="subfield-header"
            @click="toggle(subFieldKey)"
          >
            <strong class=".text-uppercase">{{getDisplayFieldNo(subFieldKey) }} <span>{{ subFieldData[0].line_text }}</span></strong>
            
            <span>{{ isOpen(subFieldKey) ? '−' : '+' }}</span>
          </div>

          <!-- Collapsible Content -->
          <div v-if="isOpen(subFieldKey)" class="mt-3">

            <div
              v-for="(item, index) in getSorted(subFieldData)"
              :key="index"
              class="history-block mb-3 p-3"
              :class="item.is_current_value ? 'current-block' : 'previous-block'"
            >
              <p class="mb-1">
                <strong>Value:</strong>
                {{ item.value || '—' }}
              </p>

              <p class="mb-1">
                <strong>Created At:</strong>
                {{ formatDate( item.created_at) }}
              </p>

              <p class="mb-0">
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

const props = defineProps({
  fieldNo: {
    type: String,
    required: true
  },
  fieldData: {
    type: Object,
    required: true
  },
  fieldType:{
    type: Object,
    required: true
  },
})

const openSections = ref({})

function toggle(key) {
  openSections.value[key] = !openSections.value[key]
}

function isOpen(key) {
  return openSections.value[key]
}

function getSorted(data) {
  if (!Array.isArray(data)) return []

  return [...data].sort((a, b) => {
    return Number(b.is_current_value) - Number(a.is_current_value)
  })
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString()
}

function getDisplayFieldNo(fieldNo) {
  if(props.fieldType=='table'){
    console.log(fieldNo)
      const parts = fieldNo.split('_')

  // TYPE 1 → 17_(g)_Net_of_...
  if (parts[1]?.startsWith('(')) {
    const letterPart = parts[1].replace('(', '') 
    const remaining = parts.slice(2).join(' ')

    return `${letterPart} ${remaining.replaceAll('_', ' ')}`
  }

  // TYPE 2 → 14_assets_costbased
  if (parts.length === 3) {
    const label = parts[1]
    const type = parts[2]

    const capitalizedLabel =
      label.charAt(0).toUpperCase() + label.slice(1)

    return `${type} ${capitalizedLabel}`
  }

  }
  const parts = fieldNo.split('_')
  if(parts.length==3){
    return parts[1]+': '+parts[2] +")"
  }
  return parts[parts.length - 1]+')'
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