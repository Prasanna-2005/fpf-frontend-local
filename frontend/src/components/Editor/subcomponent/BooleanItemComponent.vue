<template>
    <div class="d-flex justify-content-between" :style="{ paddingLeft: indent + 'px' }" >
        <p style="max-width: 70%;"> 
            <span v-if="!props.hideNumber && props.itemNumber">{{ props.itemNumber }})</span>
            <span>{{ props.itemText }}</span>:
        </p>
        <p>
            <input type="checkbox" v-model="checked" :disabled="disabled" />
            <span>{{ checked ? ' Yes' : ' No' }}</span>
    
        </p>
    </div>


</template>

<script setup>
import {ref,watch} from 'vue';

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
        required:true
    },
    disabled: {
        type:Boolean,
        required:true
    },
    indent: { 
        type: Number,
        default: 0 
    },
    hideNumber: {
        type: Boolean,
        default: false,
    },
})
const checked = ref(props.itemValue === 'true')
watch(
  () => props.itemValue,
  (newVal) => {
    
    checked.value = (newVal === 'true' )
  }
)
console.log('bool value:',props.itemValue)
const emit = defineEmits(['update'])
watch(checked, () => {
const emit_value=checked.value?'true':'false'
emit('update', emit_value)    
})


</script>

<style scoped>

</style>