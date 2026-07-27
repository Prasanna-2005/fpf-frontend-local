<template>
        <div class="d-flex" >
            <SideBarComponent @add-fund="openAddFundPopUp=true"/>
            <div class="flex-grow-1 d-flex flex-column align-items-start position-relative">
                <TopBarComponent @add-user="handleAddUser" @update:year="selectedYear = $event" />
                <AnalyticsTableComponent class="h-75" :selected-year="selectedYear" @edit-user="openUserEditor" />

                <div v-if="deletePopUp" class="backdrop">
                    <popUpComponent :userNameToBeDeleted="userNameToBeDeleted" :userIdToBeDeleted="userIdToBeDeleted"  type="deleteUser"  @remove-pop-up="deletePopUp = false"/>
                </div>

                <div v-if="adding_user" class="backdrop">
                    <addUserComponent @cancel-add-user=handleCancel />
                </div>

                <div v-if="editUser" class="backdrop">
                    <editUserComponent @cancel-edit-user=handleEditCancel :data="editUserData" />
                </div>

                <addFundComponent
                    v-if="openAddFundPopUp"
                    @cancel-add-fund="openAddFundPopUp=false"
                />

            
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
import editUserComponent from '@/components/Admin/editUserComponent.vue';
import {ref} from 'vue'

const deletePopUp=ref(false)
const userNameToBeDeleted=ref('')
const userIdToBeDeleted=ref('')
const openAddFundPopUp=ref(false)
const editUser=ref(false)
const editUserData=ref({})


const selectedYear = ref('2026')

const adding_user=ref(false)
function handleAddUser(){
    adding_user.value=true
}
function handleCancel(){
    adding_user.value=false
}
function openUserEditor(data){
    editUserData.value=data
    editUser.value=true
}
function handleEditCancel(){
    editUser.value=false
}
</script>
