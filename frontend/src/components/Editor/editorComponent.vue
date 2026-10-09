<template>
  <div class="editor-shell">
    <div class="fund-header">
      <div class="fund-header-text">
        <h2>{{ props.fundName }}</h2>
        <p>{{ sectionSubtitle }}</p>
      </div>
      <div class="fund-header-actions">
        <button
          type="button"
          class="changes-bell-btn"
          :class="{ 'has-changes': latestChangesCount > 0 }"
          :aria-label="latestChangesCount > 0
            ? `${latestChangesCount} latest changes. Open changes list`
            : 'No latest changes'"
          :title="latestChangesCount > 0
            ? `${latestChangesCount} latest change${latestChangesCount === 1 ? '' : 's'}`
            : 'No latest changes'"
          @click="openChangesPopUp"
        >
          <font-awesome-icon class="bell-icon" icon="bell" />
          <span
            v-if="latestChangesCount > 0"
            class="changes-badge"
          >
            {{ latestChangesCount > 99 ? '99+' : latestChangesCount }}
          </span>
        </button>
        <button type="button" class="btn-outline" @click="openMappedFiles">
          <font-awesome-icon icon="file" />
          Mapped Files
        </button>
        <button type="button" class="btn-outline" @click="openCompareSelector">
          <font-awesome-icon icon="code-compare" />
          Compare
        </button>
        <button type="button" class="btn-primary" @click="openUpload">
          <font-awesome-icon icon="upload" />
          Upload More Files
        </button>
        <button
          type="button"
          class="changes-bell-btn"
          :class="{ 'has-changes': latestChangesCount > 0 }"
          :aria-label="latestChangesCount > 0
            ? `${latestChangesCount} latest changes. Open changes list`
            : 'No latest changes'"
          :title="latestChangesCount > 0
            ? `${latestChangesCount} latest change${latestChangesCount === 1 ? '' : 's'}`
            : 'No latest changes'"
          @click="openChangesPopUp"
        >
          <font-awesome-icon class="bell-icon" icon="bell" />
          <span v-if="latestChangesCount > 0" class="changes-badge">
            {{ latestChangesCount > 99 ? '99+' : latestChangesCount }}
          </span>
        </button>
      </div>
    </div>

    <div class="editor-scroll">
      <div class="form-panel" :key="props.fundName">
        <div v-for="(fields, fieldIndex) in data" :key="fieldIndex">
          <div
            v-if="sectionHeading(fields.field_no)"
            class="section-bar"
          >
            {{ sectionHeading(fields.field_no) }}
          </div>

          <div
            v-if="getDisplayFieldNo(fields.field_no) === '18'"
            class="fund-banner"
          >
            <div>
              <h3>{{ props.fundName }}</h3>
              <p>Information about the hedge funds you advise</p>
            </div>
          </div>

          <div class="q-block">
            <div class="q-head">
              <div class="q-head-left">
                <span class="q-num">{{ getDisplayFieldNo(fields.field_no) }}.</span>
                <span v-if="isEdited(fields.field_no)" class="edited-tag">Edited</span>
              </div>
              <div class="q-actions">
                <div class="review-control" @click.stop>
                  <button
                    v-if="!isReviewedByMe(fields.field_no)"
                    type="button"
                    class="review-accept"
                    @click="acceptReview(fields.field_no)"
                  >
                    Accept
                  </button>
                  <div v-else class="review-done">
                    <button
                      type="button"
                      class="review-done-label"
                      @click="toggleReviewers(fields.field_no)"
                    >
                      <font-awesome-icon icon="check" />
                      Reviewed
                    </button>
                    <button
                      type="button"
                      class="review-undo"
                      title="Undo my review"
                      @click="undoReview(fields.field_no)"
                    >
                      <font-awesome-icon icon="xmark" />
                    </button>
                  </div>
                  <button
                    v-if="reviewerCount(fields.field_no) > 0"
                    type="button"
                    class="review-count"
                    :title="`${reviewerCount(fields.field_no)} reviewer${reviewerCount(fields.field_no) === 1 ? '' : 's'}`"
                    @click="toggleReviewers(fields.field_no)"
                  >
                    {{ reviewerCount(fields.field_no) }}
                  </button>
                  <div
                    v-if="openReviewField === fields.field_no"
                    class="review-popover"
                    role="dialog"
                    aria-label="Reviewers"
                  >
                    <p class="review-popover-title">Reviewed by</p>
                    <ul>
                      <li v-for="person in reviewersFor(fields.field_no)" :key="person.user_id">
                        <span class="review-name">{{ reviewDisplayName(person) }}</span>
                        <span class="review-when">{{ formatReviewedAt(person.reviewed_at) }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <button
                  type="button"
                  class="icon-btn"
                  title="Change history"
                  @click="openHistory(fields.field_no, fields.field_item_type, fields.has_table_data)"
                >
                  <font-awesome-icon icon="clock-rotate-left" />
                </button>
                <button
                  type="button"
                  class="icon-btn"
                  title="Computations"
                  @click="openCompLogs(fields.field_no, fields.field_text)"
                >
                  <font-awesome-icon icon="calculator" />
                </button>
                <button
                  v-if="editingFieldNo !== fields.field_no"
                  type="button"
                  class="icon-btn"
                  title="Edit"
                  @click="startEditing(fields.field_no)"
                >
                  <font-awesome-icon icon="pen" />
                </button>
                <template v-else>
                  <button
                    type="button"
                    class="icon-btn save"
                    title="Save"
                    :disabled="making_api_call"
                    @click="saveEdits(fields.field_no, fields.value, fieldIndex)"
                  >
                    <font-awesome-icon icon="check" />
                  </button>
                  <button
                    type="button"
                    class="icon-btn undo"
                    title="Revert"
                    :disabled="making_api_call"
                    @click="restoreEdits(fields.field_no)"
                  >
                    <font-awesome-icon icon="rotate-left" />
                  </button>
                  <button
                    type="button"
                    class="icon-btn cancel"
                    title="Cancel"
                    :disabled="making_api_call"
                    @click="cancelEditing(fields.field_no, fields.value, fieldIndex)"
                  >
                    <font-awesome-icon icon="xmark" />
                  </button>
                </template>
              </div>
            </div>

              <div class="q-body">
              <div class="field-primary">
                <InputItemComponent
                  v-if="fields.field_item_type === 'text' || fields.field_item_type === 'NULL'"
                  :itemNumber="getDisplayFieldNo(fields.field_no)"
                  :itemText="fields.field_text"
                  :itemValue="editedData[fields.field_no]?.field_item_value?.[0]?.value ?? fields.value"
                  :disabled="editingFieldNo !== fields.field_no"
                  :indent="getIndent(fields.field_no)"
                  :inputNeeded="fields.field_item_type !== 'NULL'"
                  :displayAffix="fields.display_affix"
                  hide-number
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
                  hide-number
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
                  hide-number
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
                  hide-number
                  @update="table => updateTableValue(fields.field_no, table)"
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
                  hide-number
                  @update="val => updateValue(fields.field_no, 0, val, 'field_item_value')"
                />
                <ExpandingTableItemComp
                  v-else-if="fields.field_item_type === 'exp_table'"
                  :itemNumber="getDisplayFieldNo(fields.field_no)"
                  :itemText="fields.field_text"
                  :headers="fields.table_headers"
                  :metadata="fields.table_metadata"
                  :itemValue="editedData[fields.field_no]?.value?.[0]?.value ?? fields.value"
                  :disabled="editingFieldNo !== fields.field_no"
                  :indent="getIndent(fields.field_no)"
                  hide-number
                  @update="val => updateValue(fields.field_no, 0, val, 'field_item_value')"
                />
              </div>

              <div class="field-children">
                <div
                  v-for="(items, itemIndex) in fields.field_data"
                  :key="itemIndex"
                  class="child-row"
                  :style="{ marginLeft: getIndent(fields.field_no) + 'px' }"
                >
                  <InputItemComponent
                    v-if="items.line_item_type === 'text' || items.line_item_type === 'NULL'"
                    :itemNumber="getDisplayFieldNo(items.line_item_no)"
                    :itemText="items.line_text"
                    :itemValue="editedData[fields.field_no]?.value?.[itemIndex]?.value ?? items.value"
                    :disabled="editingFieldNo !== fields.field_no"
                    :indent="getIndent(items.line_item_no)"
                    :inputNeeded="items.line_item_type !== 'NULL'"
                    :displayAffix="items.display_affix"
                    @update="val => updateValue(fields.field_no, itemIndex, val, 'value', items.line_item_no)"
                  />
                  <BooleanItemComponent
                    v-else-if="items.line_item_type === 'bool'"
                    :itemNumber="getDisplayFieldNo(items.line_item_no)"
                    :itemText="items.line_text"
                    :key="getFieldKey(fields.field_no)"
                    :itemValue="editedData[fields.field_no]?.value?.[itemIndex]?.value ?? items.value"
                    :disabled="editingFieldNo !== fields.field_no"
                    :indent="getIndent(items.line_item_no)"
                    @update="val => updateValue(fields.field_no, itemIndex, val, 'value', items.line_item_no)"
                  />
                  <DropdownItemComponent
                    v-else-if="items.line_item_type === 'dropdown'"
                    :itemNumber="getDisplayFieldNo(items.line_item_no)"
                    :itemText="items.line_text"
                    :itemValue="editedData[fields.field_no]?.value?.[itemIndex]?.value ?? items.value"
                    :options="items.options"
                    :disabled="editingFieldNo !== fields.field_no"
                    :indent="getIndent(items.line_item_no)"
                    @update="val => updateValue(fields.field_no, itemIndex, val, 'value', items.line_item_no)"
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
                    :disabled="editingFieldNo !== fields.field_no"
                    :indent="getIndent(items.line_item_no)"
                    @update="val => updateValue(fields.field_no, itemIndex, val, 'value', items.line_item_no)"
                  />
                  <McqItemComponent
                    v-else-if="items.line_item_type === 'mcq'"
                    :itemNumber="getDisplayFieldNo(items.line_item_no)"
                    :itemText="items.line_text"
                    :itemValue="items.value"
                    :disabled="editingFieldNo !== fields.field_no"
                    :indent="getIndent(items.line_item_no)"
                    :options="items.options"
                    @update="val => updateValue(fields.field_no, itemIndex, val, 'value', items.line_item_no)"
                  />
                  <ExpandingTableItemComp
                    v-else-if="items.line_item_type === 'exp_table'"
                    :itemNumber="getDisplayFieldNo(items.line_item_no)"
                    :itemText="items.line_text"
                    :headers="items.table_headers"
                    :metadata="items.table_metadata"
                    :itemValue="items.value"
                    :disabled="editingFieldNo !== fields.field_no"
                    :indent="getIndent(items.line_item_no)"
                    @update="val => updateValue(fields.field_no, itemIndex, val, 'value', items.line_item_no)"
                  />
                </div>
              </div>

              <p v-if="fields.disclaimer_text" class="disclaimer">{{ fields.disclaimer_text }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <compareSelectorPopUp
      v-if="openComparePopUp"
      :filingId="filingId"
      @close-click="openComparePopUp = false"
      @compare-selected="onCompareSelected"
    />

    <ChangesPopUp
      v-if="showChangesPopUp"
      :data="latestChanges"
      @close-click="closeChangesPopUp"
    />
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import InputItemComponent from './subcomponent/InputItemComponent.vue'
import BooleanItemComponent from './subcomponent/BooleanItemComponent.vue'
import DropdownItemComponent from './subcomponent/DropdownItemComponent.vue'
import TableItemComponent from './subcomponent/TableItemComponent.vue'
import DateItemComponent from './subcomponent/DateItemComponent.vue'
import { useEditableStore } from '@/stores/responseStore'
import api_call_methods from '@/assets/api_calls/api_calls'
import { useUserStore } from '@/stores/userStore'
import { useToast } from 'vue-toast-notification'
import { openActionToast } from '@/assets/utils/toastUtils'
import McqItemComponent from './subcomponent/McqItemComponent.vue'
import ExpandingTableItemComp from './subcomponent/ExpandingTableItemComp.vue'
import ChangesPopUp from '@/components/popUps/ChangesPopUp.vue'
import compareSelectorPopUp from '@/components/popUps/compareSelectorPopUp.vue'

const toast = useToast()
const router = useRouter()
const userStore = useUserStore()
const user_id = userStore.userID

const props = defineProps({
  fundName: { type: String, required: true },
  filingId: { type: String, required: true },
  /** fieldNo -> true when history length > 1 */
  editedFlags: { type: Object, default: () => ({}) },
}) 

const emit = defineEmits(['open-upload','refresh-data','open-computationLogs','open-history','open-mapped-files'])
const responseStore = useEditableStore()
const editedData = reactive({})
const fundname=ref(props.fundName)
const data = ref(responseStore.getFundData(fundname.value))
const computationLogs=ref(responseStore.getFundComputation(fundname.value))
const editingFieldNo = ref(null)
const recentlySaved = ref(new Set())
const reviewsByField = ref({})
const openReviewField = ref(null)
let reviewRequest = 0
const reviewIntent = {}
const reviewBusy = {}
const reviewEpoch = {}
const editedByHistory = ref({})
let prefetchGeneration = 0

function hasHistoryEdits(historyData) {
  if (!historyData || typeof historyData !== 'object') return false
  return Object.values(historyData).some(
    (entries) => Array.isArray(entries) && entries.length > 1
  )
}

function isEdited(fieldNo) {
  return Boolean(
    editedByHistory.value[fieldNo] ||
      props.editedFlags?.[fieldNo] ||
      recentlySaved.value.has(fieldNo)
  )
}

function markEdited(fieldNo) {
  recentlySaved.value = new Set([...recentlySaved.value, fieldNo])
  editedByHistory.value = { ...editedByHistory.value, [fieldNo]: true }
  if (props.editedFlags && typeof props.editedFlags === 'object') {
    props.editedFlags[fieldNo] = true
  }
}

async function prefetchEditedFlags() {
  const generation = ++prefetchGeneration
  const list = data.value || []
  const fund_id = responseStore.getFundId(fundname.value)
  if (!fund_id || !list.length) return

  const flags = {}
  const chunkSize = 6

  for (let i = 0; i < list.length; i += chunkSize) {
    if (generation !== prefetchGeneration) return

    const chunk = list.slice(i, i + chunkSize)
    const settled = await Promise.allSettled(
      chunk.map((field) =>
        api_call_methods
          .get_history(user_id, {
            filingId: props.filingId,
            fundId: fund_id,
            fieldNo: field.field_no,
          })
          .then((res) => ({
            fieldNo: field.field_no,
            edited: hasHistoryEdits(res.data),
          }))
      )
    )

    if (generation !== prefetchGeneration) return

    settled.forEach((result) => {
      if (result.status === 'fulfilled') {
        flags[result.value.fieldNo] = result.value.edited
        if (result.value.edited && props.editedFlags) {
          props.editedFlags[result.value.fieldNo] = true
        }
      }
    })
    editedByHistory.value = { ...flags }
  }
}

const sectionSubtitle = computed(() => {
  const firstNo = data.value?.[0]?.field_no
  if (firstNo && getDisplayFieldNo(firstNo) === '18') {
    return 'Information about the hedge funds you advise'
  }
  return 'Information about the private fund you advise'
})

function sectionHeading(fieldNo) {
  const display = getDisplayFieldNo(fieldNo)
  const map = {
    '5': 'Item A - Reporting Fund Identifying Information',
    '8': 'Item B - Assets, Financing and Investor Concentration',
    '17': 'Item C - Reporting Fund Performance',
    '18': 'Item A - Reporting Fund Identifying Information',
    '19': 'Item B - Certain Information Regarding the Reporting Fund',
  }
  return map[display] || ''
}

watch(() => props.fundName, (newVal) => {
  fundname.value=newVal
  
  data.value = responseStore.getFundData(newVal)
  computationLogs.value=responseStore.getFundComputation(newVal)
  for (const key in editedData) delete editedData[key]
  editingFieldNo.value = null
  recentlySaved.value = new Set()
  editedByHistory.value = {}
  openReviewField.value = null
  prefetchEditedFlags()
  fetchReviews()
})

onMounted(() => {
  prefetchEditedFlags()
  fetchReviews()
  document.addEventListener('click', closeReviewPopover)
  startLatestChangesPolling()
})

onUnmounted(() => {
  document.removeEventListener('click', closeReviewPopover)
  stopLatestChangesPolling()
})

function updateTableValue(fieldNo, tableData) {
  if (!editedData[fieldNo]) return
  // idx and key level accept
  const { idx,key, rows } = tableData
  console.log(idx)

  editedData[fieldNo].table_data = rows
  if (!editedData[fieldNo].changedTableCells.has(idx)) {
    editedData[fieldNo].changedTableCells.set(idx, new Set())
  }

  editedData[fieldNo].changedTableCells.get(idx).add(key)
  editedData[fieldNo].changed=true

}

// safe guard for re render
const keyVersions = ref({})

function getFieldKey(fieldNo) {
  return `${fieldNo}-${keyVersions.value[fieldNo] || 0}`
}


// Updated startEditing
function startEditing(fieldNo) {
  if (making_api_call.value){ 
    toast.warning(`Please wait saving question ${making_api_call_field.value}`)
    return
  }

 if (editingFieldNo.value && editingFieldNo.value !== fieldNo) {
    const currentField = editedData[editingFieldNo.value]

    // Check if there are unsaved changes
    if (currentField?.changed) {
      const oldFieldNo = editingFieldNo.value
      const oldFieldValue = editedData[oldFieldNo]?.field_item_value?.[0]?.value ?? ''
      const oldFieldIndex = data.value.findIndex(f => f.field_no === oldFieldNo)

      // Show unsaved changes toast
      const toastInstance = openActionToast(toast, {
        title: 'Unsaved Changes',
        message: `You have unsaved edits in Question ${oldFieldNo}.`,
        type: 'warning',
        duration: 0,
        actions: [
          {
            id: 'saveOldBtn',
            label: 'Save',
            variant: 'success',
            onClick: async () => {
              await saveEdits(oldFieldNo, oldFieldValue, oldFieldIndex)
              toastInstance.dismiss()
              startEditing(fieldNo)
            },
          },
          {
            id: 'discardOldBtn',
            label: 'Discard',
            variant: 'danger',
            onClick: () => {
              delete editedData[oldFieldNo]
              keyVersions.value[oldFieldNo] = (keyVersions.value[oldFieldNo] || 0) + 1
              editingFieldNo.value = null
              toastInstance.dismiss()
              startEditing(fieldNo)
            },
          },
        ],
      })

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

  editedData[fieldNo] = {
     value: [],
     table_data: [],
     field_item_value: [],
     has_table_data:field.has_table_data,
     field_item_type: field.field_item_type,
     changed: false,
     changedSubFields: new Set() ,
    changedTableCells: new Map()
    }

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
function updateValue(fieldNo, itemIndex, newVal, type = 'value',line_item_no='') {
  if (!editedData[fieldNo]) return
  switch (type) {
    case 'value':
      if (editedData[fieldNo].value[itemIndex]){
         editedData[fieldNo].value[itemIndex].value = newVal
         editedData[fieldNo].changedSubFields.add(
          line_item_no || editedData[fieldNo].value[itemIndex]?.line_item_no || itemIndex
        )
      }
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
const making_api_call_field=ref('')

async function saveEdits(fieldNo, value, fieldIndex) {
  try {



    making_api_call.value = true;
    making_api_call_field.value=fieldNo
    toast.info(`Saving Question ${fieldNo}`);

    const fund_id = responseStore.getFundId(fundname.value);



    // Prepare API payload

    const changedSet = editedData[fieldNo].changedSubFields

    const filteredFieldData = editedData[fieldNo].value.filter(item =>
      changedSet.has(item.line_item_no)
    )

    const changedMap = editedData[fieldNo].changedTableCells
    const filteredTableData = []

    changedMap.forEach((keys, idx) => {
      const row = editedData[fieldNo].table_data[idx]

      const updatedRow = {}
      updatedRow['s.name'] = row['s.name']
      updatedRow['s.text'] = row['s.text']


      keys.forEach(key => {
        updatedRow[key] = row[key]
      })

      filteredTableData.push({
        ...updatedRow
      })
    })
    const acceptApiData = {
      field_no: fieldNo,
      value: `${ editedData[fieldNo].field_item_value?.[0]?.value ?? value}`, // single-value field
      field_data: filteredFieldData,  // field_data array
      table_data: filteredTableData, // table rows
      confirmed: true,
      editing: false,
      has_table_data:editedData[fieldNo].has_table_data,
      field_item_type:editedData[fieldNo].field_item_type
    };

    // Call API
    await api_call_methods.accept_data(user_id, acceptApiData, fund_id, props.filingId)

    await fetchLatestChanges()

    // Trigger parent refresh and wait until it's done
    await new Promise(resolve => {
      emit('refresh-data', resolve)
    })


    

    data.value = responseStore.getFundData(fundname.value)
    
    editingFieldNo.value = null
    delete editedData[fieldNo]
    markEdited(fieldNo)
    toast.success(`Saved Question ${fieldNo}`)
  } catch(error){
    console.log(error)
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
    const toastInstance = openActionToast(toast, {
      title: 'Unsaved Changes',
      message: 'You have unsaved edits for this field.',
      type: 'warning',
      duration: 0,
      actions: [
        {
          id: 'saveBtn',
          label: 'Save',
          variant: 'success',
          onClick: () => {
            saveEdits(fieldNo, value, fieldIndex)
            toastInstance.dismiss()
          },
        },
        {
          id: 'discardBtn',
          label: 'Discard',
          variant: 'danger',
          onClick: () => {
            delete editedData[fieldNo]
            keyVersions.value[fieldNo] = (keyVersions.value[fieldNo] || 0) + 1
            editingFieldNo.value = null
            toastInstance.dismiss()
          },
        },
      ],
    })

    return
  }

  // no changes — safe to cancel
  delete editedData[fieldNo]
  editingFieldNo.value = null
}

function openUpload() {
  emit('open-upload')
}

function openMappedFiles(){
  emit('open-mapped-files')
}

const openComparePopUp = ref(false)

function openCompareSelector(){
  openComparePopUp.value = true
}

function onCompareSelected(relatedFiling){
  openComparePopUp.value = false
  router.push({
    name: 'compare',
    query: {
      filing_id_a: props.filingId,
      filing_id_b: relatedFiling.id,
      name_a: localStorage.getItem('filingName') || '',
      name_b: relatedFiling.filing_name || '',
    }
  })
}

function getDisplayFieldNo(fieldNo) {
  const parts = fieldNo.split('_')
  return parts[parts.length - 1]
}

function getIndent(fieldNo) {
  return (fieldNo.match(/_/g) || []).length * 5
}

async function openHistory(field_no, fieldType, hasTableData){
  const fund_id = responseStore.getFundId(fundname.value)
  emit('open-history', field_no, fund_id, fieldType, hasTableData)
}

function reviewersFor(fieldNo) {
  return reviewsByField.value[fieldNo]?.reviewers ?? []
}

function reviewerCount(fieldNo) {
  return reviewersFor(fieldNo).length
}

function isReviewedByMe(fieldNo) {
  return Boolean(reviewsByField.value[fieldNo]?.reviewed_by_me)
}

function reviewDisplayName(person) {
  if (String(person.user_id) === String(user_id)) return 'You'
  return person.user_name
}

function formatReviewedAt(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function closeReviewPopover() {
  openReviewField.value = null
}

function toggleReviewers(fieldNo) {
  openReviewField.value = openReviewField.value === fieldNo ? null : fieldNo
}

function applyReviewItem(item) {
  if (!item?.field_no) return
  if (!item.reviewers?.length) {
    const next = { ...reviewsByField.value }
    delete next[item.field_no]
    reviewsByField.value = next
    if (openReviewField.value === item.field_no) openReviewField.value = null
    return
  }
  reviewsByField.value = { ...reviewsByField.value, [item.field_no]: item }
}

async function fetchReviews() {
  const fundId = responseStore.getFundId(fundname.value)
  if (!props.filingId || !fundId) {
    reviewsByField.value = {}
    return
  }
  const request = ++reviewRequest
  try {
    const response = await api_call_methods.get_reviews(user_id, props.filingId, fundId)
    if (request !== reviewRequest) return
    const next = {}
    for (const item of response?.data?.reviews ?? []) {
      if (item?.field_no) next[item.field_no] = item
    }
    reviewsByField.value = next
  } catch (error) {
    if (request !== reviewRequest) return
    console.error('Failed to load reviews', error)
  }
}

function setMyReview(fieldNo, reviewed) {
  const others = reviewersFor(fieldNo).filter((person) => String(person.user_id) !== String(user_id))
  const reviewers = reviewed
    ? [...others, {
        user_id,
        user_name: userStore.username || 'You',
        reviewed_at: new Date().toISOString(),
      }]
    : others
  applyReviewItem({
    field_no: fieldNo,
    reviewed_by_me: reviewed,
    reviewers,
  })
}

function markReviewClick(fieldNo) {
  reviewEpoch[fieldNo] = (reviewEpoch[fieldNo] || 0) + 1
}

async function applyServerReview(fieldNo) {
  const epoch = reviewEpoch[fieldNo]
  const fundId = responseStore.getFundId(fundname.value)
  if (!props.filingId || !fundId) return
  const response = await api_call_methods.get_reviews(user_id, props.filingId, fundId)
  if (reviewEpoch[fieldNo] !== epoch || reviewIntent[fieldNo] !== undefined) return
  const item = (response?.data?.reviews ?? []).find((row) => row?.field_no === fieldNo)
  if (item) {
    applyReviewItem(item)
    return
  }
  applyReviewItem({ field_no: fieldNo, reviewed_by_me: false, reviewers: [] })
}

async function flushReview(fieldNo, fundId) {
  if (reviewBusy[fieldNo]) return
  reviewBusy[fieldNo] = true
  try {
    while (reviewIntent[fieldNo] !== undefined) {
      const wantReviewed = reviewIntent[fieldNo]
      delete reviewIntent[fieldNo]
      try {
        const response = wantReviewed
          ? await api_call_methods.accept_review(user_id, props.filingId, fundId, fieldNo)
          : await api_call_methods.undo_review(user_id, props.filingId, fundId, fieldNo)
        const newerIntent = reviewIntent[fieldNo]
        if (newerIntent !== undefined && newerIntent !== wantReviewed) continue
        applyReviewItem(response?.data)
        if (newerIntent === wantReviewed) delete reviewIntent[fieldNo]
      } catch (error) {
        console.error('Failed to update review', error)
        if (reviewIntent[fieldNo] !== undefined) continue
        try {
          await applyServerReview(fieldNo)
        } catch (syncError) {
          console.error('Failed to refresh review state', syncError)
        }
        if (reviewIntent[fieldNo] !== undefined) continue
        toast.error('Unable to update the review. Please try again.')
        break
      }
    }
  } finally {
    reviewBusy[fieldNo] = false
    if (reviewIntent[fieldNo] !== undefined) await flushReview(fieldNo, fundId)
  }
}

async function acceptReview(fieldNo) {
  const fundId = responseStore.getFundId(fundname.value)
  if (!fundId || isReviewedByMe(fieldNo)) return
  markReviewClick(fieldNo)
  setMyReview(fieldNo, true)
  reviewIntent[fieldNo] = true
  await flushReview(fieldNo, fundId)
}

async function undoReview(fieldNo) {
  const fundId = responseStore.getFundId(fundname.value)
  if (!fundId || !isReviewedByMe(fieldNo)) return
  markReviewClick(fieldNo)
  setMyReview(fieldNo, false)
  reviewIntent[fieldNo] = false
  await flushReview(fieldNo, fundId)
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

const LATEST_CHANGES_POLL_MS = 5 * 60 * 1000
const latestChanges = ref(null)
const showChangesPopUp = ref(false)
let latestChangesPollId = null

const latestChangesCount = computed(() => {
  const payload = latestChanges.value
  if (!payload) return 0
  return Number(payload.count ?? payload.changes?.length ?? 0) || 0
})

async function fetchLatestChanges() {
  if (!props.filingId) return

  try {
    const response = await api_call_methods.latest_changes(user_id, props.filingId)
    latestChanges.value = response?.data ?? null
  } catch (error) {
    console.log('Failed to fetch latest changes', error)
  }
}

function openChangesPopUp() {
  showChangesPopUp.value = true
}

function closeChangesPopUp() {
  showChangesPopUp.value = false
}

function startLatestChangesPolling() {
  stopLatestChangesPolling()
  fetchLatestChanges()
  latestChangesPollId = setInterval(() => {
    fetchLatestChanges()
  }, LATEST_CHANGES_POLL_MS)
}

function stopLatestChangesPolling() {
  if (latestChangesPollId != null) {
    clearInterval(latestChangesPollId)
    latestChangesPollId = null
  }
}

onMounted(() => {
  startLatestChangesPolling()
})

onUnmounted(() => {
  stopLatestChangesPolling()
})

watch(() => props.filingId, () => {
  startLatestChangesPolling()
})

</script>

<style scoped>
.editor-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  width: 100%;
}

.fund-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 20px 28px 12px;
  flex-shrink: 0;
}

.fund-header-text h2 {
  font-size: 1.35rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
}

.fund-header-text p {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
}

.fund-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-outline {
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #374151;
  border-radius: 8px;
  padding: 9px 14px;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-outline:hover {
  background: #f9fafb;
}

.btn-primary {
  background: #1e3a8a;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 9px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  background: #1e40af;
}

.editor-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 8px 28px 28px;
}

.form-panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.section-bar {
  background: #e8eef8;
  padding: 14px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e3a8a;
  border-bottom: 1px solid #dbe3f0;
  border-top: 1px solid #dbe3f0;
}

.section-bar:first-child {
  border-top: none;
}

.fund-banner {
  padding: 20px;
  border-bottom: 1px solid #f3f4f6;
  background: #f8fafc;
}

.fund-banner h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 4px;
}

.fund-banner p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.q-block {
  padding: 18px 20px 8px;
  border-bottom: 1px solid #f3f4f6;
}

.q-block:last-child {
  border-bottom: none;
}

.q-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.q-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.q-num {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

.edited-tag {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  background: #dcfce7;
  color: #16a34a;
}

.q-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.review-control {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.review-accept,
.review-done-label,
.review-count {
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.review-accept {
  padding: 0 10px;
}

.review-accept:hover:not(:disabled),
.review-count:hover {
  background: #f8fafc;
  color: #1e3a8a;
}

.review-accept:disabled,
.review-undo:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.review-done {
  display: inline-flex;
  align-items: center;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #86efac;
  background: #f0fdf4;
  overflow: hidden;
  animation: review-in 160ms ease;
}

@keyframes review-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.review-done-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 100%;
  padding: 0 8px;
  border: 0;
  background: transparent;
  color: #15803d;
}

.review-undo {
  width: 28px;
  height: 100%;
  border: 0;
  border-left: 1px solid #86efac;
  background: transparent;
  color: #15803d;
  cursor: pointer;
}

.review-undo:hover:not(:disabled) {
  background: #dcfce7;
}

.review-count {
  min-width: 32px;
  padding: 0 8px;
}

.review-popover {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  z-index: 5;
  width: min(260px, 70vw);
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
  padding: 10px 12px;
}

.review-popover-title {
  margin: 0 0 6px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.review-popover ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.review-popover li {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.8rem;
  color: #111827;
  padding: 4px 0;
}

.review-popover li + li {
  border-top: 1px solid #f3f4f6;
}

.review-name {
  font-weight: 600;
}

.review-when {
  color: #6b7280;
  white-space: nowrap;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.icon-btn:hover:not(:disabled) {
  background: #f8fafc;
  color: #1e3a8a;
}

.icon-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.icon-btn.save {
  color: #16a34a;
  border-color: #86efac;
}

.icon-btn.undo {
  color: #ca8a04;
  border-color: #fde68a;
}

.icon-btn.cancel {
  color: #dc2626;
  border-color: #fecaca;
}

.q-body {
  padding-bottom: 8px;
}

.field-children {
  margin-top: 8px;
}

.child-row {
  margin-bottom: 6px;
}

.disclaimer {
  margin: 12px 0 4px;
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 400;
}

.changes-bell-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 1px solid #dbe2ea;
  border-radius: 999px;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.button-options {
  width: 100%;
}

.changes-bell-btn:hover {
  color: #1d4ed8;
  border-color: #93c5fd;
  background: #f8fbff;
}

.changes-bell-btn:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.changes-bell-btn .bell-icon {
  font-size: 1.05rem;
}

.changes-bell-btn.has-changes {
  color: #b45309;
  border-color: #fbbf24;
  background: #fffbeb;
  animation: bell-glow 1.8s ease-in-out infinite;
}

.changes-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #dc2626;
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
  box-shadow: 0 0 0 2px #ffffff;
}

@keyframes bell-glow {
  0%,
  100% {
    box-shadow:
      0 0 0 0 rgba(251, 191, 36, 0.35),
      0 0 0 0 rgba(245, 158, 11, 0.2);
  }
  50% {
    box-shadow:
      0 0 0 6px rgba(251, 191, 36, 0.18),
      0 0 18px 2px rgba(245, 158, 11, 0.45);
  }
}
</style>
