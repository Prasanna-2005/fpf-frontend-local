<template>
  <div class="d-flex justify-content-between" :style="{ paddingLeft: indent + 'px' }" >
    <p> 
    <span>{{ props.itemNumber }}</span>)
    <span>{{ props.itemText }}</span>:
    </p>
    <p>
    <span class="dropdown">
        <button class=" dropdown-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="width: 180px; height: 30px; background-color: white; overflow: hidden;"  :disabled="disabled">
            {{ selectedValue }}
        </button>
        <ul class="dropdown-menu">
            <li  v-for="(item, index) in options" :key="index" @click="selectValue(item)"><a class="dropdown-item" >{{item}}</a></li>
        </ul>
    </span>
    </p>
  </div>
</template>

<script setup>
import {ref} from 'vue'
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
        default:'Select'
    },
    options:{
        type:Array,
        required:true
    },
    disabled: {
        type:Boolean,
        required:true
    },
    indent: { 
        type: Number,
        default: 0 
    }
}) 
const emit = defineEmits(['update'])

const selectedValue = ref(props.itemValue)

function selectValue(val){
    selectedValue.value=val
    emit('update', val)
}

</script>
<style scoped>

.dropdown-btn{
    border: 1px solid black;
    border-radius: 0;
}
</style>