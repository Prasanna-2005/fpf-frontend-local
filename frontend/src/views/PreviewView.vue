<template>
    <div class="d-flex" >
            <div >
                <SideBarComponent />
            </div>
            <div class="flex-grow-1 d-flex flex-column justify-content-center align-items-start position-relative">
                <topBarComponent @selected-fund="selectFund"  />
                <previewComponent />
            </div> 
        </div>
    
</template>

<script setup>
import SideBarComponent from '@/components/Home/SideBarComponent.vue';
import topBarComponent from '@/components/Editor/topBarComponent.vue';
import previewComponent from '@/components/Preview/previewComponent.vue';
</script>