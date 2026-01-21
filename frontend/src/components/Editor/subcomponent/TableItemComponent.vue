<template>
  <div class="d-flex flex-column" :style="{ paddingLeft: indent + 'px' }">
    <p>
      <span>{{ props.itemNumber }}</span>)
      <span v-if="props.itemNumber === '14'" class="formatted-text">{{ defaultText }}</span>
      <span v-else>{{ props.itemText }}</span>:
    </p>

    <p v-if="isDateInput">
      <input 
        type="date" 
        v-model="date" 
        style="width: 180px;" 
        :disabled="disabled"
      />
    </p>

    <div class="table-responsive my-2">
      <table class="table table-bordered table-sm thick-border">
        <thead>
          <tr class="thick-border">
            <template v-for="(val, key, colIndex) in localData[0]" :key="colIndex">
              <th
                v-if="key !== 's.name'"
                class="thick-border fixed-col text-center align-middle"
              >
                <b>{{ get_table_header_name(key).toUpperCase() }}</b>
              </th>
            </template>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(row, rowIndex) in localData" :key="rowIndex" class="thick-border">
            <template v-for="(val, key, colIndex) in row" :key="colIndex">
              <td v-if="key !== 's.name'" class="thick-border fixed-col">
                <span v-if="key === 's.text'">{{ getDisplayFieldNo(val) }}</span>
                  <template v-else-if="getFieldType(key) === 'bool'">
                    <input
                      type="checkbox"
                      :checked="isChecked(localData[rowIndex][key])"
                      @change="onCheckbox($event, rowIndex, key)"
                      :disabled="disabled"
                    />
                    <span>
                      {{ isChecked(localData[rowIndex][key]) ? 'Yes' : 'No' }}
                    </span>
                  </template>
                  <template v-else-if="getFieldType(key) === 'date'">
                      <span v-if="!localData[rowIndex][key] && disabled">    
                      </span>

                      <input
                        v-else
                        type="date"
                        :value="formatDateForInput(localData[rowIndex][key])"
                        @change="onDateInput($event, rowIndex, key)"
                        :disabled="disabled"
                        style="width: 100%;"
                      />

                  </template>


                <template v-else>
                    <input
                      type="text"
                      :value="displayValue(localData[rowIndex][key])"
                      @input="onInput($event, rowIndex, key)"
                      :disabled="disabled"
                      style="width: 100%; box-sizing: border-box; padding: 4px;"
                      class="number text-end"
                    />
                  </template>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { defaultText } from '@/assets/text/text'
import { ref, watch, onMounted } from 'vue'
import DateItemComponent from './DateItemComponent.vue'

const props = defineProps({
  itemNumber: { type: String, required: true },
  itemText: { type: String, required: true },
  itemData: { type: Array, required: true },
  disabled: { type: Boolean, required: true },
  indent: { type: Number, default: 0 },
  isDateInput: { type: Boolean, default: false },
  dateValue: { type: String, default: '' },
  metadata:{ type: String, required: true },
})

const date = ref('')
const localData = ref([])
const meta = ref({})
const emit = defineEmits(['update'])


// console.log(props.metadata)

onMounted(() => {
  localData.value = JSON.parse(JSON.stringify(props.itemData))
  date.value = props.dateValue
  meta.value = props.metadata
})

const checked = ref(props.itemValue === 'true')
watch(
  () => props.itemData,
  (newVal) => {
    localData.value = JSON.parse(JSON.stringify(newVal))
  }
)

function getFieldType(key) {
  return meta.value[key] || 'text'
}

function isChecked(val) {
  return val === 'true' 
}

function onCheckbox(event, rowIndex, key) {
  const newVal = event.target.checked
  localData.value[rowIndex][key] = newVal ? 'true' : 'false'
  emit('update', localData.value)
}




function get_table_header_name(header) {
  if (header === 's.name' || header === 's.text') return ''
  return header.replaceAll('_', ' ')
}

function getDisplayFieldNo(fieldNo) {
  if (!fieldNo) return ''
  const parts = fieldNo.split('_')
  const lastPart = parts[parts.length - 1]
  if (!lastPart) return ''
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1)
}


function displayValue(value) {
  if (value === null || value === undefined || value === '') return ''
  if (!props.disabled) return value
  const num = Number(value)
  if (isNaN(num)) return value
  if (Math.abs(num) < 100) return value

  const formatted=num.toLocaleString('en-US', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  })
  return `$ ${formatted}`
}

function onInput(event, rowIndex, key) {
  const val = event.target.value
  localData.value[rowIndex][key] = val
  emit('update', localData.value)
}


function formatDateForInput(value) {
  if (!value || value==='') return ''
  return value.split('T')[0] 
}
function onDateInput(event, rowIndex, key) {
  localData.value[rowIndex][key] = event.target.value 
  emit('update', localData.value)
}

</script>

<style scoped>
.formatted-text {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
