<template>
        <div class="d-flex" >
            <div >
                <SideBarComponent />
            </div>
            <div class="flex-grow-1 d-flex flex-column justify-content-center align-items-start position-relative">
                <TopBarComponent @add-user="handleAddUser"/>
                <AnalyticsTableComponent class="h-75"@delete-user=handleDelete />

                <div v-if="deletePopUp" class="backdrop">
                    <popUpComponent userNameToBeDeleted="userNameToBeDeleted" type="createCopy" defaultCopyName="FinancialYear24-25(copy)" @remove-pop-up="deletePopUp = false"/>
                </div>

                <div v-if="adding_user" class="backdrop">
                    <addUserComponent @cancel-add-user=handleCancel />
                </div>

            
            </div> 
        </div>
</template>

<script setup>
import AnalyticsTableComponent from '@/components/Admin/analyticsTableComponent.vue';
import TopBarComponent from '@/components/Admin/topBarComponent.vue';
import SideBarComponent from '@/components/Home/SideBarComponent.vue';
import addUserComponent from '@/components/Admin/addUserComponent.vue';
import popUpComponent from '@/components/popUps/popUpComponent.vue';
import {ref} from 'vue'

const deletePopUp=ref(false)
const userNameToBeDeleted=ref('')
function handleDelete(name){
    deletePopUp.value=true
    userNameToBeDeleted.value=name
}

const adding_user=ref(false)
function handleAddUser(){
    adding_user.value=true
}
function handleCancel(){
    adding_user.value=false
}
</script>

<style scoped>
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}



</style>