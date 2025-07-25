<template>
    <div class="d-flex justify-content-between">
        <p> 
            <span>{{ props.itemNumber }}</span>)
            <span>{{ props.itemText }}</span>:
        </p>
        <p>
            <input type="checkbox" v-model="checked" />
            <span>{{ checked ? 'Yes' : 'No' }}</span>
    
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
    }
})
const checked = ref(props.itemValue === 'Yes')
watch(checked, () => {
  console.log(checked.value)
})

</script>

<style scoped>

</style>