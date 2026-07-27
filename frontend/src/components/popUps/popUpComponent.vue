<template>
  <div class="preview-modal" role="dialog" aria-modal="true">
    <button type="button" class="modal-close" aria-label="Close" @click="deletePopUp">
      <font-awesome-icon icon="xmark" />
    </button>

    <!-- delete user popup -->
    <div v-if="type == 'deleteUser'" class="modal-body">
      <h2>Are you sure you want to delete <strong>{{ userNameToBeDeleted }}</strong>?</h2>
      <div class="modal-actions">
        <button type="button" class="btn-no" @click="deletePopUp">No</button>
        <button type="button" class="btn-yes" @click="deleteUser(userIdToBeDeleted)">Yes</button>
      </div>
    </div>

    <!-- create copy popup -->
    <div v-if="type == 'createCopy'" class="modal-body">
      <h2>Create Copy</h2>
      <label class="field-label" for="copyName">Filing Name</label>
      <input id="copyName" v-model="nameOfCopyfiling" type="text" class="text-input" />
      <div class="modal-actions">
        <button type="button" class="btn-dashboard" @click="createCopy">Create Copy</button>
      </div>
    </div>

    <!-- sign off popup -->
    <div v-if="type == 'signOff'" class="modal-body">
      <h2>Filing sent for sign-off</h2>
      <div class="modal-actions">
        <button type="button" class="btn-dashboard" @click="downloadPdf">Download PDF Report</button>
      </div>
    </div>

    <!-- approve filing popup -->
    <div v-if="type == 'approveFiling'" class="modal-body">
      <template v-if="!downloadXMl">
        <h2>Are you sure you want to approve this filing?</h2>
        <p>Once approved, you can download the XML from the next step.</p>
        <div class="modal-actions">
          <button type="button" class="btn-no" @click="deletePopUp">No</button>
          <button type="button" class="btn-yes" :disabled="approving" @click="approveFiling('Approved')">
            <span
              v-if="approving"
              class="ui-spinner"
              role="status"
              aria-hidden="true"
            ></span>
            {{ approving ? 'Approving…' : 'Yes' }}
          </button>
        </div>
      </template>
      <template v-else>
        <div class="modal-icon">
          <font-awesome-icon icon="check" />
        </div>
        <h2>Your filing has been approved</h2>
        <p>Download the XML file below to continue.</p>
        <div class="modal-actions">
          <button type="button" class="btn-dashboard" @click="downloadXmlFileForApprovedFiling(dataForXML)">
            Download XML
          </button>
        </div>
      </template>
    </div>

    <!-- send for approval -->
    <div v-if="type == 'sendForApproval'" class="modal-body">
      <template v-if="!sentForApproval">
        <h2>Are you sure you want to send this filing for approval?</h2>
        <p>
          Once submitted, this filing will be sent for review and approval. You can continue tracking
          its status from the dashboard.
        </p>
        <div class="modal-actions">
          <button type="button" class="btn-no" @click="deletePopUp">No</button>
          <button
            type="button"
            class="btn-yes"
            :disabled="sendingForApproval"
            @click="sendForApproval('Review')"
          >
            <span
              v-if="sendingForApproval"
              class="ui-spinner"
              role="status"
              aria-hidden="true"
            ></span>
            {{ sendingForApproval ? 'Sending…' : 'Yes' }}
          </button>
        </div>
      </template>
      <template v-else>
        <div class="modal-icon">
          <font-awesome-icon icon="check" />
        </div>
        <h2>Your file has been sent for review</h2>
        <p>
          Your filing has been successfully submitted for review. You can monitor the approval status
          and recent updates from the dashboard.
        </p>
        <div class="modal-actions">
          <button type="button" class="btn-dashboard" @click="goHome">Dashboard</button>
        </div>
      </template>
    </div>

    <!-- download xml for approved filing -->
    <div v-if="type == 'downloadXmlFileForApprovedFiling'" class="modal-body">
      <h2>Please download the XML file</h2>
      <div class="modal-actions">
        <button
          type="button"
          class="btn-dashboard"
          :disabled="downloading"
          @click="downloadXmlFileForApprovedFiling"
        >
          <span
            v-if="downloading"
            class="ui-spinner light"
            role="status"
            aria-hidden="true"
          ></span>
          {{ downloading ? 'Downloading…' : 'Download XML' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api_call_methods from '@/assets/api_calls/api_calls'
import { useUserStore } from '@/stores/userStore'
import { useEditableStore } from '@/stores/responseStore'
import utils from '@/assets/utils/utils'

const responseStore = useEditableStore()
const emit = defineEmits(['removePopUp', 'filingName', 'downloadPdf', 'createCopy'])

const userStore = useUserStore()
const user_id = userStore.userID
const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  userNameToBeDeleted: {
    type: String,
    default: '',
  },
  userIdToBeDeleted: {
    type: String,
    default: '',
  },
  defaultCopyName: {
    type: String,
    default: '',
  },
  filingId: {
    type: String,
    default: '',
  },
})

const approving = ref(false)
const downloadXMl = ref(false)
const dataForXML = ref({})
const nameOfCopyfiling = ref(props.defaultCopyName)
const downloading = ref(false)
const sentForApproval = ref(false)
const sendingForApproval = ref(false)

function deletePopUp() {
  emit('removePopUp')
}
function createCopy() {
  emit('createCopy', nameOfCopyfiling)
}
function downloadPdf() {
  emit('downloadPdf')
}
function goHome() {
  window.location = '/home'
}

async function approveFiling(status) {
  try {
    approving.value = true
    await api_call_methods.update_status(user_id, props.filingId, status)
    responseStore.setStatus(status)
    const result = await api_call_methods.get_xml_data(user_id, props.filingId)
    downloadXMl.value = true
    dataForXML.value = result.data
  } catch (error) {
    console.log(error)
  } finally {
    approving.value = false
  }
}

async function downloadXmlFileForApprovedFiling() {
  downloading.value = true
  try {
    const result = await api_call_methods.get_xml_data(user_id, props.filingId)
    utils.downloadXMLFile(result.data)
  } catch (error) {
    console.log(error)
  } finally {
    downloading.value = false
  }
}

async function sendForApproval(status) {
  try {
    sendingForApproval.value = true
    await api_call_methods.update_status(user_id, props.filingId, status)
    responseStore.setStatus(status)
    sentForApproval.value = true
  } catch (error) {
    console.log(error)
  } finally {
    sendingForApproval.value = false
  }
}

async function deleteUser() {
  try {
    await api_call_methods.delete_user(props.userIdToBeDeleted, user_id)
  } catch (error) {
    console.log(error)
  }
}
</script>

<style scoped>
.preview-modal {
  position: relative;
  background: #fff;
  border-radius: 16px;
  padding: 32px 28px 28px;
  max-width: 460px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: #6b7280;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.modal-close:hover {
  background: #f3f4f6;
}

.modal-body h2 {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 10px;
  color: #111827;
  line-height: 1.35;
}

.modal-body p {
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.55;
  margin: 0 0 24px;
}

.field-label {
  display: block;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 600;
  margin: 12px 0 6px;
}

.text-input {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  font-family: inherit;
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-no,
.btn-yes,
.btn-dashboard {
  border-radius: 8px;
  padding: 10px 28px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  min-width: 90px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-no {
  background: #fff;
  border: 1.5px solid #dc2626;
  color: #dc2626;
}

.btn-yes {
  background: #fff;
  border: 1.5px solid #16a34a;
  color: #16a34a;
}

.btn-no:hover {
  background: #fef2f2;
}

.btn-yes:hover:not(:disabled) {
  background: #f0fdf4;
}

.btn-yes:disabled,
.btn-dashboard:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-dashboard {
  background: #1e3a8a;
  border: none;
  color: #fff;
  min-width: 140px;
}

.btn-dashboard:hover:not(:disabled) {
  background: #1e40af;
}

.modal-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #dcfce7;
  color: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;
  font-size: 1.5rem;
}

.ui-spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(22, 163, 74, 0.25);
  border-top-color: #16a34a;
  animation: ui-spin 0.7s linear infinite;
  display: inline-block;
  flex-shrink: 0;
}

.ui-spinner.light {
  border-color: rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
}

@keyframes ui-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
