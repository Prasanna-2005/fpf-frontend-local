<template>
        <div class="d-flex" >
            <div >
                <SideBarComponent />
            </div>
            <div class="flex-grow-1 d-flex flex-column justify-content-center align-items-start position-relative">
                <topBarComponent @selected-fund="selectFund"  />
                <EditSectionComponent/>
            </div> 
        </div>
</template>

<script setup>
import SideBarComponent from '@/components/Home/SideBarComponent.vue';
import topBarComponent from '@/components/Editor/topBarComponent.vue';
import EditSectionComponent from '@/components/Editor/EditSectionComponent.vue';
function selectFund(fundName){
    console.log(fundName)
}



</script>

<style scoped>

   

</style>