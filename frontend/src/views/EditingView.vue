<template>
  <div class="d-flex main-div editing-layout">
    <SideBarComponent @add-fund="openAddFundPopUp = true" />

    <PageStateLoader
      v-if="loading"
      :loading="loader"
      title="Loading Editor…"
      message="Please wait while we prepare your filing data."
      :error-title="pageErrorTitle"
      :error-message="pageErrorMessage"
    />

    <div v-else class="editor-main">
      <topBarComponent
        :fundNames="fundNames"
        :status="filingStatus"
        :downloading="downloadInputFiles"
        :headVersion="headVersion"
        :selectedVersion="selectedVersion"
        :availableVersions="availableVersions"
        @selected-fund="selectFund"
        @pdf-preview="goToPreview"
        @input-files="downloadInput"
        @change-version="onChangeVersion"
      />
      <EditSectionComponent
        :fundName="fundName"
        :filingId="filing_id"
        :editedFlags="editedFlags"
        :readOnly="editorReadOnly"
        :filingVersion="selectedVersion"
        @open-upload="openUploadPopUp = true"
        @refresh-data="refreshData"
        @open-history="openHistory"
        @open-computation-logs="openComputationLogs"
        @open-mapped-files="openMappedFiles"
      />
    </div>

    <addFundComponent
      v-if="openAddFundPopUp"
      @cancel-add-fund="openAddFundPopUp = false"
    />
    <div v-if="openUploadPopUp" class="backdrop">
      <OverlayComponent @close-upload="closeUpload" @submit-success="goToDashboard" />
    </div>
    <div v-if="openComputationLogsPopUp">
      <computationLogsPopUpComp
        :field="computationLogs"
        @close-click="openComputationLogsPopUp = false"
      />
    </div>
    <div v-if="openhistoryPopUp">
      <historyComponent
        :fieldData="history"
        :fieldNo="fieldNo"
        :fieldType="fieldType"
        :hasTableData="hasTableData"
        :loading="historyLoading"
        @close-click="openhistoryPopUp = false"
      />
    </div>
    <div v-if="openMappedFilesPopUp">
      <mappedFilesPopUpComp
        @close-click="openMappedFilesPopUp = false"
        :userId="user_id"
        :version="selectedVersion"
      />
    </div>
  </div>
</template>

<script setup>
import SideBarComponent from '@/components/Home/SideBarComponent.vue'
import topBarComponent from '@/components/Editor/topBarComponent.vue'
import EditSectionComponent from '@/components/Editor/EditSectionComponent.vue'
import addFundComponent from '@/components/popUps/addFundComponent.vue'
import computationLogsPopUpComp from '@/components/popUps/computationLogsPopUpComp.vue'
import OverlayComponent from '@/components/Home/OverlayComponent.vue'
import PageStateLoader from '@/components/common/PageStateLoader.vue'
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import api_call_methods from '@/assets/api_calls/api_calls'
import { useEditableStore } from '@/stores/responseStore'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { useFileStore } from '@/stores/fileStore'
import historyComponent from '@/components/popUps/historyComponent.vue'
import mappedFilesPopUpComp from '@/components/popUps/mappedFilesPopUpComp.vue'
import utils from '@/assets/utils/utils'

const route = useRoute()
const router = useRouter()

const openAddFundPopUp = ref(false)
const openUploadPopUp = ref(false)
const fundName = ref('')
const loading = ref(true)
const fundNames = ref([])
const toast = useToast()
const loader = ref(true)
const pageErrorTitle = ref('Failed to Load Editor')
const pageErrorMessage = ref('Something went wrong while loading the editor. Please check your connection or return to the dashboard.')
const openComputationLogsPopUp = ref(false)
const responseStore = useEditableStore()
const openhistoryPopUp = ref(false)
const fileStore = useFileStore()
const history = ref({})
const historyLoading = ref(false)
let historyRequest = 0
const fieldNo = ref('')
const historyFundId = ref('')
const fieldType = ref('')
const hasTableData = ref(false)
const openMappedFilesPopUp = ref(false)
const downloadInputFiles = ref(false)
const headVersion = ref(1)
const selectedVersion = ref(1)
const availableVersions = ref([1])
const editorReadOnly = computed(() => selectedVersion.value !== headVersion.value)
/** fieldNo -> true when that question's current answer is an edit */
const editedFlags = reactive({})

fileStore.add_filing_name(localStorage.getItem('filingName'))
fileStore.updateNewFiling()
const userStore = useUserStore()
const filing_id = route.query.filing_id
let data = ''
const user_id = userStore.userID
const computationLogs = ref({})

const filingStatus = computed(() => responseStore.getStatus() || 'Draft')

function hasCurrentEdit(historyData, version) {
  if (!historyData || typeof historyData !== 'object') return false
  const wanted = Number(version) || 0
  return Object.values(historyData).some((entries) => {
    if (!Array.isArray(entries) || !entries.length) return false
    const pool = wanted
      ? entries.filter((entry) => Number(entry.version || 1) === wanted)
      : entries
    const current = pool.find((entry) => entry.is_current_value)
    return Boolean(current && (current.is_edit || current.manually_edited))
  })
}

onMounted(async () => {
  try {
    loading.value = true
    load_computations()
    await set_response()
    loading.value = false
  } catch (error) {
    loading.value = false
    loader.value = false
    const message = error?.response?.data?.message
    if (error?.response?.status === 409 && message) {
      pageErrorTitle.value = 'Extraction Not Completed'
      pageErrorMessage.value = message
    }
    console.error('Error fetching data:', error)
  }
})

async function set_response() {
  const result = await api_call_methods.get_response(user_id, filing_id)
  applyFilingPayload(result.data)
  fundName.value = fundNames.value[0]
}

async function load_computations() {
  try {
    responseStore.startComputationsLoad()
    const computations = await api_call_methods.get_computations(user_id, filing_id)
    responseStore.setComputations(computations.data)
  } catch (err) {
    console.error('Error fetching computation logs:', err)
    responseStore.setComputations({ funds: [] })
  }
}

function applyFilingPayload(payload) {
  data = payload
  const funds = data.funds || []
  fundNames.value = funds.map((fund) => fund.fund_name)
  responseStore.setResponse(data)
  headVersion.value = Number(data.current_version) || 1
  selectedVersion.value = Number(data.version) || headVersion.value
  availableVersions.value = Array.isArray(data.available_versions) && data.available_versions.length
    ? data.available_versions
    : [headVersion.value]
}

function selectFund(fund_name) {
  fundName.value = fund_name
  // Clear parent flags for previous fund; editor will re-prefetch
  Object.keys(editedFlags).forEach((key) => delete editedFlags[key])
}

async function update_response() {
  const result = await api_call_methods.get_response(user_id, filing_id, selectedVersion.value)
  applyFilingPayload(result.data)
}

async function onChangeVersion(version) {
  const result = await api_call_methods.get_response(user_id, filing_id, version)
  applyFilingPayload(result.data)
}

async function refreshData(done) {
  try {
    await update_response()
  } finally {
    if (done) done()
  }
}

function openComputationLogs(payload) {
  computationLogs.value = payload
  openComputationLogsPopUp.value = true
}

function openMappedFiles() {
  openMappedFilesPopUp.value = true
}

function closeUpload() {
  openUploadPopUp.value = false
}

function goToDashboard() {
  openUploadPopUp.value = false
  router.push({ name: 'home' })
}

function applyHistory(field, data) {
  history.value = data || {}
  editedFlags[field] = hasCurrentEdit(data, selectedVersion.value)
}

async function openHistory(payload) {
  const request = ++historyRequest
  fieldNo.value = payload.fieldNo
  historyFundId.value = payload.fundId
  fieldType.value = payload.fieldType
  hasTableData.value = Boolean(payload.hasTableData)
  openhistoryPopUp.value = true

  const cached = responseStore.questionHistory(
    payload.filingId,
    payload.fundId,
    payload.fieldNo
  )
  if (cached) {
    applyHistory(payload.fieldNo, cached)
    historyLoading.value = false
    return
  }

  history.value = {}
  historyLoading.value = true
  try {
    const data = await responseStore.loadQuestionHistory(user_id, {
      filingId: payload.filingId,
      fundId: payload.fundId,
      fieldNo: payload.fieldNo,
    }, { skipErrorToast: false })
    if (request !== historyRequest) return
    applyHistory(payload.fieldNo, data)
  } catch (error) {
    if (request !== historyRequest) return
    console.error('Error loading history:', error)
    history.value = {}
  } finally {
    if (request === historyRequest) historyLoading.value = false
  }
}

watch(
  () => responseStore.questionHistory(filing_id, historyFundId.value, fieldNo.value),
  (data) => {
    if (!openhistoryPopUp.value || !data) return
    applyHistory(fieldNo.value, data)
    historyLoading.value = false
  }
)

function goToPreview() {
  router.push({ name: 'preview', query: { filing_id } })
}

async function downloadInput() {
  try {
    downloadInputFiles.value = true
    toast.info('Downloading Input files....')
    const filing_name = localStorage.getItem('filingName')
    const response = await api_call_methods.download_input(user_id, filing_name)
    utils.downloadInputZip(response, filing_name)
    toast.success('Input files downloaded successfully')
  } catch (error) {
    console.error(error)
  } finally {
    downloadInputFiles.value = false
  }
}
</script>

<style scoped>
.editing-layout {
  min-height: 100vh;
  background: #eef1f6;
}

.editor-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  overflow: hidden;
  background: #eef1f6;
}
</style>
