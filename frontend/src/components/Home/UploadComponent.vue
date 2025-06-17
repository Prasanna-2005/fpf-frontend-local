<template>
    <div class="upload-container d-flex flex-column gap-2 custom-view"  >
        <h3>Upload Files</h3>
        <div>
            <label for="filing_name"  class="form-label">Filing Name*</label>
            <input type="text" class="form-control" id="filing_name" placeholder="Unique Name" v-model="filingName">
        </div>
        <div class="dropzone-container">
            <div class="max-dimensions">
                <div class="max-dimensions">
                    <div class="max-dimensions d-flex justify-content-center align-items-center">
                    <div class="DropZone max-dimensions d-flex justify-content-center align-items-center">
                        <div v-bind="getRootProps()" class="w-100 max-dimensions d-flex justify-content-center align-items-center flex-column">
                        <input v-bind="getInputProps()" class="w-100" />
                        <font-awesome-icon class="icon me-2" icon="cloud-arrow-up" style="font-size: 4em;" />
                        <h5 class="dropMessage">Drop files here</h5>
                        <p>Supported Format:XLSX, XLS, ZIP</p>
                        <p><b>OR</b></p>
                        <button class="btn" style="color:blue">Browse files</button>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
        </div>
        <div class="d-flex justify-content-end gap-2">
            <button class="btn" @click="$emit('close-click')">Cancel</button>
        </div>
    </div>
</template>       

<script setup>
import { useDropzone } from "vue3-dropzone";
import { useFileStore } from '@/stores/fileStore'
import {ref} from 'vue'
const fileStore = useFileStore()
const filingName=ref('')
const emit=defineEmits(['Upload-done'])

function onDrop(acceptedFiles) {
    fileStore.addFiles(filingName,acceptedFiles)

    if( filingName.value!=''){
        emit('Upload-done')
    }
}
const { getRootProps, getInputProps, ...rest } = useDropzone({ onDrop });



</script>

<style scoped>
.dropzone-container{
    height:70%;
    border: 2px dashed grey;
    border-radius:10px ;
    background-color: #FAF9F6;
    width: 100%;
}
.upload-container{    
     width: 70%; 
     height: 70%; 
     padding: 20px; 
     background-color: white;
     border-radius: 15px;
}
.form-control{
    width: 20% !important;
}
.form-label{
    font-weight: bold;
}
</style>
