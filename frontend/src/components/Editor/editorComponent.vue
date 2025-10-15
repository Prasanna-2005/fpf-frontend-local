<template>
  <div class="w-100 p-2" style="height: 90vh;">
    <div class="button-options">
      <button class="btn btn-primary m-2 border-0" @click="goToHome">
        <font-awesome-icon class="icon" icon="arrow-left" /> Dashboard
      </button>
      <button class="btn btn-primary m-2 border-0"  @click="goToPreview">
        <font-awesome-icon class="icon" icon="eye" /> Pdf Preview
      </button>
      <button class="btn btn-secondary m-2 border-0" disabled>
        <font-awesome-icon class="icon" icon="download" /> Input File
      </button>
      <!-- <button class="btn btn-primary m-2 border-0">
        <font-awesome-icon class="icon" icon="check-double" /> Save
      </button> -->
      
      <button class="btn btn-secondary m-2 border-0" @click="openUpload" disabled>
        <font-awesome-icon class="icon" icon="upload" /> Upload More Files
      </button>
    </div>

    <div class="max-dimensions" style="padding: 10px 30px 10px 30px; height: 730px; overflow: scroll;">
      <div class="editor-header">
        <h3>{{ props.fundName }} </h3>
      </div>

      <div :key="props.fundName">
        <div v-for="(fields, fieldIndex) in data" :key="fieldIndex">
          <div class="d-flex justify-content-end align-items-center">
            <div>
              <button
                v-if="editingFieldNo !== fields.field_no"
                class="btn btn-sm  me-2"
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
                class="btn btn-sm btn-danger "
                @click="cancelEditing"
                :disabled="making_api_call"
              >
               <font-awesome-icon class="icon" icon="xmark" />
              </button>
              
            </div>
          </div>
          
          <div class="d-flex justify-content-between align-items-center">

            <p :style="{ marginLeft: getIndent(fields.field_no) + 'px' }" style="width: 100%;">
              
              <span >
                <span class="line-value">
                    <InputItemComponent
                    v-if="fields.field_item_type === 'text' || fields.field_item_type === 'NULL'"
                    :itemNumber="getDisplayFieldNo(fields.field_no)"
                    :itemText="fields.field_text"
                    :itemValue="editedData[fields.field_no]?.value ?? fields.value"
                    :disabled="editingFieldNo !== fields.field_no"
                    :indent="getIndent(fields.field_no)"  
                    :inputNeeded="fields.field_item_type !== 'NULL'"
                    @update="val => updateValue(fields.field_no, itemIndex, val)"
                  />
                  <BooleanItemComponent
                    v-else-if="fields.field_item_type === 'bool'"
                    :itemNumber="getDisplayFieldNo(fields.field_no)"
                    :itemText="fields.field_text"
                    :itemValue="editedData[fields.field_no]?.value ?? fields.value"
                    :disabled="editingFieldNo !== fields.field_no"
                    :indent="getIndent(fields.field_no)"  
                    @update="val => updateValue(fields.field_no, itemIndex, val)"
                  />
                  <DropdownItemComponent
                    v-else-if="fields.field_item_type === 'dropdown'"
                    :itemNumber="getDisplayFieldNo(fields.field_no)"
                    :itemText="fields.field_text"
                    :itemValue="editedData[fields.field_no]?.value ?? fields.value"
                    :options="fields.options"
                    :disabled="editingFieldNo !== fields.field_no"
                    :indent="getIndent(fields.field_no)"
                    @update="val => updateValue(fields.field_no, itemIndex, val)"
                  />
                  <TableItemComponent  
                  v-else-if="fields.field_item_type === 'table'" 
                  :indent="getIndent(fields.field_no)" 
                  :itemNumber="getDisplayFieldNo(fields.field_no)" 
                  :itemText="fields.field_text" 
                  :itemData="fields.table_data" 
                  :disabled="editingFieldNo !== fields.field_no"
                  />
                  <!-- <DateItemComponent 
                  v-else-if="fields.field_item_type === 'date'"
                  :itemNumber="getDisplayFieldNo(fields.field_no)"
                  :itemText="fields.field_text"
                  :itemValue="editedData[fields.field_no]?.value?.[0] ?? fields.value[0]"
                  :disabled="editingFieldNo !== fields.field_no"
                  :indent="getIndent(fields.field_no)"  
                  @update="val => updateValue(fields.field_no, itemIndex, val)"
                /> -->
                <TableItemComponent  
                  v-if="fields.has_table_data" 
                  :indent="getIndent(fields.field_no)" 
                  :itemNumber="getDisplayFieldNo(fields.field_no)" 
                  :isDateInput="fields.field_item_type === 'date'"
                  :dateValue="editedData[fields.field_no]?.value ?? fields.value"
                  :itemText="fields.field_text" 
                  :itemData="fields.table_data" 
                  :disabled="editingFieldNo !== fields.field_no"
                  />
                </span>

              </span>
             
            </p>
            
            
          </div>

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
                  :itemValue="editedData[fields.field_no]?.[itemIndex]?.value ?? items.value"
                  :disabled="editingFieldNo !== fields.field_no"
                  :indent="getIndent(items.line_item_no)"  
                  @update="val => updateValue(fields.field_no, itemIndex, val)"
                />
                <BooleanItemComponent
                  v-else-if="items.line_item_type === 'bool'"
                  :itemNumber="getDisplayFieldNo(items.line_item_no)"
                  :itemText="items.line_text"
                  :itemValue="editedData[fields.field_no]?.[itemIndex]?.value?? items.value"
                  :disabled="editingFieldNo !== fields.field_no"
                  :indent="getIndent(items.line_item_no)"
                  @update="val => updateValue(fields.field_no, itemIndex, val)"
                />
                <DropdownItemComponent
                  v-else-if="items.line_item_type === 'dropdown'"
                  :itemNumber="getDisplayFieldNo(items.line_item_no)"
                  :itemText="items.line_text"
                  :itemValue="editedData[fields.field_no]?.[itemIndex]?.value ?? items.value"
                  :options="items.options"
                  :disabled="editingFieldNo !== fields.field_no"
                  :indent="getIndent(items.line_item_no)"
                  @update="val => updateValue(fields.field_no, itemIndex, val)"
                />
                <TableItemComponent  
                v-else-if="items.line_item_type === 'table'" 
                :indent="getIndent(items.line_item_no)" 
                :itemNumber="getDisplayFieldNo(items.line_item_no)" 
                :itemText="items.line_text" 
                :itemData="items.table_data" 
                :disabled="editingFieldNo !== fields.field_no"
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
import { ref, reactive ,watch} from 'vue'
import InputItemComponent from './subcomponent/InputItemComponent.vue'
import BooleanItemComponent from './subcomponent/BooleanItemComponent.vue'
import DropdownItemComponent from './subcomponent/DropdownItemComponent.vue'
import TableItemComponent from './subcomponent/TableItemComponent.vue'
import DateItemComponent from './subcomponent/DateItemComponent.vue'
// import response from '@/assets/Sample_data/responsedata'
import { useEditableStore } from '@/stores/responseStore'
import api_call_methods from '@/assets/api_calls/api_calls'
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification'
const router = useRouter();
const toast=useToast();

const userStore = useUserStore();

const user_id=userStore.userID

const props = defineProps({
  fundName: { 
    type: String, 
    required: true 
  },
  filingId:{
        type:String,
        required:true
    },
  
  

})




const emit=defineEmits(['open-upload'])
const responseStore = useEditableStore()
const editedData = reactive({})
const data=ref(responseStore.getFundData(props.fundName))
const editingFieldNo = ref(null)

watch(
  () => props.fundName,  
  (newVal) => {
    data.value = responseStore.getFundData(newVal)
     for (const key in editedData) {
      delete editedData[key]
    }
    
    editingFieldNo.value = null
  }
)



function startEditing(fieldNo) {
  editingFieldNo.value = fieldNo
  const original = data.value.find(f => f.field_no === fieldNo)?.field_data
  editedData[fieldNo] = original?.map(item => ({
    ...item,
    value: item.value, 
  })) || []
}

function updateValue(fieldNo, itemIndex, newVal) {
  if (!editedData[fieldNo]) return
  editedData[fieldNo][itemIndex].value= newVal
}


const making_api_call=ref(false)
async function saveEdits(fieldNo,value, fieldIndex) {
  try{
    making_api_call.value=true
  toast.info(`Saving Question ${fieldNo}`)
  const fund_id=responseStore.getFundId(props.fundName)
  responseStore.updateItem(props.fundName,fieldNo,editedData[fieldNo],fieldIndex)
  const acceptApiData={
    'field_no':fieldNo,
    'value':value,
    'field_data':editedData[fieldNo],
    "confirmed": true,
    "editing": false
  }
  const response=await api_call_methods.accept_data(user_id,acceptApiData,fund_id,props.filingId)
  editingFieldNo.value = null
  delete editedData[fieldNo] 
  toast.success(`Saved Question ${fieldNo}`)
}
catch(error){
  console.log(error)
  toast.error(`Failed to save question  ${fieldNo}`)
}   
finally{
making_api_call.value=false
}
}
async function restoreEdits(fieldNo) {
  try{
    making_api_call.value=true
    toast.info(`Reverting Question ${fieldNo}`)
  const fund_id=responseStore.getFundId(props.fundName)
  const revertApiData={
    'field_no':fieldNo,
    'value':'',
    'field_data':editedData[fieldNo],
    "confirmed": true,
    "editing": false
  }
  const response=await api_call_methods.revert_data(user_id,revertApiData,fund_id,props.filingId)
  location.reload();
  }
  catch(error){
    console.log(error)
    toast.error(`Failed to revert question ${fieldNo}`)
  }
  finally{
    making_api_call.value=false
  }

}

function cancelEditing() {
  editingFieldNo.value = null
}

function openUpload(){
  emit('open-upload')
}

function getDisplayFieldNo(fieldNo){
  const parts = fieldNo.split('_');
  return parts[parts.length - 1]; 
};

//for indentation
function getIndent(fieldNo){
  const depth = (fieldNo.match(/_/g) || []).length;
  return depth * 5; 
};


function goToPreview(){
  router.push({ name: 'preview', query: { filing_id: props.filingId } });
};


function goToHome(){
  window.location='/home'
}
</script>

<style scoped>
.question-separator {
  border: none;
  border-top: 1px solid #ddd;
  margin: 10px 0;
}
</style>
