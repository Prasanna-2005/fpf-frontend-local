<template>
  <div class="d-flex justify-content-between" :style="{ paddingLeft: indent + 'px' }">
    <p>
      <span>{{ props.itemNumber }}</span>)
      <span>{{ props.itemText }}</span>:
    </p>
    <p>
      <!-- <input 
        type="date" 
        v-if="inputNeeded" 
        v-model="inputValue" 
        style="width: 180px;" 
        :disabled="disabled"
      > -->
      <span v-if="!itemValue && disabled" > 
        <input type="text" style="width: 100%; box-sizing: border-box; padding: 4px;" :disabled="disabled">
      </span>
      <el-date-picker
        v-else
        style="width: 100%;  box-sizing: border-box; height: 100%; background-color: ghostwhite !important;"
        :model-value="itemValue || null"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        placeholder="YYYY-MM-DD"
        :disabled="disabled"
        @update:model-value="onDateChange($event, rowIndex, key)"
      />
    </p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElDatePicker } from 'element-plus'
import 'element-plus/dist/index.css'

const props = defineProps({
  itemNumber: {
    type: String,
    required: true,
  },
  itemText: {
    type: String,
    required: true
  },
  itemValue: {
    type: String, // Use "YYYY-MM-DD" format for date
    default: ''
  },
  disabled: {
    type: Boolean,
    required: true
  },
  indent: { 
    type: Number,
    default: 0 
  },
  inputNeeded: {
    type: Boolean,
    default: true
  }
})

const inputValue = ref(props.itemValue)

const emit = defineEmits(['update'])
watch(inputValue, () => {
  emit('update', inputValue.value)
})
</script>

