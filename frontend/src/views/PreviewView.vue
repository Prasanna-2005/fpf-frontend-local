<template>
  <div class="d-flex main-div preview-layout">
    <SideBarComponent @add-fund="openAddFundPopUp = true" />

    <div
      v-if="loading"
      class="flex-grow-1 d-flex flex-column justify-content-center align-items-center position-relative"
    >
      <div v-if="loader" class="loader-box text-center p-4 mt-3">
        <span
          class="spinner-border text-primary mb-3"
          style="width: 2.5rem; height: 2.5rem"
          role="status"
        ></span>
        <h6 class="fw-semibold text-primary mb-1">Loading PDF Preview Page...</h6>
        <p class="text-muted mb-0">Please wait while we prepare your data.</p>
      </div>
      <div v-else class="error-box text-center p-4 mt-3">
        <font-awesome-icon icon="info-circle" class="text-danger fs-1 mb-3" />
        <h5 class="fw-semibold mb-2">Failed to Load PDF Preview Page</h5>
        <p class="text-muted mb-4">
          Something went wrong while loading the PDF Preview. Please check your connection or return
          to the home page.
        </p>
        <a href="/home" class="home-btn">
          <font-awesome-icon class="icon me-2" icon="file-lines" /> Dashboard
        </a>
      </div>
    </div>

    <div v-else class="preview-main">
      <previewComponent
        :filingId="filing_id"
        @create-copy="createCopyPopUp = true"
        @approve="approvePopUp = true"
        @send-for-approval="sendForApproval = true"
        @download-xml="downloadXMl = true"
        @open-mapped-files="openMappedFiles"
      />
    </div>

    <div v-if="createCopyPopUp" class="preview-backdrop">
      <popUpComponent
        type="createCopy"
        @remove-pop-up="createCopyPopUp = false"
        defaultCopyName="FinancialPaper24-25: Copy"
      />
    </div>
    <div v-if="approvePopUp" class="preview-backdrop">
      <popUpComponent type="approveFiling" @remove-pop-up="approvePopUp = false" :filingId="filing_id" />
    </div>
    <div v-if="sendForApproval" class="preview-backdrop">
      <popUpComponent
        type="sendForApproval"
        @remove-pop-up="sendForApproval = false"
        :filingId="filing_id"
      />
    </div>
    <div v-if="downloadXMl" class="preview-backdrop">
      <popUpComponent
        type="downloadXmlFileForApprovedFiling"
        @remove-pop-up="downloadXMl = false"
        :filingId="filing_id"
      />
    </div>
    <div v-if="openMappedFilesPopUp">
      <mappedFilesPopUpComp @close-click="openMappedFilesPopUp = false" :userId="user_id" />
    </div>
    <div v-if="openAddFundPopUp" class="preview-backdrop">
      <addFundComponent @cancel-add-fund="openAddFundPopUp = false" />
    </div>
  </div>
</template>

<script setup>
import SideBarComponent from '@/components/Home/SideBarComponent.vue'
import previewComponent from '@/components/Preview/previewComponent.vue'
import popUpComponent from '@/components/popUps/popUpComponent.vue'
import addFundComponent from '@/components/popUps/addFundComponent.vue'
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import api_call_methods from '@/assets/api_calls/api_calls'
import mappedFilesPopUpComp from '@/components/popUps/mappedFilesPopUpComp.vue'
import { useEditableStore } from '@/stores/responseStore'
import { useFileStore } from '@/stores/fileStore'
import { useRoute } from 'vue-router'

const route = useRoute()
const responseStore = useEditableStore()
const fileStore = useFileStore()
const filing_id = route.query.filing_id

const openAddFundPopUp = ref(false)
const createCopyPopUp = ref(false)
const approvePopUp = ref(false)
const sendForApproval = ref(false)
const downloadXMl = ref(false)
const loading = ref(true)
const loader = ref(true)
const userStore = useUserStore()

const openMappedFilesPopUp = ref(false)
const user_id = userStore.userID

fileStore.add_filing_name(localStorage.getItem('filingName'))
fileStore.updateNewFiling()

onMounted(async () => {
  try {
    loading.value = true
    const result = await api_call_methods.get_response(user_id, filing_id)
    responseStore.setResponse(result.data)
    loading.value = false
  } catch (error) {
    loader.value = false
    console.error('Error fetching data:', error)
  }
})

function openMappedFiles() {
  openMappedFilesPopUp.value = true
}
</script>

<style scoped>
.preview-layout {
  min-height: 100vh;
  background: #eef1f6;
}

.preview-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  overflow: hidden;
  background: #eef1f6;
}

.preview-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 24px;
}

.error-box,
.loader-box {
  background-color: #ffffff;
  border: 1px solid #e3e6ea;
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  max-width: 420px;
  width: 90%;
}

.loader-box h6 {
  color: #1e3a8a;
}

.home-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #1e3a8a;
  color: #fff;
  font-weight: 500;
  padding: 0.6rem 1.4rem;
  border-radius: 0.5rem;
  text-decoration: none;
}

.home-btn:hover {
  background-color: #1e40af;
  color: #fff;
}
</style>
