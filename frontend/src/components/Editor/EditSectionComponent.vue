<template>
    <div class="w-100 m-4 max-dimensions d-flex" style="border: 2px solid;">
        <div class="w-75 editor" >
            <editorComponent/>
        </div>
        <div class="series-selector w-25 d-flex justify-content-end" >
            <div class="w-50 d-flex flex-column">
                <button class="btn btn-outline-secondary ">Series1</button>
                <button class="btn btn-outline-secondary">Series2</button>
                <button class="btn btn-outline-secondary">Series3</button>
                <button class="btn btn-outline-secondary">Series4</button>
            </div>
            

        </div>
    </div>
</template>

<script setup>
import editorComponent from './editorComponent.vue';
</script>

<style scoped>

</style>