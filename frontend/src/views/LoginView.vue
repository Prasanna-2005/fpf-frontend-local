<template>
    <div class="container auth-container custom-view">
        <div class="row no-padding">
            <div class="col no-padding"> 
                <ImageComponent/>
            </div>
            <div class="col no-padding">
                <div class="form-container">
                    <LoginComponent/>
                </div>
                
            </div>
        </div>
    </div>
</template>
<script setup>
import LoginComponent from '@/components/Auth/LoginComponent.vue'
import ImageComponent from '@/components/Auth/ImageComponent.vue'
</script>
<style scoped>


</style>