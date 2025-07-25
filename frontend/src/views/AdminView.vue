<template>
        <div class="d-flex" >
            <div >
                <SideBarComponent />
            </div>
            <div class="flex-grow-1 d-flex flex-column justify-content-center align-items-start position-relative">
                <topBarComponent/>
                <AnalyticsTableComponent />
            </div> 
        </div>
</template>

<script setup>
import AnalyticsTableComponent from '@/components/Admin/analyticsTableComponent.vue';
import TopBarComponent from '@/components/Admin/topBarComponent.vue';
import SideBarComponent from '@/components/Home/SideBarComponent.vue';



</script>

<style scoped>

</style>