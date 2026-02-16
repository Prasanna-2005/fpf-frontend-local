<template>
        <div class="d-flex" >
            <div >
                <SideBarComponent @add-fund="openAddFundPopUp=true"/>
            </div>
            <div class="flex-grow-1 d-flex flex-column justify-content-center align-items-start position-relative">
                <TopBarComponent @add-user="handleAddUser" @update:year="selectedYear = $event" />
                <AnalyticsTableComponent class="h-75" :selected-year="selectedYear"  />

                <div v-if="deletePopUp" class="backdrop">
                    <popUpComponent :userNameToBeDeleted="userNameToBeDeleted" :userIdToBeDeleted="userIdToBeDeleted"  type="deleteUser"  @remove-pop-up="deletePopUp = false"/>
                </div>

                <div v-if="adding_user" class="backdrop">
                    <addUserComponent @cancel-add-user=handleCancel />
                </div>

                <div v-if="openAddFundPopUp" class="backdrop">
                    <addFundComponent @cancel-add-fund="openAddFundPopUp=false"/>

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
import addFundComponent from '@/components/popUps/addFundComponent.vue';
import {ref} from 'vue'

const deletePopUp=ref(false)
const userNameToBeDeleted=ref('')
const userIdToBeDeleted=ref('')
const openAddFundPopUp=ref(false)
// function handleDelete(details){
//     deletePopUp.value=true
//     userNameToBeDeleted.value=details.name
//     userIdToBeDeleted.value=details.id
    
// }
// @delete-user=handleDelete

const selectedYear = ref('2026')

const adding_user=ref(false)
function handleAddUser(){
    adding_user.value=true
}
function handleCancel(){
    adding_user.value=false
}
</script>
