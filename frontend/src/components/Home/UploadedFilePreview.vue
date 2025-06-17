<template>
    <div class="upload-container d-flex flex-column gap-2 custom-view"  >
        <h3>Uploaded Files</h3>
        <div>
            <label for="filing_name"  class="form-label">Filing Name*</label>
            <input type="text" class="form-control" id="filing_name" placeholder="Unique Name" disabled >
        </div>
        <div class="dropzone-container">
            <div class="max-dimensions">
                <div class="max-dimensions">
                    <div class="max-dimensions d-flex justify-content-center align-items-center">
                    <div class="DropZone max-dimensions d-flex justify-content-center align-items-center ">
                        <div class=" file-list-grid max-dimensions " style="overflow: hidden;">
                            <fileComponent v-for="(file, index) in files"
                            :key="index"
                            :filename="file.name" @remove-file="remove_file" />
                        
                        </div>
                        
                    </div>
                    </div>
                </div>
                </div>
        </div>
        <div class="d-flex justify-content-end gap-2">
            <button class="btn" @click="$emit('close-click')">Cancel</button>
            <button class="btn btn-primary" >Submit</button>
        </div>
    </div>
</template>  
<script setup>
import fileComponent from './fileComponent.vue';
import { useFileStore } from '@/stores/fileStore'
import {ref} from 'vue'
const fileStore = useFileStore()
const files=ref(fileStore.getFiles())

function remove_file(filename){
    
    fileStore.removeFile(filename)
    files.value=fileStore.getFiles()
}

</script>     

<style>
.dropzone-container{
    height:70%;
    border: 2px solid grey;
    border-radius:10px ;
    background-color: #FFF;
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
.file-list-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  overflow-y: auto;
  padding: 10px;
}

</style>