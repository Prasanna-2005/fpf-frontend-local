<template>
  <span class="diff-pair">
    <span v-if="showA" :class="classA">{{ displayA }}</span>
    <span v-if="showBoth" class="diff-arrow">→</span>
    <span v-if="showB" :class="classB">{{ displayB }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { formatValue } from '@/assets/utils/formatValue'

const props = defineProps({
  leaf: {
    type: Object,
    required: true,
  },
  affix: {
    type: String,
    default: '',
  },
  field: {
    type: String,
    default: '',
  },
})

const displayA = computed(() => formatOrBlank(props.leaf?.valueA))
const displayB = computed(() => formatOrBlank(props.leaf?.valueB))
const status = computed(() => props.leaf?.status || 'unchanged')

const showA = computed(() => status.value !== 'added')
const showB = computed(() => status.value === 'added' || status.value === 'changed')
const showBoth = computed(() => status.value === 'changed')

const classA = computed(() => {
  if (status.value === 'removed') return 'diff-removed'
  if (status.value === 'changed') return 'diff-changed-old'
  return 'diff-unchanged'
})

const classB = computed(() => {
  if (status.value === 'added') return 'diff-added'
  if (status.value === 'changed') return 'diff-changed-new'
  return 'diff-unchanged'
})

function formatOrBlank(value) {
  if (value === null || value === undefined || String(value).trim() === '') return '—'
  const formatted = formatValue(value, props.affix, props.field)
  return formatted === null || formatted === undefined || formatted === '' ? '—' : formatted
}
</script>

<style scoped>
.diff-pair {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.diff-removed {
  color: #b42318;
}
.diff-changed-old {
  color: #b42318;
}
.diff-changed-new,
.diff-added {
  color: #027a48;
  font-weight: 600;
}
.diff-unchanged {
  font-weight: 600;
}
.diff-arrow {
  color: #667085;
}
</style>
