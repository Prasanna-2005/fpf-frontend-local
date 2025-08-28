<template>
    <div class="d-flex justify-content-between">
        <p>
            <span>{{ props.itemNumber }}</span>)
            <span>{{ props.itemText }}</span>: 
        </p>
        <p>
            <input type="text" v-model="inputValue" style="width: 180px;" :disabled="disabled">
        </p>
    </div>


</template>

<script setup>
import {ref,watch} from 'vue'

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
    },
       disabled: {
        type:Boolean,
        required:true
    }
}) 
const inputValue=ref(props.itemValue)
const emit = defineEmits(['update'])
watch(inputValue, () => {
  emit('update', inputValue.value)    
})

</script>

<style scoped>

</style>