<template>
  <div class="w-100 p-2">
    <div class="button-options">
      <button class="btn btn-primary m-2 border-0" @click="goToHome">
        <font-awesome-icon class="icon" icon="arrow-left" /> Dashboard
      </button>
      <button class="btn btn-primary m-2 border-0" @click="goToPreview">
        <font-awesome-icon class="icon" icon="eye" /> Pdf Preview
      </button>
      <button class="btn btn-secondary m-2 border-0" disabled>
        <font-awesome-icon class="icon" icon="download" /> Input File
      </button>
      <button class="btn btn-secondary m-2 border-0" @click="openUpload" disabled>
        <font-awesome-icon class="icon" icon="upload" /> Upload More Files
      </button>
    </div>

    <div class="max-dimensions" style="padding: 10px 30px 10px 30px; height: 80vh; overflow: scroll;">
      <div class="editor-header">
        <h3>{{ props.fundName }} </h3>
      </div>

      <div :key="props.fundName">
        <div v-for="(fields, fieldIndex) in data" :key="fieldIndex">
          <!-- Edit buttons -->
          <div class="d-flex justify-content-end align-items-center">
            <div>
              <button
                v-if="editingFieldNo !== fields.field_no"
                class="btn btn-sm me-2"
                @click="startEditing(fields.field_no)"
              >
                <font-awesome-icon class="icon" icon="pen" />
              </button>
              <button
                v-if="editingFieldNo === fields.field_no"
                class="btn btn-sm btn-success me-2"
                @click="saveEdits(fields.field_no, fields.value, fieldIndex)"
                :disabled="making_api_call"
              >
                <font-awesome-icon class="icon" icon="floppy-disk" />
              </button>
              <button
                v-if="editingFieldNo === fields.field_no" 
                class="btn btn-sm btn-warning me-2"
                @click="restoreEdits(fields.field_no)"
                :disabled="making_api_call"
              >
                <font-awesome-icon class="icon" icon="rotate-left" />
              </button>
              <button
                v-if="editingFieldNo === fields.field_no"
                class="btn btn-sm btn-danger"
                @click="cancelEditing"
                :disabled="making_api_call"
              >
               <font-awesome-icon class="icon" icon="xmark" />
              </button>
            </div>
          </div>

          <!-- Top-level field -->
          <div class="d-flex justify-content-between align-items-center">
            <p :style="{ marginLeft: getIndent(fields.field_no) + 'px' }" style="width: 100%;">
              <span class="line-value">
                <InputItemComponent
                  v-if="fields.field_item_type === 'text' || fields.field_item_type === 'NULL'"
                  :itemNumber="getDisplayFieldNo(fields.field_no)"
                  :itemText="fields.field_text"
                  :itemValue="editedData[fields.field_no]?.field_item_value?.[0]?.value ?? fields.value"
                  :disabled="editingFieldNo !== fields.field_no"
                  :indent="getIndent(fields.field_no)"
                  :inputNeeded="fields.field_item_type !== 'NULL'"
                  @update="val => updateValue(fields.field_no, 0, val, 'field_item_value')"
                />
                <BooleanItemComponent
                  v-else-if="fields.field_item_type === 'bool'"
                  :itemNumber="getDisplayFieldNo(fields.field_no)"
                  :itemText="fields.field_text"
                  :itemValue="editedData[fields.field_no]?.value?.[0]?.value ?? fields.value"
                  :disabled="editingFieldNo !== fields.field_no"
                  :indent="getIndent(fields.field_no)"
                  @update="val => updateValue(fields.field_no, 0, val, 'field_item_value',true)"
                />
                <DropdownItemComponent
                  v-else-if="fields.field_item_type === 'dropdown'"
                  :itemNumber="getDisplayFieldNo(fields.field_no)"
                  :itemText="fields.field_text"
                  :itemValue="editedData[fields.field_no]?.value?.[0]?.value ?? fields.value"
                  :options="fields.options"
                  :disabled="editingFieldNo !== fields.field_no"
                  :indent="getIndent(fields.field_no)"
                  @update="val => updateValue(fields.field_no, 0, val, 'field_item_value')"
                />
                <TableItemComponent
                  v-if="fields.has_table_data"
                  :indent="getIndent(fields.field_no)"
                  :itemNumber="getDisplayFieldNo(fields.field_no)"
                  :isDateInput="fields.field_item_type === 'date'"
                  :dateValue="editedData[fields.field_no]?.field_item_value?.[0]?.value ?? fields.value"
                  :itemText="fields.field_text"
                  :itemData="editedData[fields.field_no]?.table_data ?? fields.table_data"
                  :disabled="editingFieldNo !== fields.field_no"
                  @update="table  => updateTableValue(fields.field_no, table)"
                />
              </span>
            </p>
          </div>

          <!-- field_data items -->
          <div class="d-flex justify-content-end">
            <div style="width: 95%;">
              <span
                v-for="(items, itemIndex) in fields.field_data"
                :key="itemIndex"
                :style="{ marginLeft: getIndent(fields.field_no) + 'px' }"
              >
                <InputItemComponent
                  v-if="items.line_item_type === 'text'"
                  :itemNumber="getDisplayFieldNo(items.line_item_no)"
                  :itemText="items.line_text"
                  :itemValue="editedData[fields.field_no]?.value?.[itemIndex]?.value ?? items.value"
                  :disabled="editingFieldNo !== fields.field_no"
                  :indent="getIndent(items.line_item_no)"
                  @update="val => updateValue(fields.field_no, itemIndex, val, 'value')"
                />
                <BooleanItemComponent
                  v-else-if="items.line_item_type === 'bool'"
                  :itemNumber="getDisplayFieldNo(items.line_item_no)"
                  :itemText="items.line_text"
                  :itemValue="editedData[fields.field_no]?.value?.[itemIndex]?.value ?? items.value"
                  :disabled="editingFieldNo !== fields.field_no"
                  :indent="getIndent(items.line_item_no)"
                  @update="val => updateValue(fields.field_no, itemIndex, val, 'value')"
                />
                <DropdownItemComponent
                  v-else-if="items.line_item_type === 'dropdown'"
                  :itemNumber="getDisplayFieldNo(items.line_item_no)"
                  :itemText="items.line_text"
                  :itemValue="editedData[fields.field_no]?.value?.[itemIndex]?.value ?? items.value"
                  :options="items.options"
                  :disabled="editingFieldNo !== fields.field_no"
                  :indent="getIndent(items.line_item_no)"
                  @update="val => updateValue(fields.field_no, itemIndex, val, 'value')"
                />
                <TableItemComponent
                  v-else-if="items.line_item_type === 'table'"
                  :indent="getIndent(items.line_item_no)"
                  :itemNumber="getDisplayFieldNo(items.line_item_no)"
                  :itemText="items.line_text"
                  :itemData="editedData[fields.field_no]?.table_data ?? items.table_data"
                  :disabled="editingFieldNo !== fields.field_no"
                  @update="val => updateValue(fields.field_no, val.rowIndex, val.newRow, 'table_data')"
                />
                <DateItemComponent
                  v-else-if="items.line_item_type === 'date'"
                  :item-number="getDisplayFieldNo(items.line_item_no)"
                  :itemText="items.line_text"
                  :item-value="items.value"
                  :disabled="false"
                  :indent="getIndent(items.line_item_no)"
                  @update="val => selectedDate = val"
                />
              </span>
            </div>
          </div>

          <hr class="question-separator" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import InputItemComponent from './subcomponent/InputItemComponent.vue'
import BooleanItemComponent from './subcomponent/BooleanItemComponent.vue'
import DropdownItemComponent from './subcomponent/DropdownItemComponent.vue'
import TableItemComponent from './subcomponent/TableItemComponent.vue'
import DateItemComponent from './subcomponent/DateItemComponent.vue'
import { useEditableStore } from '@/stores/responseStore'
import api_call_methods from '@/assets/api_calls/api_calls'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const router = useRouter()
const toast = useToast()
const userStore = useUserStore()
const user_id = userStore.userID

const props = defineProps({
  fundName: { type: String, required: true },
  filingId: { type: String, required: true }
})

const emit = defineEmits(['open-upload'])
const responseStore = useEditableStore()
const editedData = reactive({})
const data = ref(responseStore.getFundData(props.fundName))
const editingFieldNo = ref(null)

watch(() => props.fundName, (newVal) => {
  data.value = responseStore.getFundData(newVal)
  for (const key in editedData) delete editedData[key]
  editingFieldNo.value = null
})

function updateTableValue(fieldNo, tableData) {
  if (!editedData[fieldNo]) return
  // Replace the table_data completely
  editedData[fieldNo].table_data = tableData
  editedData[fieldNo].has_table_data=true
  console.log(editedData[fieldNo])
}
// Updated startEditing
function startEditing(fieldNo) {
  editingFieldNo.value = fieldNo
  const field = data.value.find(f => f.field_no === fieldNo)
  if (!field) return

  editedData[fieldNo] = { value: [], table_data: [], field_item_value: [],has_table_data:false,field_item_type:''}

  if (Array.isArray(field.field_data) && field.field_data.length) {
    editedData[fieldNo].value = field.field_data.map(i => ({ ...i, value: i.value ?? '' }))
  }
  if (field.value !== undefined) {
    editedData[fieldNo].field_item_value = [{ value: field.value }]
  }
  if (Array.isArray(field.table_data) && field.table_data.length) {
    editedData[fieldNo].table_data = JSON.parse(JSON.stringify(field.table_data))
  }
}

// Updated updateValue
function updateValue(fieldNo, itemIndex, newVal, type = 'value',isbool=false) {
  console.log(newVal)
  if (!editedData[fieldNo]) return
  switch (type) {
    case 'value':
      
      if (editedData[fieldNo].value[itemIndex]) editedData[fieldNo].value[itemIndex].value = newVal
      break
    case 'table_data':
      if (editedData[fieldNo].table_data[itemIndex]) {
        editedData[fieldNo].table_data[itemIndex] = { ...editedData[fieldNo].table_data[itemIndex], ...newVal }
      }
      break
    case 'field_item_value':
      console.log("sajsahsjas",fieldNo, itemIndex, newVal, type)
      editedData[fieldNo].field_item_value[0] = { value: newVal }
      if(isbool){
        editedData[fieldNo].field_item_type='bool'
      }
      
      break
  }
}

const making_api_call = ref(false)
async function saveEdits(fieldNo, value, fieldIndex) {
  try {
    making_api_call.value = true;
    toast.info(`Saving Question ${fieldNo}`);

    const fund_id = responseStore.getFundId(props.fundName);

    // Update store with edited data
    // responseStore.updateItem(
    //   props.fundName,
    //   fieldNo,
    //   editedData[fieldNo], // pass the whole object with items, table_data, field_item_value
    //   fieldIndex
    // );

    // Prepare API payload
    console.log(editedData)
    const acceptApiData = {
      field_no: fieldNo,
      value: `${ editedData[fieldNo].field_item_value?.[0]?.value ?? value}`, // single-value field
      field_data: editedData[fieldNo].value ?? [],  // field_data array
      table_data: editedData[fieldNo].table_data ?? [], // table rows
      confirmed: true,
      editing: false,
      has_table_data:editedData[fieldNo].has_table_data,
      field_item_type:editedData[fieldNo].field_item_type
    };

    // Call API
    await api_call_methods.accept_data(user_id, acceptApiData, fund_id, props.filingId);

    // Reset editing
    editingFieldNo.value = null;
    delete editedData[fieldNo];

    toast.success(`Saved Question ${fieldNo}`);
    location.reload()
  } catch (error) {
    console.log(error);
    toast.error(`Failed to save question ${fieldNo}`);
  } finally {
    making_api_call.value = false;
  }
}

async function restoreEdits(fieldNo) {
  try {
    making_api_call.value = true
    toast.info(`Reverting Question ${fieldNo}`)
    const fund_id = responseStore.getFundId(props.fundName)
    const revertApiData = { 
      field_no: fieldNo,
      value: `${ editedData[fieldNo].field_item_value?.[0]?.value ?? value}`, // single-value field
      field_data: editedData[fieldNo].value ?? [],  // field_data array
      table_data: editedData[fieldNo].table_data ?? [], // table rows
      confirmed: true,
      editing: false,
      has_table_data:editedData[fieldNo].has_table_data,
      field_item_type:editedData[fieldNo].field_item_type
    }
    await api_call_methods.revert_data(user_id, revertApiData, fund_id, props.filingId)
    // location.reload()
  } catch (err) {
    console.log(err)
    toast.error(`Failed to revert question ${fieldNo}`)
  } finally {
    making_api_call.value = false
  }
}

function cancelEditing() {
  editingFieldNo.value = null
}

function openUpload() {
  emit('open-upload')
}

function getDisplayFieldNo(fieldNo) {
  const parts = fieldNo.split('_')
  return parts[parts.length - 1]
}

function getIndent(fieldNo) {
  return (fieldNo.match(/_/g) || []).length * 5
}

function goToPreview() {
  router.push({ name: 'preview', query: { filing_id: props.filingId } })
}

function goToHome() {
  window.location = '/home'
}
</script>

<style scoped>
.question-separator {
  border: none;
  border-top: 1px solid #ddd;
  margin: 10px 0;
}
</style>
