<template>
  <div class="w-100 p-2" style="height: 90vh;">
    <div class="button-options">
      <button class="btn btn-primary m-2 border-0" @click="goToHome">
        <font-awesome-icon class="icon" icon="arrow-left" /> Dashboard
      </button>
      <button class="btn btn-primary m-2 border-0" @click="goToPreview">
        <font-awesome-icon class="icon" icon="eye" /> Pdf Preview
      </button>
      <button class="btn btn-primary m-2 border-0" @click="downloadInput" :disabled="downloadInputFiles">
        <span v-if="downloadInputFiles" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        <span v-if="!downloadInputFiles"><font-awesome-icon class="icon" icon="download" /> Input Files</span>
        <span v-else>Downloading Input Files...</span>
      </button>
      <button class="btn btn-primary m-2 border-0" @click="openUpload" >
        <font-awesome-icon class="icon" icon="upload" /> Upload More Files
      </button>
    </div>

    <div class="max-dimensions" style="padding: 10px 30px 10px 30px; height: 80vh; overflow: scroll;">
      <div class="d-flex w-100 mb-4" style="border: 1px solid;">
            <div style="border: 1px solid;" class="w-50 p-2">
              <h4>{{ props.fundName }}</h4>
            </div>
            <div style="border: 1px solid;" class="w-50 p-2">
              <h4>Information about the private funds you advise</h4>
            </div>
          </div>

      <div :key="props.fundName">
        <div v-for="(fields, fieldIndex) in data" :key="fieldIndex">
          <div v-if="getDisplayFieldNo(fields.field_no) === '5'">
            <h4 class=" mb-3 mt-4">Item A. Reporting fund identifying information</h4>
          </div>

          <!-- Add heading before question 8 (i.e., after 7) -->
          <div v-if="getDisplayFieldNo(fields.field_no) === '8'">
            <h4 class=" mb-3 mt-4">Item B. Assets, financing and investor concentration</h4>
          </div>
          <!-- Add heading before question 18 (i.e., after 17) -->
          <div v-if="getDisplayFieldNo(fields.field_no) === '18'">
            <h4 class=" mb-3 mt-4">Item C. Information about the hedge funds you advise</h4>
          </div>

          <b><hr /></b>
          <!-- Edit buttons -->
          <div class="d-flex justify-content-end align-items-center">
            
            <div>
              <button
                class="btn btn-sm me-2"
                @click="openHistory(fields.field_no,fields.field_item_type)"
              >
                <font-awesome-icon class="icon" icon="clock-rotate-left" />
              </button>
              <button 
              class="btn btn-sm  me-2"
              @click="openCompLogs(fields.field_no,fields.field_text)"
              >
                <font-awesome-icon class="icon" icon="calculator" />
              </button>
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
                @click="cancelEditing(fields.field_no,fields.value, fieldIndex)"
                :disabled="making_api_call"
              >
               <font-awesome-icon class="icon" icon="xmark"/>
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
                  :displayAffix="fields.display_affix"
                  @update="val => updateValue(fields.field_no, 0, val, 'field_item_value')"
                />
                <BooleanItemComponent
                  v-else-if="fields.field_item_type === 'bool'"
                  :itemNumber="getDisplayFieldNo(fields.field_no)"
                  :itemText="fields.field_text"
                  :key="getFieldKey(fields.field_no)"
                  :itemValue="editedData[fields.field_no]?.value?.[0]?.value ?? fields.value"
                  :disabled="editingFieldNo !== fields.field_no"
                  :indent="getIndent(fields.field_no)"
                  @update="val => updateValue(fields.field_no, 0, val, 'field_item_value')"
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
                  :metadata="fields.table_metadata"
                  @update="table  => updateTableValue(fields.field_no, table)"
                />
                <McqItemComponent
                  v-else-if="fields.field_item_type === 'mcq'"
                  :itemNumber="getDisplayFieldNo(fields.field_no)"
                  :itemText="fields.field_text"
                  :key="getFieldKey(fields.field_no)"
                  :itemValue="editedData[fields.field_no]?.value?.[0]?.value ?? fields.value"
                  :disabled="editingFieldNo !== fields.field_no"
                  :indent="getIndent(fields.field_no)"
                  :options="fields.options"
                  @update="val => updateValue(fields.field_no, 0, val, 'field_item_value')"
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
                  v-if="items.line_item_type === 'text' || items.line_item_type === 'NULL'"
                  :itemNumber="getDisplayFieldNo(items.line_item_no)"
                  :itemText="items.line_text"
                  :itemValue="editedData[fields.field_no]?.value?.[itemIndex]?.value ?? items.value"
                  :disabled="editingFieldNo !== fields.field_no"
                  :indent="getIndent(items.line_item_no)"
                  :inputNeeded=" items.line_item_type !== 'NULL'"
                  :displayAffix="items.display_affix"
                  @update="val => updateValue(fields.field_no, itemIndex, val, 'value')"
                />
                <BooleanItemComponent
                  v-else-if="items.line_item_type === 'bool'"
                  :itemNumber="getDisplayFieldNo(items.line_item_no)"
                  :itemText="items.line_text"
                  :key="getFieldKey(fields.field_no)"
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
          <div class="d-flex justify-content-end">
            <div style="width: 100%;">
              <span>
                <p class="fw-light">{{ fields.disclaimer_text }} </p>
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
import utils from '@/assets/utils/utils'
import McqItemComponent from './subcomponent/McqItemComponent.vue'

const router = useRouter()
const toast = useToast()
const userStore = useUserStore()
const user_id = userStore.userID

const props = defineProps({
  fundName: { type: String, required: true },
  filingId: { type: String, required: true }
}) 

const emit = defineEmits(['open-upload','refresh-data','open-computationLogs','open-history'])
const responseStore = useEditableStore()
const editedData = reactive({})
const fundname=ref(props.fundName)
const data = ref(responseStore.getFundData(fundname.value))
const computationLogs=ref(responseStore.getFundComputation(fundname.value))
const editingFieldNo = ref(null)

watch(() => props.fundName, (newVal) => {
  fundname.value=newVal
  
  data.value = responseStore.getFundData(newVal)
  computationLogs.value=responseStore.getFundComputation(newVal)
  for (const key in editedData) delete editedData[key]
  editingFieldNo.value = null
})

function updateTableValue(fieldNo, tableData) {
  if (!editedData[fieldNo]) return
  // Replace the table_data completely
  editedData[fieldNo].table_data = tableData
  // editedData[fieldNo].has_table_data=true
  editedData[fieldNo].changed=true

}

// safe guard for re render
const keyVersions = ref({})

function getFieldKey(fieldNo) {
  return `${fieldNo}-${keyVersions.value[fieldNo] || 0}`
}


// Updated startEditing
function startEditing(fieldNo) {
 if (editingFieldNo.value && editingFieldNo.value !== fieldNo) {
    const currentField = editedData[editingFieldNo.value]

    // Check if there are unsaved changes
    if (currentField?.changed) {
      const oldFieldNo = editingFieldNo.value
      const oldFieldValue = editedData[oldFieldNo]?.field_item_value?.[0]?.value ?? ''
      const oldFieldIndex = data.value.findIndex(f => f.field_no === oldFieldNo)

      // Show unsaved changes toast
      const toastInstance = toast.open({
        message: `
          <div style="display:flex; flex-direction:column; gap:6px;">
            <strong>Unsaved Changes</strong>
            <div>You have unsaved edits in Question ${oldFieldNo}.</div>
            <div style="margin-top:8px; display:flex; gap:8px;">
              <button id="saveOldBtn" class="btn btn-success btn-sm">Save</button>
              <button id="discardOldBtn" class="btn btn-danger btn-sm">Discard</button>
            </div>
          </div>
        `,
        type: 'warning',
        duration: 0,
        dismissible: true,
      })

      setTimeout(() => {
        const saveOldBtn = document.getElementById('saveOldBtn')
        const discardOldBtn = document.getElementById('discardOldBtn')

        if (saveOldBtn) {
          saveOldBtn.addEventListener('click', async () => {
            await saveEdits(oldFieldNo, oldFieldValue, oldFieldIndex)
            toastInstance.dismiss()
            startEditing(fieldNo) // retry edit after saving
          })
        }

        if (discardOldBtn) {
          discardOldBtn.addEventListener('click', () => {
            delete editedData[oldFieldNo]
            keyVersions.value[oldFieldNo] = (keyVersions.value[oldFieldNo] || 0) + 1 //key change for re render
            editingFieldNo.value = null
            toastInstance.dismiss()
            startEditing(fieldNo) // retry edit after discarding
          })
        }
      }, 50)

      return // stop here until user decides
    }

    // no unsaved changes — discard and continue
    delete editedData[editingFieldNo.value]
    editingFieldNo.value = null
  }



  // fresh edit
  editingFieldNo.value = fieldNo
  const field = data.value.find(f => f.field_no === fieldNo)
  if (!field) return

  editedData[fieldNo] = { value: [], table_data: [], field_item_value: [],has_table_data:field.has_table_data,field_item_type: field.field_item_type,changed: false}

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
function updateValue(fieldNo, itemIndex, newVal, type = 'value') {
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
      editedData[fieldNo].field_item_value[0] = { value: newVal }
      break
  }
  editedData[fieldNo].changed=true
}



const making_api_call = ref(false)

async function saveEdits(fieldNo, value, fieldIndex) {
  try {



    making_api_call.value = true;
    toast.info(`Saving Question ${fieldNo}`);

    const fund_id = responseStore.getFundId(fundname.value);

    // Update store with edited data
    // responseStore.updateItem(
    //   props.fundName,
    //   fieldNo,
    //   editedData[fieldNo], // pass the whole object with items, table_data, field_item_value
    //   fieldIndex
    // );

    // Prepare API payload
    
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
    await api_call_methods.accept_data(user_id, acceptApiData, fund_id, props.filingId)

    // Trigger parent refresh and wait until it's done
    await new Promise(resolve => {
      emit('refresh-data', resolve)
    })


    

    data.value = responseStore.getFundData(fundname.value)
    
    editingFieldNo.value = null
    delete editedData[fieldNo]
    toast.success(`Saved Question ${fieldNo}`)
  } catch(error){
    console.log(error)
    toast.error(`Failed to save question ${fieldNo}`);
  } finally {
    making_api_call.value = false;
  }
}

async function restoreEdits(fieldNo) {
  try {
    making_api_call.value = true
    toast.info(`Reverting Question ${fieldNo}`)
    const fund_id = responseStore.getFundId(fundname.value)
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
    await new Promise(resolve => {
      emit('refresh-data', resolve)
    })


    //data update
    data.value = responseStore.getFundData(fundname.value)
    editingFieldNo.value = null
    delete editedData[fieldNo]
    toast.success(`Reverted Question ${fieldNo}`)

  } catch (err) {
    console.log(err)
    toast.error(`Failed to revert question ${fieldNo}`)
  } finally {
    making_api_call.value = false
  }
}

const showUnsavedToast = ref(false)
const pendingFieldNo = ref(null)

function cancelEditing(fieldNo,value,fieldIndex) {
  const field = editedData[fieldNo]
  if (field?.changed) {
    // OR even better, handle logic below:
    toast.open({
      message: `
        <div style="display:flex; flex-direction:column; gap:6px;">
          <strong>Unsaved Changes</strong>
          <div>You have unsaved edits for this field.</div>
          <div style="margin-top:8px; display:flex; gap:8px;">
            <button id="saveBtn" class="btn btn-success btn-sm">Save</button>
            <button id="discardBtn" class="btn btn-danger btn-sm">Discard</button>
          </div>
        </div>
      `,
      type: 'warning',
      duration: 0,
      dismissible: true,
    })
    setTimeout(() => {
      const saveBtn = document.getElementById('saveBtn')
      const discardBtn = document.getElementById('discardBtn')

      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          saveEdits(fieldNo, value, fieldIndex)
          toastInstance.dismiss() 
        })
      }
      if (discardBtn) {
        discardBtn.addEventListener('click', () => {
          delete editedData[fieldNo]
          keyVersions.value[fieldNo] = (keyVersions.value[fieldNo] || 0) + 1
          editingFieldNo.value = null
          toastInstance.dismiss() 
        })
      }
    }, 50)


    return
  }

  // no changes — safe to cancel
  delete editedData[fieldNo]
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

const downloadInputFiles=ref(false)
async function downloadInput(){
  try{
      downloadInputFiles.value=true
      toast.info("Downloading Input files....")
      const filing_name=localStorage.getItem('filingName')
      const response=await api_call_methods.download_input(user_id,filing_name)
      utils.downloadInputZip(response, filing_name)
      toast.success("Input files downloaded successfully")
    }
  catch{
    toast.error("Failed to download input files")
  }
  finally{
    downloadInputFiles.value=false
  }
}

async function openHistory(field_no,fieldType){
  const fund_id = responseStore.getFundId(fundname.value)
  emit('open-history',field_no,fund_id,fieldType)
}
function openCompLogs(field_no,field_text){
  const field = computationLogs.value.find(
    item => item.field_no === field_no
  )

  if (!field) {
    console.warn(`No computation found for field_no ${field_no}`)
    return
  }

  const data = {
    field_no: field.field_no,
    field_text: field_text,
    formula:field.computation_formula,
    type:field.computation_type,
    field_data: field.field_data,
    table_data: field.table_data,
    field_item_type: field.field_item_type,
    has_table_data: field.has_table_data
  }
  emit('open-computationLogs', data)
}

</script>

<style scoped>
.question-separator {
  border: none;
  border-top: 1px solid #ddd;
  margin: 10px 0;
}
</style>
