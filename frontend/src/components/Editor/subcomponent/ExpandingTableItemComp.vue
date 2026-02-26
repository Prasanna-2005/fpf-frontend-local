<template>
  <div class="d-flex flex-column" :style="{ paddingLeft: indent + 'px' }">
    <p>
      <span>{{ props.itemNumber }}</span>)
      <span v-if="props.itemNumber === '14'" class="formatted-text">{{ defaultText }}</span>
      <span v-else>{{ props.itemText }}</span>:
    </p>
    <div>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th v-for="(header, index) in headers" :key="index">
            {{ header }}
          </th>
          <th v-if="!disabled" style="width: 60px;"></th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
          <td v-for="(header, colIndex) in headers" :key="colIndex">
            
            
            <input
              type="text"
              style="width: 100% ;"
              v-model="rows[rowIndex][colIndex]"
              :disabled="disabled"
              @input="updateValue"
            />

          </td>

          <td v-if="!disabled">
            <button
              class="btn btn-sm btn-danger"
              @click="removeRow(rowIndex)"
            >
            <font-awesome-icon class="icon" icon="xmark" />
            </button>
          </td>
        </tr>

        
        <tr v-if="rows.length === 0 && disabled">
          <td :colspan="headers.length" class="text-center">
            No data available
          </td>
        </tr>

      </tbody>
    </table>
    </div>
    <button
      v-if="!disabled"
      class="btn btn-sm btn-primary"
      @click="addRow"
    >
      ➕ Add Row
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  itemNumber: { type: String, required: true },
  itemText: { type: String, default: '' },
  itemValue: { type: String, default: '' },
  headers: { type: Array, required: true },
  metadata: { type: Object, required: true },
  disabled: { type: Boolean, required: true },
  indent: { type: Number, default: 0 }
})

const emit = defineEmits(['update'])

const rows = ref([])

const initRows = () => {
  try {
    rows.value = props.itemValue
      ? JSON.parse(props.itemValue)
      : []
  } catch {
    rows.value = []
  }
}

initRows()

watch(
  () => props.itemValue,
  () => initRows()
)

const addRow = () => {
  const columnCount = props.headers.length
  rows.value.push(Array(columnCount).fill(''))
  updateValue()
}

const removeRow = (index) => {
  rows.value.splice(index, 1)
  updateValue()
}

const updateValue = () => {
  emit('update', JSON.stringify(rows.value))
}
</script>
