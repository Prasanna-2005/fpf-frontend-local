<template>
    <div class="max-dimensions d-flex justify-content-center align-items-center">
        <UploadComponent v-if="upload" @close-click="closeUpload" @Upload-done="uploadCompleted"/>
        <UploadedFilePreview v-if="uploadedFilePreview" @close-click="closeUpload"/>
        <!-- <loaderComponent :percentage="50" /> -->
        <MapperComponent/>
    </div>
</template>
<script setup>
import UploadComponent from './UploadComponent.vue';
import UploadedFilePreview from './UploadedFilePreview.vue';
// import loaderComponent from './loaderComponent.vue';
import MapperComponent from './MapperComponent.vue';
import {ref} from 'vue';
const upload=ref(false)
const uploadedFilePreview=ref(false)
const emit= defineEmits(['close-upload'])
function closeUpload(){
    emit('close-upload')
}
function uploadCompleted(){
    upload.value=false
    uploadedFilePreview.value=true
}
</script>