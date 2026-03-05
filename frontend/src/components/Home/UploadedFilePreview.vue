<template>
  <div class="upload-container d-flex flex-column gap-3">
    <!-- Header -->
    <h3 class="section-title">Uploaded Files</h3>

    <!-- Filing Name -->
    <div>
      <label for="filing_name" class="form-label">Filing Name*</label>
      <p class="filing-name"><b>{{ filingName }}</b></p>
    </div>

    <!-- Dropzone -->
    <div class="dropzone-container d-flex justify-content-center align-items-center">
      <div class="file-list-grid">
        <fileComponent
          v-for="(file, index) in files"
          :key="index"
          :filename="file.name"
          @remove-file="remove_file"
        />
      </div>
    </div>

    <!-- Footer buttons -->
    <div class="d-flex justify-content-end gap-2 mt-2">
      <button class="btn btn-outline-secondary" @click="$emit('close-click')">Cancel</button>
      <!-- <button class="btn btn-primary" @click="upload_files()">Submit</button> -->
      <button type="submit" @click="upload_files()" class="btn btn-primary " :disabled="isLoading_uploading || isLoading_mapping">
                    <span v-if="isLoading_uploading & isLoading_mapping " class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <span v-if="!isLoading_uploading & !isLoading_mapping ">Submit</span>
                    <span v-else-if="isLoading_uploading & !isLoading_mapping ">Uploading...</span>
                    <span v-else>Mapping...</span>
                </button>
    </div>
  </div>
</template>

<script setup>
import fileComponent from './fileComponent.vue';
import { useFileStore} from '@/stores/fileStore'
import { useUserStore } from '@/stores/userStore'
import { ref } from 'vue'
import api_call_methods from '@/assets/api_calls/api_calls';
import { useToast } from 'vue-toast-notification';

const toast = useToast();

const fileStore = useFileStore()
const files = ref(fileStore.getFiles())
const filingName = fileStore.getfilingName()

const userStore=useUserStore()
const user_id=userStore.userID
const isLoading_uploading= ref(false);
const isLoading_mapping=ref(false)

const mapped_data=ref('')

const emit=defineEmits(['files-mapped','open-uploader','close-preview'])
function remove_file(filename) {
  fileStore.removeFile(filename)
  files.value = fileStore.getFiles()
}


async function upload_files(){
    try{
      isLoading_uploading.value=true
      const formData=fileStore.getFormData()
      const current_time = new Date();
      formData.append('user_id', user_id)
      // formData.append('new_filing', true)
      formData.append('filing_name', filingName)
      formData.append('timestamp', current_time.toISOString())
      await api_call_methods.upload(formData,user_id)
      const data={
        'filing_name':filingName
      }
      isLoading_mapping.value=true
      const result=await api_call_methods.map_files(data,user_id)

      mapped_data.value=result
      console.log(mapped_data.value)
      if(mapped_data===''){
        mapped_data.value={}
      }
      fileStore.clearFiles()
      
      emit('files-mapped', mapped_data.value)
    }
    catch(error){
      toast.error(error.response.data.message)
      // if(error.status=='409'){
      //   console.log(error)
      //   toast.error(error.message)
      //   fileStore.clearAllData()
      //   emit('close-preview')
      //   emit('open-uploader')
      // }
      // if(error.status=='400'){
      //   toast.error("Upload contains funds from multiple series. Please upload single series at a time")
      // }
    }
    finally{
      isLoading_uploading.value=false 
      isLoading_mapping.value=false
    
    }

}
</script>

<style scoped>
/* Container */
.upload-container {
  width: 70%;
  height: 70%;
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* Section title */
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 6px;
  margin-bottom: 10px;
  color: #333;
}

/* Filing name */
.filing-name {
  font-size: 1rem;
  color: #444;
  margin: 0;
}

/* Dropzone */
.dropzone-container {
  flex: 1;
  border: 2px dashed #bbb;
  border-radius: 10px;
  background-color: #fafafa;
  padding: 15px;
  min-height: 200px;
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.dropzone-container:hover {
  border-color: #4a90e2;
  background-color: #f9fcff;
}

.file-list-grid {
  display: grid;
  gap: 16px;
  width: 100%;
  overflow-y: auto;
  max-height: 100%;
  padding: 4px;
}


/* Buttons */
.btn {
  min-width: 100px;
}

.btn-outline-secondary {
  border-radius: 8px;
}

.btn-primary {
  border-radius: 8px;
  font-weight: 500;
}
</style>
