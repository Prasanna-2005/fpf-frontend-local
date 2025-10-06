<template>
    <div class="w-100 d-flex justify-content-between" :style="{ paddingLeft: indent + 'px' }" >

        <p style="max-width: 70%;">
            <span>{{ props.itemNumber }}</span>)
            <span>{{ props.itemText }}</span>
        </p>
        <p>
            <input type="text" v-if="inputNeeded" v-model="inputValue" style="width: 250px;" :disabled="disabled">
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
    },
    indent: { 
        type: Number,
        default: 0 
    },
    inputNeeded:{
        type: Boolean,
        default:true
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