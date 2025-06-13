<template>
    <div >
        <UploadComponent @close-click="closeUpload"/>
    </div>
</template>
<script setup>
import UploadComponent from './UploadComponent.vue';

const emit= defineEmits(['close-upload'])
function closeUpload(){
    emit('close-upload')
}
</script>