<template>
    <div class="d-flex" >
      <div >
        <SideBarComponent />
      </div>
      <div class="flex-grow-1 d-flex justify-content-center align-items-center position-relative">
        <div :class="['table-container custom-view', { 'blurred': showUpload }]">
            <TableComponent @trigger-upload="openUpload" />
        </div>
        <div v-if="showUpload" class="upload-overlay-inside">
          <UploadComponent  @close-click="closeUpload" />
        </div>
      </div> 
    </div>
</template>
  
<script setup>
import TableComponent from '@/components/Home/TableComponent.vue';
import SideBarComponent from '@/components/Home/SideBarComponent.vue';
import UploadComponent from '@/components/Home/UploadComponent.vue';
import {ref} from 'vue';
const showUpload=ref(false)

function openUpload(){
  showUpload.value=true
}
function closeUpload(){
  showUpload.value=false
}
</script>
    
<style scoped>
.blurred {
  filter: blur(4px);
  pointer-events: none;
  user-select: none;
}

.upload-overlay-inside {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: rgba(255, 255, 255, 0.9);
  z-index: 10;
  pointer-events: auto;
}
</style>