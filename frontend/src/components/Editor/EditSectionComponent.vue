<template>
    <div class="w-100 d-flex justify-content-center">
        <div class="main-container d-flex" style="max-width: 100%;border: 1px solid grey;">
            <div class="w-100 editor" >
                <editorComponent :fundName="fundName"   @open-upload="openUpload" />
            </div>
            <!-- <div class="series-selector w-10 d-flex justify-content-end" >
                <div class="w-100 d-flex flex-column align-items-end">
                    <button class="btn btn-outline-secondary selector-button" :class="{ selected: selected_series === 'series1' }" @click="select_series('series1')">Series1</button>
                    <button class="btn btn-outline-secondary selector-button" :class="{ selected: selected_series === 'series2' }" @click="select_series('series2')">Series2</button>
                    <button class="btn btn-outline-secondary selector-button" :class="{ selected: selected_series === 'series3' }" @click="select_series('series3')">Series3</button>
                    <button class="btn btn-outline-secondary selector-button" :class="{ selected: selected_series === 'series4' }" @click="select_series('series4')">Series4</button>
                </div>
            </div> -->
        </div>   
    </div>
   
</template>

<script setup>
import {ref} from 'vue'
import editorComponent from './editorComponent.vue';
const props=defineProps({
    fundName:{
        type:String,
        required:true
    },
    
})


const selected_series=ref('series1')
const emit=defineEmits(['open-upload'])
function select_series(series){
    selected_series.value=series
    
}
function openUpload(){
    emit('open-upload')
}
</script>

<style scoped>
.w-90{
    width: 90%;
}
.w-10{
    width: 10%;
}
.main-container{
    width: 95%;
}
.selected{
    width: 100% !important;
    border-radius: 0 !important;
    background-color: blue;
    color: white;
}
.selector-button{
    width:75%;
    border-radius: 0 !important;
}
</style>