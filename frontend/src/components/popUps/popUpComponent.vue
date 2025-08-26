<template>
    <div class="content-box p-4">
        <span class="close-icon d-flex justify-content-end mt-1v  " @click="deletePopUp"><font-awesome-icon class="icon me-2" icon="xmark" style="font-size: 1em;" /></span>


        <!-- delete user popup -->
        <div v-if="type=='deleteUser'">
            <p>Are you sure you want to delete  <strong>{{ userNameToBeDeleted }}</strong>?</p>
            <div class="mt-3 d-flex justify-content-end">
                <button class="btn btn-danger">Delete</button>
            </div>
        </div>

        <!-- create copy popup  -->
        <div v-if="type=='createCopy'" class="p-4 ">
            <div class="d-flex justify-content-center">
                    <h4><b>Create Copy</b></h4>
            </div>
            
            <div class="mb-3">
                <label for="copyName" class="form-label">Filing Name</label>
                <input type="text" class="form-control" id="copyName" v-model="nameOfCopyfiling">
            </div>

            <div class="mt-3 d-flex justify-content-end ">
                <button class="btn btn-danger" @click="createCopy">submit</button>  
            </div>
        </div>

        <!-- sign off popup-->
        <div v-if="type=='signOff'">
            <div class="d-flex justify-content-center flex-column">
                <h4><b>Filing sent for sign-off</b></h4>
                <button class="btn btn-primary me-2 mt-2 mb-2" @click="downloadPdf">DOWNLOAD PDF REPORT</button>
            </div>
        </div>

        <!-- approve filing popup  -->
        <div v-if="type=='approveFiling'">
            <div class="d-flex justify-content-center flex-column">
                <h4><b>Are you sure you want to approve this filing?</b></h4>
                <button class="btn btn-primary me-2 mt-2 mb-2" @click="approveFiling">Approve</button>
            </div>
        </div>
        
    </div>
</template>
<script setup>
import {ref} from 'vue'
const emit=defineEmits(['removePopUp','filingName','downloadPdf','createCopy'])


const props=defineProps({
    type:{
        type:String,
        required:true,
    },
    userNameToBeDeleted:{
        type:String,
        required:true,
    },
    defaultCopyName:{
        type:String,
        default:''
    }
})

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
function approveFiling(){
    emit('approveFiling')
}

</script>

<style >
.content-box {
  background: white;
  border-radius: 8px;
  border: 2px solid greenyellow;
  min-width: 300px;
  max-width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}
</style>