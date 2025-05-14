<template>
    <div class="container auth-container-div">
        <div class="row no-padding">
            <div class="col no-padding"> 
                <ImageComponent/>
            </div>
            <div class="col no-padding">
                <div class="form-container">
                    <ResetComponent/>

                </div>
                
            </div>
        </div>
    </div>
</template>
<script setup>
import ImageComponent from '@/components/Auth/ImageComponent.vue'
import ResetComponent from '@/components/Auth/ResetComponent.vue';
</script>