<template>
        <div class="d-flex" >
            <div >
                <SideBarComponent />
            </div>
            <div class="flex-grow-1 d-flex flex-column justify-content-center align-items-start position-relative">
                <topBarComponent @selected-fund="selectFund"  />
                <EditSectionComponent :fundName="fundName" />
            </div> 
        </div>
</template>

<script setup>
import SideBarComponent from '@/components/Home/SideBarComponent.vue';
import topBarComponent from '@/components/Editor/topBarComponent.vue';
import EditSectionComponent from '@/components/Editor/EditSectionComponent.vue';
import {ref} from 'vue';


const fundName=ref('')
function selectFund(fund_name){
    fundName.value=fund_name
}



</script>

<style scoped>

   

</style>