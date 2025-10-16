<template>
    <div class="d-flex flex-column" :style="{ paddingLeft: indent + 'px' }" >

        <p>
            <span>{{ props.itemNumber }}</span>)
            <span  v-if="props.itemNumber=='14'" class="formatted-text">{{ defaultText }}</span>
            <span v-else>{{ props.itemText }}</span>: 
        </p>
        <p v-if="isDateInput">
            <input 
            type="date" 
            v-model="date" 
            style="width: 180px;" 
            :disabled="disabled"
            >
        </p>
        <div class="table-responsive my-2">
        <table class="table table-bordered table-sm thick-border">
            <thead>
            <tr class="thick-border">
                <th v-for="(val, key, colIndex) in localData[0]" :key="colIndex" class="thick-border">
                <b>{{ key.toUpperCase() }}</b>
                </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(row, rowIndex) in localData" :key="rowIndex" class="thick-border">
                <td v-for="(val, key, colIndex) in row" :key="colIndex" class="thick-border">
                <span v-if="key === 's.name'">{{ getDisplayFieldNo(val) }}</span>
                <span v-else>
                <input 
                type="text" 
                v-model="localData[rowIndex][key]" 
                :disabled="disabled"
                @input="emitUpdate"
                >
                </span>
                </td>
            </tr>
            </tbody>
        </table>
        </div>
  </div>
</template>

<script setup>
import { defaultText } from '@/assets/text/text'
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
    itemNumber:{
        type:String,
        required:true,
    },
    itemText:{
        type:String,
        required:true
    },
    itemData: {
        type: String, 
        required: true,
    },
    disabled: {
        type: Boolean,
        required: true
    },
    indent: {
        type: Number,
        default: 0
    },
    isDateInput:{
        type:Boolean,
        default:false
    },
    dateValue:{
        type:String,
        default:''
    }
})

const date=ref('')

const emit = defineEmits(['update'])
const localData = ref([])
console.log(props.itemData)


onMounted(() => {
  localData.value = props.itemData
  date.value=props.dateValue
})

    

console.log(localData._value)
watch(
  () => props.itemData,
  (newVal) => {
    localData.value = JSON.parse(JSON.stringify(newVal)) // Sync when prop changes
  }
)

function emitUpdate() {
  emit('update', localData.value)
}

function getDisplayFieldNo(fieldNo) {
  const parts = fieldNo.split('_')
  return parts[parts.length - 1]
}
</script>
<style scoped>
.formatted-text {
  white-space: pre-wrap; /* preserves line breaks and wraps text */
  word-wrap: break-word; /* wraps long words instead of cutting off */
  

}
</style>