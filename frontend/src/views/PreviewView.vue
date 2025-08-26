<template>
    <div class="d-flex" >
            <div >
                <SideBarComponent  @add-fund="openAddFundPopUp=true"/>
            </div>
            <div class="flex-grow-1 d-flex flex-column justify-content-center align-items-start position-relative">
                <topBarComponent @selected-fund="selectFund"  />
                <previewComponent @create-copy="createCopyPopUp=true" @approve="approvePopUp=true" />
            </div> 
            <div v-if="createCopyPopUp" class="backdrop">
                    <popUpComponent  type="createCopy"  @remove-pop-up="createCopyPopUp = false" defaultCopyName="FinancialPaper24-25: Copy"/>
            </div>
            <div v-if="approvePopUp" class="backdrop">
                    <popUpComponent  type="approveFiling"  @remove-pop-up="approvePopUp = false" />
            </div>
            <div v-if="openAddFundPopUp" class="backdrop">
                    <addFundComponent @cancel-add-fund="openAddFundPopUp=false"/>
            </div>

        </div>
    
</template>

<script setup>
import SideBarComponent from '@/components/Home/SideBarComponent.vue';
import topBarComponent from '@/components/Editor/topBarComponent.vue';
import previewComponent from '@/components/Preview/previewComponent.vue';
import popUpComponent from '@/components/popUps/popUpComponent.vue';
import addFundComponent from '@/components/popUps/addFundComponent.vue';
import {ref} from 'vue'

const openAddFundPopUp=ref(false)
const createCopyPopUp=ref(false)
const approvePopUp=ref(false)
</script>