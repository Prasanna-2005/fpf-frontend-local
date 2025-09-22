<template>
    <div class="content-box p-4">
        <span class="close-icon d-flex justify-content-end mt-1v  " @click="deletePopUp"><font-awesome-icon class="icon me-2" icon="xmark" style="font-size: 1em;" /></span>


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
                <h4><b>Are you sure you want to approve this filing?</b></h4>
                 <button class="btn btn-primary " @click="approveFiling" :disabled="approving">
                    <span v-if="approving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <span v-if="!approving">Approve filing</span>
                    <span v-else>Approving...</span>
                </button>
            </div>
        </div>
        
    </div>
</template>
<script setup>
import {ref} from 'vue'
import api_call_methods from '@/assets/api_calls/api_calls'
import { useUserStore } from '@/stores/userStore'
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
    }
})
const approving=ref(false)

const nameOfCopyfiling=ref(props.defaultCopyName)
function deletePopUp(){
    emit('removePopUp')
}
function createCopy(){
    emit('createCopy',nameOfCopyfiling)
}
function downloadPdf(){
    emit('downloadPdf')
}
async function approveFiling(){
    try{
        approving.value=true
        console.log(approving.value)
         
    }
    catch(err){

    }
    finally{
        approving.value=false
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