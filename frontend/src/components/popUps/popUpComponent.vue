<template>
    <div class="content-box p-4">
        <span class="close-icon d-flex justify-content-end mt-1  " @click="deletePopUp"><font-awesome-icon class="icon me-2" icon="xmark" style="font-size: 1em;" /></span>


        <!-- delete user popup -->
        <div v-if="type=='deleteUser'" class="d-flex justify-content-center  align-item-center max-dimensions flex-column">
            <h4>Are you sure you want to delete  <strong>{{ userNameToBeDeleted }}</strong>?</h4>
            <button class="btn btn-danger me-2 mt-2 mb-2 w-100" @click="deleteUser(userIdToBeDeleted)">DELETE</button>
            
        </div>

        <!-- create copy popup  -->
        <div v-if="type=='createCopy'" class="p-4 max-dimensions ">
            <div class="d-flex justify-content-center  align-item-center max-dimensions flex-column">
                <h4><b>Create Copy</b></h4>
                
                
                <div class="mt-3">
                    <label for="copyName" class="form-label">Filing Name</label>
                    <input type="text" class="form-control border border-info" id="copyName" v-model="nameOfCopyfiling">
                </div>

                <div class="mt-3 d-flex justify-content-center max-dimension">
                    <button class="btn btn-primary me-2 mt-2 mb-2 w-100"  @click="createCopy">CREATE COPY</button>  
                </div>
            </div>

        </div>

        <!-- sign off popup-->
        <div v-if="type=='signOff'">
            <div class="d-flex justify-content-center  align-item-center max-dimensions flex-column">
                <h4><b>Filing sent for sign-off</b></h4>
                <button class="btn btn-primary me-2 mt-2 mb-2" @click="downloadPdf">DOWNLOAD PDF REPORT</button>
            </div>
        </div>

        <!-- approve filing popup  -->
        <div v-if="type=='approveFiling'" class="max-dimensions">
            <div class="d-flex justify-content-center  align-item-center max-dimensions flex-column">
                <div class="mb-4">
                <h4  >
                    <b v-if="!downloadXMl">Are you sure you want to approve this filing?</b>
                    <b v-else>Your Filing Has Been Approved. Download XML Below:</b>
                </h4>
                </div>
                 <button v-if="!downloadXMl" class="btn btn-primary " @click="approveFiling('Approved')" :disabled="approving">
                    <span v-if="approving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <span v-if="!approving ">Approve filing</span>
                    <span v-else>Approving...</span>
                </button>
                <button v-else  class="btn btn-primary" @click="downloadXmlFileForApprovedFiling(dataForXML)">
                    <span>Download XML</span>
                </button>
            </div>
        </div>
        

        <!-- send for appproval -->
        <div v-if="type=='sendForApproval'" class="max-dimensions">
            <div class="d-flex justify-content-center  align-item-center max-dimensions flex-column">
                <div class="mb-4">
                <h4>
                    <b v-if="sentForApproval">Your Filing Has Been Sent for Review.</b>
                    <b v-else>Are you sure you want to send this filing for approval?</b>
                </h4>
                </div>
                <button v-if="!sentForApproval" class="btn btn-primary" @click="sendForApproval('Review')">Send for approval</button>
                <button v-else class="btn btn-primary" @click="goHome" >
                        <font-awesome-icon class="icon me-2" icon="file-lines" /> Dashboard
                </button>
            </div>
        </div>

        <!-- download xml for approved filing -->
         <div v-if="type=='downloadXmlFileForApprovedFiling'" class="max-dimensions">
            <div class="d-flex justify-content-center  align-item-center max-dimensions flex-column">
                <div class="mb-4">
                <h4><b>Please download the XML file</b></h4>
                </div>
                <button  class="btn btn-primary " @click="downloadXmlFileForApprovedFiling" :disabled="downloading">
                    <span v-if="downloading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <span v-if="!downloading ">Download XML</span>
                    <span v-else>Downloading XML...</span>
                </button>
            </div>
        </div>

        
    </div>
</template>
<script setup>
import {ref} from 'vue'
import api_call_methods from '@/assets/api_calls/api_calls'
import { useUserStore } from '@/stores/userStore'
// import { create } from 'xmlbuilder2';
import { useEditableStore } from '@/stores/responseStore'
import utils from '@/assets/utils/utils'
const responseStore = useEditableStore()
const emit=defineEmits(['removePopUp','filingName','downloadPdf','createCopy'])

const userStore=useUserStore()
const user_id=userStore.userID
const props=defineProps({
    type:{
        type:String,
        required:true,
    },
    userNameToBeDeleted:{
        type:String,
        required:true,
    },
    userIdToBeDeleted:{
        type:String,
        required:true,
    },
    defaultCopyName:{
        type:String,
        default:''
    },
    filingId:{
        type:String,
        required:true
    },

})
const approving=ref(false)
const downloadXMl=ref(false)
const dataForXML=ref({})
const nameOfCopyfiling=ref(props.defaultCopyName)
const downloading=ref(false)
const sentForApproval=ref(false)
function deletePopUp(){
    emit('removePopUp')
}
function createCopy(){
    emit('createCopy',nameOfCopyfiling)
}
function downloadPdf(){
    emit('downloadPdf')
}
function goHome(){
    window.location='/home'
}
async function approveFiling(status){
    try{
        approving.value=true
        const data=await api_call_methods.update_status(user_id,props.filingId,status)
        responseStore.setStatus(status)
        const result=await api_call_methods.get_xml_data(user_id,props.filingId) 
        approving.value=false
        downloadXMl.value=true
        dataForXML.value=result.data
    }
    catch(error){
        console.log(error)
        
    }
}
async function downloadXmlFileForApprovedFiling(){
    downloading.value=true
    const result=await api_call_methods.get_xml_data(user_id,props.filingId)
    utils.downloadXMLFile(result.data)
    downloading.value=false
}
async function sendForApproval(status){
    try{
        responseStore.setStatus(status)
        const result=await api_call_methods.update_status(user_id,props.filingId,status)  
    }
    catch(error){
        console.log(error)
        
    }
    finally{
        sentForApproval.value=true
    }
}

async function deleteUser(){
    console.log(props.userIdToBeDeleted)
    try{
        const result=await api_call_methods.delete_user(props.userIdToBeDeleted,
            user_id) 
        console.log(result)
    }
    catch(error) {
        console.log(error)
    }
}



</script>

<style >
.content-box {
  background: white;
  border-radius: 8px;
  border: 2px solid greenyellow;
  width:350px ;
  height: 250px;
  max-width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}
</style>