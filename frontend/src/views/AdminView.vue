<template>
        <div class="d-flex" >
            <div >
                <SideBarComponent />
            </div>
            <div class="flex-grow-1 d-flex flex-column justify-content-center align-items-start position-relative">
                <TopBarComponent />
                <AnalyticsTableComponent class="h-75"@delete-user=handleDelete />

                <div v-if="deletePopUp" class="backdrop">
                    <div class="content-box">
                        <p>Are you sure you want to delete <strong>{{ userNameToBeDeleted }}</strong>?</p>
                        <div class="mt-3 d-flex justify-content-end">
                            <button class="btn btn-secondary me-2" @click="deletePopUp = false">Cancel</button>
                            <button class="btn btn-danger">Delete</button>
                        </div>
                    </div>
                </div>
            </div> 
        </div>
</template>

<script setup>
import AnalyticsTableComponent from '@/components/Admin/analyticsTableComponent.vue';
import TopBarComponent from '@/components/Admin/topBarComponent.vue';
import SideBarComponent from '@/components/Home/SideBarComponent.vue';
import {ref} from 'vue'

const deletePopUp=ref(false)
const userNameToBeDeleted=ref('')
function handleDelete(name){
    deletePopUp.value=true
    userNameToBeDeleted.value=name
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

.content-box {
  background: white;
  padding: 50px 50px;
  border-radius: 8px;
  border: 2px solid greenyellow;
  min-width: 300px;
  max-width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

</style>