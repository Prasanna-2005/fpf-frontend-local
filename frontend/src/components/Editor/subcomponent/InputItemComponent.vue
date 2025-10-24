<template>
  <div class="w-100 d-flex justify-content-between" :style="{ paddingLeft: indent + 'px' }">

    <p style="max-width: 70%;">
      <span>{{ itemNumber }}</span>)
      <span>{{ itemText }}</span>
    </p>

    <p>
      <input
        type="text"
        v-if="inputNeeded"
        :value="displayValue"
        :disabled="disabled"
        @input="onInput($event.target.value)"
        style="width: 300px; text-align: right;"
        class="number"
      />
    </p>

  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  itemNumber: { type: String, required: true },
  itemText: { type: String, required: true },
  itemValue: { type: [String, Number], default: '' },
  disabled: { type: Boolean, required: true },
  indent: { type: Number, default: 0 },
  inputNeeded:{
        type: Boolean,
        default:true
    }
})

const emit = defineEmits(['update'])

// internal raw value
const inputValue = ref(String(props.itemValue ?? ''))

// keep internal value in sync if parent changes
watch(
  () => props.itemValue,
  (val) => {
    inputValue.value = String(val ?? '')
  }
)

// computed value for display in input
const displayValue = computed(() => {
  if (!inputValue.value) return ''   // <- return empty string if no value
  if (props.disabled) {
    const num = Number(inputValue.value)
    if (isNaN(num)) return inputValue.value
    if (Math.abs(num) < 100) return inputValue.value

    const formatted=num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return `$ ${formatted}`
  } else {
    return inputValue.value
  }
})


// handle input updates
function onInput(val) {
  let cleaned = val.replace(/,/g, '') // remove commas
  inputValue.value = cleaned
  emit('update', cleaned)
}
</script>

<style scoped>
.number {
  text-align: right;
}
</style>
