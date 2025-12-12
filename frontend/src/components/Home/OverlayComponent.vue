<template>
    <div class="max-dimensions d-flex justify-content-center align-items-center">
        <UploadComponent v-if="upload" @close-click="closeUpload" @Upload-done="uploadCompleted"/>
        <UploadedFilePreview v-if="uploadedFilePreview" @close-click="closeUpload" @files-mapped="openMapperComp" @open-uploader="openUploaderComp" @close-preview="closePreview"/>
        <MapperComponent v-if="openMapper" :data="mapped_data"  @close-click="closeUpload" @open-uploader="openUploaderComp"/>
    </div>
</template>
<script setup>
import UploadComponent from './UploadComponent.vue';
import UploadedFilePreview from './UploadedFilePreview.vue';
import MapperComponent from './MapperComponent.vue';
import {ref} from 'vue';
import { useFileStore } from '@/stores/fileStore';

const fileStore=useFileStore()

const upload=ref(true)
const uploadedFilePreview=ref(false)
const openMapper=ref(false)
const emit= defineEmits(['close-upload'])
function closeUpload(){
    emit('close-upload')
    fileStore.clearAllData()
}
const mapped_data=ref('')
function uploadCompleted(){
    upload.value=false
    uploadedFilePreview.value=true

}
function closePreview(){
    uploadedFilePreview.value=false
}
function openMapperComp(data){
    uploadedFilePreview.value=false
    mapped_data.value=data.data
    openMapper.value=true

}

function openUploaderComp(){
    openMapper.value=false
    upload.value=true


}

</script>