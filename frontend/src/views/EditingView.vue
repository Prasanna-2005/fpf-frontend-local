<template>
        <div class="d-flex main-div" >
            <div >
                <SideBarComponent @add-fund="openAddFundPopUp=true" />
            </div>
            <div v-if="loading" class="flex-grow-1 d-flex flex-column justify-content-center align-items-center position-relative">
                    <div >
                    <span v-if="loader" class="spinner-border spinner-border-sm text-primary me-2" role="status" aria-hidden="true">
                    </span>
                        {{message}}
                    </div>
                </div>
            <div v-else class="flex-grow-1 d-flex flex-column justify-content-center align-items-start position-relative">
                
                
                <topBarComponent @selected-fund="selectFund" :fundNames="fundNames" />
                <EditSectionComponent :fundName="fundName" @open-upload="openUploadPopUp=true" :filingId="filing_id" />
                
                
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
import {ref,onMounted} from 'vue';
import { useUserStore } from '@/stores/userStore';
import api_call_methods from '@/assets/api_calls/api_calls';
import { useEditableStore } from '@/stores/responseStore'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toast-notification';
const route = useRoute()

const message=ref('Please wait loading editor....')
const openAddFundPopUp=ref(false)
const openUploadPopUp=ref(false)
const fundName=ref('')
const loading=ref('true')
const fundNames=ref([])
const toast=useToast()
const loader=ref('true')

const responseStore = useEditableStore()




const userStore = useUserStore();
const filing_id=route.query.filing_id
let data = ''
const user_id=userStore.userID
onMounted(async () => {
  try {
    loading.value=true
    const result=await api_call_methods.get_response(user_id,filing_id)
    data=result.data 
    const funds=data.funds
    fundNames.value = funds.map(fund => fund.fund_name);
    responseStore.setResponse(data)
    fundName.value=fundNames.value[0]
    loading.value=false
} catch (error) {
    loader.value=false
    message.value="Failed to load editor page, Contact support"
    toast.error('Failed to load editor page')
    console.error("Error fetching data:", error)
  }
})
function selectFund(fund_name){
    fundName.value=fund_name
}



</script>

