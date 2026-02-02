<template>
  <div class="modal-backdrop">
    <div class="modal-card">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5>
          Computations – Question {{ field.field_no }}
        </h5>
        <button class="btn btn-sm btn-danger" @click="$emit('close-click')">
          ✕
        </button>
      </div>

      <!-- Question text -->
      <div class="mb-3">
        <strong>Question</strong>
        <p class="mb-0">{{ field.field_text }}</p>
      </div>

      <!-- Top-level value -->
      <div class="mb-3">
        <strong>Formula</strong>
        <pre class="bg-light p-2">{{ field.formula }}</pre>
      </div>

      <!-- Sub field data -->
   <div v-if="Array.isArray(field.field_data) && field.field_data.length" class="mb-3">
        <strong>Sub Questions</strong>

        <div class="mt-2">
            <div
            v-for="(item, index) in field.field_data"
            :key="index"
            class="d-flex justify-content-between align-items-start border-bottom py-1"
            >
            <div class="me-3">
                <small class="text-muted">
                {{ getDisplayLineNo(item.line_item_no) }}) 
                </small>
                <span  class="fw-medium">
                {{ item.line_text }}
                </span>
                
            </div>

            <div class="fw-semibold text-end">
                {{ item.computation_formula ?? '—' }}

              </div>
            </div>
        </div>
        </div>


      <!-- Table data -->
      <div
        v-if="Array.isArray(field.table_data) && field.table_data.length"
        class="mb-3"
        >
            <strong>Table Data</strong>

            <div class="table-responsive mt-2">
                <table class="table table-sm table-bordered">
                <thead>
                    <tr>
                    <th
                        v-for="col in getTableColumns(field.table_data)"
                        :key="col"
                        
                    >
                        {{ formatColumn(col) }}
                    </th>
                    </tr>
                </thead>

                <tbody>
                    <tr
                    v-for="(row, rowIndex) in field.table_data"
                    :key="rowIndex"
                    >

                    <td
                        v-for="col in getTableColumns(field.table_data)"
                        :key="col"
                        class="text-end"
                    >
                        {{ row[col] || '—' }}
                    </td>
                    </tr>
                </tbody>
                </table>
            </div>
            </div>

    </div>
  </div>
</template>

<script setup>
defineProps({
  field: {
    type: Object,
    required: true
  },

})

function getDisplayLineNo(lineItemNo) {
  if (!lineItemNo) return ''
  const parts = lineItemNo.split('_')
  return parts[parts.length - 1]
}
function getTableColumns(tableData) {
  if (!Array.isArray(tableData) || !tableData.length) return []

  return Object.keys(tableData[0]).filter(
    col => col !== 's.text' && col !== 's.computationType' 
  )
}

function formatColumn(col) {
  return col
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
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
  width: 650px;
  max-height: 80vh;
  overflow: auto;
  padding: 20px;
  border-radius: 8px;
}
</style>
