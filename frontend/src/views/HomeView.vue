<template>
    <div class="d-flex main-div" >
      <SideBarComponent @add-fund="openAddFundPopUp=true" />
      <div class="flex-grow-1 dashboard-main position-relative">
        <div :class="['dashboard-content', { 'blurred': showUpload }]">
            <TableComponent :key="tableKey" @trigger-upload="openUpload" />
        </div>
        <div v-if="showUpload" class="upload-overlay-inside">
          <OverlayComponent @close-upload="closeUpload" @submit-success="onSubmitSuccess"/>
        </div>
      </div> 
      <div v-if="openAddFundPopUp" class="backdrop">
            <addFundComponent @cancel-add-fund="openAddFundPopUp=false"/>
      </div>
    </div>
</template>
  
<script setup>
import TableComponent from '@/components/Home/TableComponent.vue';
import SideBarComponent from '@/components/Home/SideBarComponent.vue';
import OverlayComponent from '@/components/Home/OverlayComponent.vue';
import addFundComponent from '@/components/popUps/addFundComponent.vue';
import {ref} from 'vue';

const showUpload = ref(false)
const openAddFundPopUp = ref(false)
const tableKey = ref(0)

function openUpload() {
  showUpload.value = true
}

function closeUpload() {
  showUpload.value = false
}

function onSubmitSuccess() {
  showUpload.value = false
  tableKey.value += 1
}
</script>
    
<style scoped>
.main-div{
  height: 100vh;
  overflow: hidden;
  background: #eef1f6;
}
.dashboard-main {
  min-width: 0;
  height: 100vh;
  overflow: hidden;
}
.dashboard-content {
  height: 100%;
  padding: 28px 32px 24px;
  overflow: hidden;
}
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
  align-items: stretch;
  justify-content: center;
  background-color: #eef1f6;
  z-index: 10;
  pointer-events: auto;
}
</style>