<template>
  <div class="upload-container d-flex flex-column gap-2 custom-view">
    <h3>Upload Files</h3>

    <!-- Filing Name -->
    <div>
      <label for="filing_name" class="form-label">Filing Name*</label>
      <p v-if="!new_filing || upload_more" class="filing-name"><b>{{ filingName }}</b></p>
      <input 
        v-else
        type="text"
        class="f-20 form-control"
        id="filing_name"
        placeholder="Unique Name"
        v-model="filingName"
        @input="validateName"
      />
    </div>
    <p v-if="errorMessage" class="text-danger small mb-0 mt-0">{{ errorMessage }}</p>

    <!-- Dropzone -->
    <div class="dropzone-container d-flex justify-content-center align-items-center">
      <div
        v-bind="getRootProps()"
        class="w-100 d-flex justify-content-center align-items-center flex-column py-4"
      >
        <input v-bind="getInputProps()" class="w-100" />
        <font-awesome-icon icon="cloud-arrow-up" class="upload-icon mb-2" />
        <h5 class="dropMessage">Drop files here</h5>
        <p>Supported formats: XLSX, XLS, ZIP</p>
        <p><b>OR</b></p>
        <button class="btn browse-btn">Browse files</button>

        <!-- File count feedback -->
        <div v-if="files.length > 0" class="mt-3 file-count">
          <font-awesome-icon icon="check-circle" class="me-2 text-success" />
          
          <span><b>{{ files.length }}</b> file<span v-if="files.length > 1">s</span> uploaded</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="d-flex justify-content-between align-items-center mt-3">
      <div class="upload-text">
        <font-awesome-icon icon="info-circle" class="text-primary small mt-1" />
        Please upload the investment liquidity Excel file along with the fund’s quarterly data.
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm" @click="handleCancel">Cancel</button>
        <button class="btn btn-primary btn-sm" @click="submitUpload" :disabled="files.length === 0 || !filingName ||  !isNameValid">Next</button>
      </div>
    </div>


  </div>
</template>

<script setup>
import { useDropzone } from "vue3-dropzone"
import { useFileStore } from '@/stores/fileStore'
import { ref, watch} from 'vue'
import { useToast } from 'vue-toast-notification';
import { useUserStore } from '@/stores/userStore'
import api_call_methods from "@/assets/api_calls/api_calls";
const toast = useToast();
const fileStore = useFileStore()

const new_filing=ref(fileStore.getNewFilingField())
const filingName = ref(fileStore.getfilingName() || '')
const upload_more=ref(fileStore.getUploadMore())
const files = ref([])
const emit = defineEmits(['Upload-done'])

function onDrop(acceptedFiles) {

  const allowedExtensions = new Set(["xlsx", "xls", "zip","pdf"])
  const validFiles = []
  const invalidFiles = []

  acceptedFiles.forEach(file => {
    const ext = file.name.split(".").pop().toLowerCase()

    if (allowedExtensions.has(ext)) {
      validFiles.push(file)
    } else {
      invalidFiles.push(file.name)
    }
  })

  if (invalidFiles.length > 0) {
    toast.error(`Invalid file type: ${invalidFiles.join(", ")}. Only XLSX, XLS, ZIP, PDF allowed.`)
  }

  if (validFiles.length > 0) {
    files.value = [...files.value, ...validFiles]
    fileStore.addFiles(filingName.value, files.value)
  }
}


watch(filingName, (newVal) => {
  if (newVal) {
    fileStore.add_filing_name(newVal)
  }
})

function submitUpload() {
  if (filingName.value !== '' && files.value.length > 0) {
    emit('Upload-done')
  }
}
const errorMessage = ref("")
const isNameValid = ref(true)

function validateName() {
  let value = filingName.value

  // 1. Allow A–Z, 0–9, space, _, -
  const allowedPattern = /^[A-Za-z0-9 _-]*$/

  if (!allowedPattern.test(value)) {
    isNameValid.value = false
    errorMessage.value = "Allow only A–Z, 0–9, spaces, _ and -"
    filingName.value = value.replace(/[^A-Za-z0-9 _-]/g, "")
    return
  }

  value = value.replace(/\s{2,}/g, " ")


  value = value.replace(/^\s+/, "")

  filingName.value = value

  // 4. Duplicate check
  if (fileStore.isNameTaken(value.trim())) {
    isNameValid.value = false
    errorMessage.value = "Filing name already exists."
    return
  }
  isNameValid.value = true
  errorMessage.value = ""
}



const userStore=useUserStore()
const user_id=userStore.userID
async function handleCancel(){
  try{
    console.log("new filing field:",fileStore.getUploadMore())
    if (fileStore.getUploadMore()){
      console.log("cancel api call")
      console.log(filingName.value)
      const data={
      "filing_name":filingName.value,
    }
      await api_call_methods.discard_filing(data,user_id)
      toast.success("Filing cancelled!")
      fileStore.clearAllData()
    }
    emit('close-click')
  }catch(e){
    console.log(e)
  }
}
const { getRootProps, getInputProps } = useDropzone({ onDrop })
</script>

<style scoped>
.upload-container {
  width: 70%;
  max-width: 800px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: white;
  border-radius: 15px;
  overflow: hidden;
}


.dropzone-container {
  flex: 1;
  min-height: 200px;
  height: 70%;
  border: 2px dashed grey;
  border-radius: 10px;
  background-color: #FAF9F6;
  width: 100%;
  transition: border-color 0.3s, background-color 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}
.dropzone-container:hover {
  border-color: #4a90e2;
  background-color: #f9fcff;
}

.upload-icon {
  font-size: 3rem;
  color: #4a90e2;
}

.browse-btn {
  color: #4a90e2;
  font-weight: 500;
}

.file-count {
  font-size: 0.95rem;
  color: #333;
}
</style>
