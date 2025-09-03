<template>
  <div class="d-flex flex-column" :style="{ paddingLeft: indent + 'px' }">
    <p>
      <span>{{ props.itemNumber }}</span>)
      <span>{{ props.itemText }}</span>:
    </p>
    <p>
      <input 
        type="date" 
        v-if="inputNeeded" 
        v-model="inputValue" 
        style="width: 180px;" 
        :disabled="disabled"
      >
    </p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

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

