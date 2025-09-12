<template>
  <div class="w-100 p-2">
    <div class="button-options">
      <button class="btn btn-primary m-2 border-0">
        <font-awesome-icon class="icon" icon="download" /> Pdf Preview
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
        <h3>{{ props.fundName }} {{ props.seriesName }}</h3>
      </div>

      <div>
        <div v-for="(fields, fieldIndex) in data" :key="fieldIndex">
          <div class="d-flex justify-content-between align-items-center">
            <p><span>{{ fields.field_no }})</span></p>
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
                @click="saveEdits(fields.field_no, fieldIndex)"
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
              >
                <InputItemComponent
                  v-if="items.line_item_type === 'text'"
                  :itemNumber="items.line_item_no"
                  :itemText="items.line_text"
                  :itemValue="editedData[fields.field_no]?.[itemIndex]?.value[0] ?? items.value[0]"
                  :disabled="editingFieldNo !== fields.field_no"
                  @update="val => updateValue(fields.field_no, itemIndex, val)"
                />
                <BooleanItemComponent
                  v-else-if="items.line_item_type === 'bool'"
                  :itemNumber="items.line_item_no"
                  :itemText="items.line_text"
                  :itemValue="editedData[fields.field_no]?.[itemIndex]?.value[0] ?? items.value[0]"
                  :disabled="editingFieldNo !== fields.field_no"
                  @update="val => updateValue(fields.field_no, itemIndex, val)"
                />
                <DropdownItemComponent
                  v-else-if="items.line_item_type === 'dropdown'"
                  :itemNumber="items.line_item_no"
                  :itemText="items.line_text"
                  :itemValue="editedData[fields.field_no]?.[itemIndex]?.value[0] ?? items.value[0]"
                  :options="items.options"
                  :disabled="editingFieldNo !== fields.field_no"
                  @update="val => updateValue(fields.field_no, itemIndex, val)"
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
import { ref, reactive , computed} from 'vue'
import InputItemComponent from './subcomponent/InputItemComponent.vue'
import BooleanItemComponent from './subcomponent/BooleanItemComponent.vue'
import DropdownItemComponent from './subcomponent/DropdownItemComponent.vue'
import response from '@/assets/Sample_data/responsedata'
import { useEditableStore } from '@/stores/responseStore'

const props = defineProps({
  fundName: { 
    type: String, 
    required: true 
  },
  seriesName: { 
    type: String, 
    required: true
   }
})

const emit=defineEmits(['open-upload'])
const responseStore = useEditableStore()
responseStore.setResponse(response)

const data = computed(() => responseStore.getfundSeriesdata('1','A'))
const editingFieldNo = ref(null)
const editedData = reactive({})

function startEditing(fieldNo) {
  editingFieldNo.value = fieldNo
  const original = data.value.find(f => f.field_no === fieldNo)?.field_data
  editedData[fieldNo] = original?.map(item => ({
    ...item,
    value: [...item.value], 
  })) || []
}

function updateValue(fieldNo, itemIndex, newVal) {
  if (!editedData[fieldNo]) return
  editedData[fieldNo][itemIndex].value[0] = newVal
}

function saveEdits(fieldNo, fieldIndex) {
  responseStore.updateItem('1','A',fieldNo,editedData[fieldNo],fieldIndex)
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
</script>

<style scoped>
/* Optional styles */
</style>
