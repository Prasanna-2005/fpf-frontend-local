<template>
    <div class="d-flex justify-content-between">
        <p>
            <span>{{ props.itemNumber }}</span>)
            <span>{{ props.itemText }}</span>: 
        </p>
        <p>
            <input type="text" v-model="props.itemValue" style="width: 180px;">
        </p>
    </div>


</template>

<script setup>
const props=defineProps({
    itemNumber:{
        type:String,
        required:true,
    },
    itemText:{
        type:String,
        required:true
    },
    itemValue:{
        type:String,
        required:true,
        default:''
    }
}) 
</script>

<style scoped>

</style>