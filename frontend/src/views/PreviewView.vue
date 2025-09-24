<template>
    <div class="d-flex" >
            <div >
                <SideBarComponent  @add-fund="openAddFundPopUp=true"/>
            </div>
            <div  class="flex-grow-1 d-flex flex-column justify-content-center align-items-start position-relative">
                <!-- <topBarComponent @selected-fund="selectFund"  /> -->
                <div v-if="loading">Loadind PDF Preview</div>

                <previewComponent v-else @create-copy="createCopyPopUp=true" @approve="approvePopUp=true" :filingId="filing_id"/>
            </div> 
            <div v-if="createCopyPopUp" class="backdrop">
                    <popUpComponent  type="createCopy"  @remove-pop-up="createCopyPopUp = false" defaultCopyName="FinancialPaper24-25: Copy"/>
            </div>
            <div v-if="approvePopUp" class="backdrop">
                    <popUpComponent  type="approveFiling"  @remove-pop-up="approvePopUp = false" :filingId="filing_id"/>
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
import {ref,onMounted} from 'vue'
import { useUserStore } from '@/stores/userStore';
import api_call_methods from '@/assets/api_calls/api_calls';

import { useEditableStore } from '@/stores/responseStore'
import { useRoute } from 'vue-router'
const route = useRoute()
const responseStore = useEditableStore()
const filing_id=route.query.filing_id

const openAddFundPopUp=ref(false)
const createCopyPopUp=ref(false)
const approvePopUp=ref(false)

const loading=ref(true)
const userStore = useUserStore();

let data = ''
const user_id=userStore.userID
onMounted(async () => {
  try {
    loading.value=true
    const result=await api_call_methods.get_response(user_id,filing_id)
    data=result.data 
    responseStore.setResponse(data)
 
    loading.value=false
} catch (error) {
    console.error("Error fetching data:", error)
  }
})
</script>