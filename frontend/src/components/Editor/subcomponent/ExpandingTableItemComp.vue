<template>
  <div
    class="d-flex flex-column"
    :style="{ paddingLeft: indent + 'px' }"
  >
    <p class="table-title">
      <span>{{ props.itemNumber }}</span>)
      <span
        v-if="props.itemNumber === '14'"
        class="formatted-text"
      >
        {{ defaultText }}
      </span>
      <span v-else>
        {{ props.itemText }}
      </span>
      :
    </p>

    <div class="table-wrapper">
      <table class="custom-table">
        <thead>
          <tr>
            <th
              v-for="(header, index) in headers"
              :key="index"
            >
              {{ header }}
            </th>

            <th
              v-if="!disabled"
              class="action-column"
            >
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(row, rowIndex) in rows"
            :key="rowIndex"
          >
            <td
              v-for="(header, colIndex) in headers"
              :key="colIndex"
            >
              <textarea
                class="table-input"
                v-model="rows[rowIndex][colIndex]"
                :disabled="disabled"
                @input="autoResize($event); updateValue()"
                @focus="autoResize($event)"
                :ref="el => setTextareaRef(el, rowIndex, colIndex)"
              ></textarea>
            </td>

            <td
              v-if="!disabled"
              class="action-cell"
            >
              <button
                class="btn btn-sm btn-outline-danger remove-btn"
                @click="removeRow(rowIndex)"
              >
                <font-awesome-icon icon="xmark" />
              </button>
            </td>
          </tr>

          <tr
            v-if="rows.length === 0 && disabled"
          >
            <td
              :colspan="headers.length"
              class="empty-state"
            >
              No data available
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <button
      v-if="!disabled"
      class="btn btn-primary add-row-btn"
      @click="addRow"
    >
      ➕ Add Row
    </button>
  </div>
</template>

<script setup>
import {
  ref,
  watch,
  nextTick
} from 'vue'

const props = defineProps({
  itemNumber: {
    type: String,
    required: true
  },
  itemText: {
    type: String,
    default: ''
  },
  itemValue: {
    type: String,
    default: ''
  },
  headers: {
    type: Array,
    required: true
  },
  metadata: {
    type: Object,
    required: true
  },
  disabled: {
    type: Boolean,
    required: true
  },
  indent: {
    type: Number,
    default: 0
  }
})

const resizeAll = () => {
  Object.values(
    textareaRefs.value
  ).forEach(el =>
    autoResizeElement(el)
  )
}
const emit = defineEmits(['update'])

const rows = ref([])
const textareaRefs = ref({})

const initRows = () => {
  try {
    rows.value = props.itemValue
      ? JSON.parse(props.itemValue)
      : []
  } catch {
    rows.value = []
  }

  nextTick(resizeAll)
}

initRows()

watch(
  () => props.itemValue,
  () => initRows()
)

const addRow = () => {
  const columnCount = props.headers.length
  rows.value.push(
    Array(columnCount).fill('')
  )

  updateValue()

  nextTick(resizeAll)
}

const removeRow = index => {
  rows.value.splice(index, 1)
  updateValue()
}

const updateValue = () => {
  emit(
    'update',
    JSON.stringify(rows.value)
  )
}

const setTextareaRef = (
  el,
  row,
  col
) => {
  if (!el) return

  const key = `${row}-${col}`
  textareaRefs.value[key] = el

  nextTick(() =>
    autoResizeElement(el)
  )
}

const autoResize = event => {
  autoResizeElement(event.target)
}

const autoResizeElement = el => {
  if (!el) return

  el.style.height = 'auto'
  el.style.height =
    el.scrollHeight + 'px'
}


</script>
<style scoped>
.table-title {
  margin-bottom: 8px;
  font-weight: 500;
}

/* Wrapper */

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

/* Table */

.custom-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  margin-bottom: 0;
}

/* Header */

.custom-table th {
  background: #f3f4f6;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  padding: 10px;
  border: 1px solid #d1d5db;
  text-align: left;
  vertical-align: middle;
}

/* Cells */

.custom-table td {
  padding: 4px;
  border: 1px solid #d1d5db;
  vertical-align: top;
}

/* Textarea */

.table-input {
  width: 100%;
  min-height: 36px;
  max-height: 220px;
  overflow-y: auto;
  resize: none;
  border: none;
  outline: none;
  padding: 8px;
  line-height: 1.5;
  font-size: 14px;
  background: transparent;
  box-sizing: border-box;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Focus */

.table-input:focus {
  background: #f9fafb;
}

/* Disabled */

.table-input:disabled {
  background: #f8f9fa;
  color: #374151;
  cursor: default;
}

/* Action column */

.action-column {
  width: 60px;
  text-align: center;
}

.action-cell {
  text-align: center;
  vertical-align: middle;
}

/* Buttons */

.remove-btn {
  padding: 4px 8px;
}

.add-row-btn {
  margin-top: 10px;
}

/* Empty state */

.empty-state {
  padding: 12px;
  text-align: center;
  color: #6b7280;
}

/* Row hover */

.custom-table tbody tr:hover {
  background: #fafafa;
}
</style>