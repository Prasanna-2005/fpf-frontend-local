<template>
  <div
    class="d-flex justify-content-between"
    :style="{ paddingLeft: indent + 'px' }"
  >
    <p style="max-width: 70%;">
      <span>{{ itemNumber }}</span>)
      <span>{{ itemText }}</span>:
    </p>

    <p>
      
      <input
        v-if="!localValue && disabled"
        type="text"
        style="width: 300px; box-sizing: border-box; padding: 4px;"
        disabled
      />

      
      <el-date-picker
        v-else
        v-model="localValue"
        type="date"
        style="width: 300px; box-sizing: border-box;"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        placeholder="YYYY-MM-DD"
        :disabled="disabled"
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
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    required: true
  },
  indent: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update'])

const localValue = ref(props.itemValue)
watch(
  () => props.itemValue,
  (newVal) => {
    localValue.value = newVal
  }
)


watch(localValue, (newVal) => {
  emit('update', newVal)
})
</script>
