<template>
  <div class="d-flex main-div editing-layout">
    <SideBarComponent @add-fund="openAddFundPopUp = true" />

    <PageStateLoader
      v-if="loading"
      :loading="loader"
      title="Loading Editor…"
      message="Please wait while we prepare your filing data."
      error-title="Failed to Load Editor"
      error-message="Something went wrong while loading the editor. Please check your connection or return to the dashboard."
    />

    <div v-else class="editor-main">
      <topBarComponent
        :fundNames="fundNames"
        :status="filingStatus"
        :downloading="downloadInputFiles"
        @selected-fund="selectFund"
        @pdf-preview="goToPreview"
        @input-files="downloadInput"
      />
      <EditSectionComponent
        :fundName="fundName"
        :filingId="filing_id"
        :editedFlags="editedFlags"
        @open-upload="openUploadPopUp = true"
        @refresh-data="refreshData"
        @open-history="openHistory"
        @open-computation-logs="openComputationLogs"
        @open-mapped-files="openMappedFiles"
      />
    </div>

    <div v-if="openAddFundPopUp" class="backdrop">
      <addFundComponent @cancel-add-fund="openAddFundPopUp = false" />
    </div>
    <div v-if="openUploadPopUp" class="backdrop">
      <OverlayComponent @close-upload="closeUpload" @submit-success="closeUpload" />
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
        @close-click="openhistoryPopUp = false"
      />
    </div>
    <div v-if="openMappedFilesPopUp">
      <mappedFilesPopUpComp @close-click="openMappedFilesPopUp = false" :userId="user_id" />
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
import { ref, computed, reactive, onMounted } from 'vue'
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
const openComputationLogsPopUp = ref(false)
const responseStore = useEditableStore()
const openhistoryPopUp = ref(false)
const fileStore = useFileStore()
const history = ref({})
const fieldNo = ref('')
const fieldType = ref('')
const openMappedFilesPopUp = ref(false)
const downloadInputFiles = ref(false)
/** fieldNo -> true when history length > 1 */
const editedFlags = reactive({})

fileStore.add_filing_name(localStorage.getItem('filingName'))
fileStore.updateNewFiling()
const userStore = useUserStore()
const filing_id = route.query.filing_id
let data = ''
const user_id = userStore.userID
const computationLogs = ref({})

const filingStatus = computed(() => responseStore.getStatus() || 'Draft')

function hasHistoryEdits(historyData) {
  if (!historyData || typeof historyData !== 'object') return false
  return Object.values(historyData).some(
    (entries) => Array.isArray(entries) && entries.length > 1
  )
}

onMounted(async () => {
  try {
    loading.value = true
    await update_status_to_draft()
    await set_response()
    loading.value = false
  } catch (error) {
    loader.value = false
    console.error('Error fetching data:', error)
  }
})

async function update_status_to_draft() {
  await api_call_methods.update_status(user_id, filing_id, 'Draft')
  responseStore.setStatus('Draft')
}

async function set_response() {
  const result = await api_call_methods.get_response(user_id, filing_id)
  data = result.data

  const funds = data.funds
  fundNames.value = funds.map((fund) => fund.fund_name)
  responseStore.setResponse(data)
  fundName.value = fundNames.value[0]
  const computations = await api_call_methods.get_computations(user_id, filing_id)
  responseStore.setComputations(computations.data)
}

function selectFund(fund_name) {
  fundName.value = fund_name
  // Clear parent flags for previous fund; editor will re-prefetch
  Object.keys(editedFlags).forEach((key) => delete editedFlags[key])
}

async function update_response() {
  const result = await api_call_methods.get_response(user_id, filing_id)
  data = result.data
  const funds = data.funds
  fundNames.value = funds.map((fund) => fund.fund_name)
  responseStore.setResponse(data)
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

async function openHistory(payload) {
  fieldNo.value = payload.fieldNo
  fieldType.value = payload.fieldType
  const result = await api_call_methods.get_history(user_id, payload)
  history.value = result.data
  editedFlags[payload.fieldNo] = hasHistoryEdits(result.data)
  openhistoryPopUp.value = true
}

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
  } catch {
    toast.error('Failed to download input files')
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
