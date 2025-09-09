<template>
        <div class="d-flex" >
            <div >
                <SideBarComponent @add-fund="openAddFundPopUp=true" />
            </div>
            <div class="flex-grow-1 d-flex flex-column justify-content-center align-items-start position-relative">
                <topBarComponent @selected-fund="selectFund"  />
                <EditSectionComponent :fundName="fundName" @open-upload="openUploadPopUp=true" />
            </div>
            <div v-if="openAddFundPopUp" class="backdrop">
                <addFundComponent @cancel-add-fund="openAddFundPopUp=false"/>
            </div> 
            <div v-if="openUploadPopUp" class="backdrop">
                <UploadComponent @close-click="openUploadPopUp=false"/>
            </div> 
            
        </div>
</template>

<script setup>
import SideBarComponent from '@/components/Home/SideBarComponent.vue';
import topBarComponent from '@/components/Editor/topBarComponent.vue';
import EditSectionComponent from '@/components/Editor/EditSectionComponent.vue';
import addFundComponent from '@/components/popUps/addFundComponent.vue';
import UploadComponent from '@/components/Home/UploadComponent.vue';
import {ref} from 'vue';

const openAddFundPopUp=ref(false)
const openUploadPopUp=ref(false)
const fundName=ref('')
function selectFund(fund_name){
    fundName.value=fund_name
}



</script>

<style scoped>

   

</style>