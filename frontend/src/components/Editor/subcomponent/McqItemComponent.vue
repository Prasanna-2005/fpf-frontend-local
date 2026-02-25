<template>
  <div class="d-flex justify-content-between pb-4" :style="{ paddingLeft: indent + 'px' }">
    <p style="max-width: 70%;">
      <span>{{ itemNumber }}</span>)
      <span>{{ itemText }}</span>:
    </p>

    <div class="d-flex flex-column gap-3" style="max-width: 300px">
      <label 
        v-for="option in options" 
        :key="option" 
        class="d-flex  align-items-center"
      >
        <input 
          type="checkbox"
          :value="option"
          :checked="selected === option"
          @change="handleSelect(option)"
          :disabled="disabled"
        />
        <span class="ms-1">{{ option }}</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  itemNumber: { type: String, required: true },
  itemText: { type: String, required: true },
  itemValue: { type: String, required: true }, 
  options: { type: Array, required: true },    
  disabled: { type: Boolean, required: true },
  indent: { type: Number, default: 0 }
})

const emit = defineEmits(['update'])

const selected = ref(props.itemValue)


watch(
  () => props.itemValue,
  (newVal) => {
    selected.value = newVal
  }
)


function handleSelect(option) {
  selected.value = option
  console.log(option)
  emit('update', option)
}
</script>

<style scoped>
.gap-3 {
  gap: 1rem;
}
</style>
