<template>
        <div class="d-flex main-div" >
            <div >
                <SideBarComponent @add-fund="openAddFundPopUp=true" />
            </div>
            <div v-if="loading" class="flex-grow-1 d-flex flex-column justify-content-center align-items-center position-relative">
                    <div v-if="loader" class="loader-box text-center p-4 mt-3">
                        <span class="spinner-border text-primary mb-3" style="width: 2.5rem; height: 2.5rem;" role="status"></span>
                        <h6 class="fw-semibold text-primary mb-1">Loading Editor Page...</h6>
                        <p class="text-muted mb-0">Please wait while we prepare your data.</p>
                    </div>
                    <div v-else class="error-box text-center p-4 mt-3">
                        <font-awesome-icon icon="triangle-exclamation" class="text-danger fs-1 mb-3" />
                        <h5 class="fw-semibold mb-2">Failed to Load Editor Page</h5>
                        <p class="text-muted mb-4">
                        Something went wrong while loading the editor. Please check your connection or return to the home page.
                        </p>
                        <a href="/home" class="home-btn">
                        <font-awesome-icon class="icon me-2" icon="file-lines" /> Dashboard
                        </a>
                    </div>
                </div>
            <div v-else class="flex-grow-1 d-flex flex-column justify-content-center align-items-start position-relative">
                
                
                <topBarComponent @selected-fund="selectFund" :fundNames="fundNames" />
                <EditSectionComponent :fundName="fundName" @open-upload="openUploadPopUp=true" :filingId="filing_id" @refresh-data="refreshData" />
                
                
            </div>
            <div v-if="openAddFundPopUp" class="backdrop">
                <addFundComponent @cancel-add-fund="openAddFundPopUp=false"/>
            </div> 
            <div v-if="openUploadPopUp" class="backdrop">
                  <OverlayComponent  @close-upload="closeUpload"/>
            </div> 
            
        </div>
</template>

<script setup>
import SideBarComponent from '@/components/Home/SideBarComponent.vue';
import topBarComponent from '@/components/Editor/topBarComponent.vue';
import EditSectionComponent from '@/components/Editor/EditSectionComponent.vue';
import addFundComponent from '@/components/popUps/addFundComponent.vue';
// import UploadComponent from '@/components/Home/UploadComponent.vue';
import OverlayComponent from '@/components/Home/OverlayComponent.vue';
import {ref,onMounted} from 'vue';
import { useUserStore } from '@/stores/userStore';
import api_call_methods from '@/assets/api_calls/api_calls';
import { useEditableStore } from '@/stores/responseStore'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toast-notification';
import { useFileStore } from '@/stores/fileStore';
const route = useRoute()

const message=ref('Please wait loading editor....')
const openAddFundPopUp=ref(false)
const openUploadPopUp=ref(false)
const fundName=ref('')
const loading=ref('true')
const fundNames=ref([])
const toast=useToast()
const loader=ref('true')

console.log(localStorage.getItem('filingName'))
const responseStore = useEditableStore()

const fileStore=useFileStore()

fileStore.add_filling_name(localStorage.getItem('filingName'))
fileStore.updateNewFiling()
const userStore = useUserStore();
const filing_id=route.query.filing_id
let data = ''
const user_id=userStore.userID
onMounted(async () => {
  try {
    loading.value=true
    await update_status_to_draft()
    await set_response()
    loading.value=false
} catch (error) {
    loader.value=false
    console.error("Error fetching data:", error)
  }
})
async function update_status_to_draft(){
  const result=await api_call_methods.update_status(user_id,filing_id,'Draft')
  responseStore.setStatus('Draft')
}

async function set_response(){
    const result=await api_call_methods.get_response(user_id,filing_id)
    data=result.data 
    console.log(data)
    const funds=data.funds
    fundNames.value = funds.map(fund => fund.fund_name);
    responseStore.setResponse(data)
    fundName.value=fundNames.value[0]
}

function selectFund(fund_name){
    fundName.value=fund_name
}


async function update_response(){
    const result=await api_call_methods.get_response(user_id,filing_id)
    data=result.data 
    console.log(data)
    const funds=data.funds
    fundNames.value = funds.map(fund => fund.fund_name);
    responseStore.setResponse(data)
}

async function refreshData(done) {
  try {
    await update_response()  
    console.log('confirmation from parent')
  } finally {
    if (done) done()    
  }
}


function closeUpload(){
  openUploadPopUp.value=false
}

</script>

<style scoped>
.error-box {
  background-color: #ffffff;
  border: 1px solid #e3e6ea;
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  max-width: 420px;
  width: 90%;
  animation: fadeIn 0.4s ease-in-out;
}

.home-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #0d6efd; /* primary blue */
  color: #fff;
  font-weight: 500;
  padding: 0.6rem 1.4rem;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 3px 6px rgba(13, 110, 253, 0.15);
}

.home-btn:hover {
  background-color: #0b5ed7;
  box-shadow: 0 5px 12px rgba(13, 110, 253, 0.3);
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}.loader-box,
.error-box {
  background-color: #ffffff;
  border: 1px solid #e3e6ea;
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  max-width: 420px;
  width: 90%;
  animation: fadeIn 0.4s ease-in-out;
}


.loader-box h6 {
  color: #0d6efd;
  letter-spacing: 0.3px;
}

.loader-box p {
  font-size: 0.9rem;
  color: #6c757d;
}

/* Home button (same as before) */
.home-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #0d6efd;
  color: #fff;
  font-weight: 500;
  padding: 0.6rem 1.4rem;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 3px 6px rgba(13, 110, 253, 0.15);
}

.home-btn:hover {
  background-color: #0b5ed7;
  box-shadow: 0 5px 12px rgba(13, 110, 253, 0.3);
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}



</style>