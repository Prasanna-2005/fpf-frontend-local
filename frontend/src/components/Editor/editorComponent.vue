<template>
  <div class="w-100 p-2">
    <div class="button-options">
      <button class="btn btn-primary m-2 border-0"  @click="goToPreview">
        <font-awesome-icon class="icon" icon="eye" /> Pdf Preview
      </button>
      <button class="btn btn-primary m-2 border-0">
        <font-awesome-icon class="icon" icon="download" /> Input File
      </button>
      <button class="btn btn-primary m-2 border-0">
        <font-awesome-icon class="icon" icon="check-double" /> Save
      </button>
      <button class="btn btn-primary m-2 border-0">
        <font-awesome-icon class="icon" icon="arrow-left" /> Back
      </button>
      <button class="btn btn-primary m-2 border-0" @click="openUpload">
        <font-awesome-icon class="icon" icon="upload" /> Upload More Files
      </button>
    </div>

    <div class="max-dimensions" style="border: 1px solid; height: 730px; overflow: scroll;">
      <div class="editor-header">
        <h3>{{ props.fundName }} </h3>
      </div>

      <div :key="props.fundName">
        <div v-for="(fields, fieldIndex) in data" :key="fieldIndex">
          <div class="d-flex justify-content-between align-items-center">
            <p :style="{ marginLeft: getIndent(fields.field_no) + 'px' }">
              
              <span >
                <span class="line-value">
                    <InputItemComponent
                    v-if="fields.field_item_type === 'text' || fields.field_item_type === 'None'"
                    :itemNumber="getDisplayFieldNo(fields.field_no)"
                    :itemText="fields.field_text"
                    :itemValue="editedData[fields.field_no]?.value ?? fields.value"
                    :disabled="editingFieldNo !== fields.field_no"
                    :indent="getIndent(fields.field_no)"  
                    :inputNeeded="fields.field_item_type !== 'None'"
                    @update="val => updateValue(fields.field_no, itemIndex, val)"
                  />
                  <BooleanItemComponent
                    v-else-if="fields.field_item_type === 'bool'"
                    :itemNumber="getDisplayFieldNo(fields.field_no)"
                    :itemText="fields.field_text"
                    :itemValue="editedData[fields.field_no]?.value?.[0] ?? fields.value"
                    :disabled="editingFieldNo !== fields.field_no"
                    :indent="getIndent(fields.field_no)"  
                    @update="val => updateValue(fields.field_no, itemIndex, val)"
                  />
                  <DropdownItemComponent
                    v-else-if="fields.field_item_type === 'dropdown'"
                    :itemNumber="getDisplayFieldNo(fields.field_no)"
                    :itemText="fields.field_text"
                    :itemValue="editedData[fields.field_no]?.value?.[0] ?? fields.value"
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
                  :dateValue="editedData[fields.field_no]?.value?.[0] ?? fields.value"
                  :itemText="fields.field_text" 
                  :itemData="fields.table_data" 
                  :disabled="editingFieldNo !== fields.field_no"
                  />
                </span>

              </span>
             
            </p>
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
              >
                <font-awesome-icon class="icon" icon="floppy-disk" />
              </button>
              <button
                v-if="editingFieldNo === fields.field_no" 
                class="btn btn-sm btn-warning me-2"
                @click="restoreEdits(fields.field_no, fieldIndex)"
                >
                <font-awesome-icon class="icon" icon="rotate-left" />
              </button>
              <button
                v-if="editingFieldNo === fields.field_no"
                class="btn btn-sm btn-danger "
                @click="cancelEditing"
              >
               <font-awesome-icon class="icon" icon="xmark" />
              </button>
              
            </div>
            
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
import response from '@/assets/Sample_data/responsedata'
import { useEditableStore } from '@/stores/responseStore'
import api_call_methods from '@/assets/api_calls/api_calls'
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';

const router = useRouter();

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

async function saveEdits(fieldNo,value, fieldIndex) {
  console.log('value:',value)
  // responseStore.getFundId(props.fundName)
  const fund_id=responseStore.getFundId(props.fundName)
  responseStore.updateItem(props.fundName,fieldNo,editedData[fieldNo],fieldIndex)
  console.log("save------->",editedData[fieldNo])
  const acceptApiData={
    'field_no':fieldNo,
    'value':value,
    'field_data':editedData[fieldNo],
    "confirmed": true,
    "editing": false
  }
  console.log("data for api:::::",acceptApiData)
  const response=await api_call_methods.accept_data(user_id,acceptApiData,fund_id,props.filingId)
  console.log(response)
  editingFieldNo.value = null
  delete editedData[fieldNo]    
}
function restoreEdits(fieldNo, fieldIndex) {
    //API call

    

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
  return depth * 30; 
};


function goToPreview(){
  console.log("works go to preview")
  console.log(props.filingId)
  router.push({ name: 'preview', query: { filing_id: props.filingId } });
};
</script>

<style scoped>
/* Optional styles */
</style>
