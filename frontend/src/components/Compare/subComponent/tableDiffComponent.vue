<template>
  <div v-if="table.rows?.length" class="table-responsive my-2">
    <p v-if="hasLowConfidence" class="small text-muted mb-1">
      Some rows were matched by position because a row name was missing.
    </p>
    <table class="table table-bordered table-sm thick-border fixed-table">
      <thead>
        <tr class="thick-border">
          <th
            v-for="col in table.columns"
            :key="col"
            class="thick-border fixed-col text-center align-middle"
          >
            <b>{{ getTableHeaderName(col).toUpperCase() }}</b>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, rowIndex) in table.rows"
          :key="rowIndex"
          class="thick-border"
          :class="rowStatusClass(row.status)"
        >
          <td
            v-for="col in table.columns"
            :key="col"
            class="thick-border fixed-col"
            :class="cellClass(row.cells[col])"
          >
            <DiffValue
              :leaf="row.cells[col]"
              :affix="table.metadata?.[col]?.display_affix"
              :field="col"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import DiffValue from './diffValue.vue'

const props = defineProps({
  table: {
    type: Object,
    required: true,
  },
})

const hasLowConfidence = computed(() =>
  (props.table.rows || []).some((row) => row.lowConfidence)
)

function rowStatusClass(status) {
  if (status === 'added') return 'row-added'
  if (status === 'removed') return 'row-removed'
  return ''
}

function cellClass(cell) {
  const status = cell?.status
  if (status === 'changed') return 'cell-changed'
  if (status === 'added') return 'cell-added'
  if (status === 'removed') return 'cell-removed'
  return ''
}

function getTableHeaderName(header) {
  if (header === 's.name' || header === 's.text') return ''
  if (header === 'costbased') return 'cost-based'
  if (/^level\d+$/.test(header)) {
    return header.replace(/level(\d+)/, 'level $1')
  }
  return header.replaceAll('_', ' ')
}
</script>

<style scoped>
.thick-border { border: 2px solid black; }
.fixed-table {
  table-layout: fixed;
  width: 100%;
}
.fixed-col {
  width: 150px;
  word-wrap: break-word;
  white-space: normal;
}
.row-added {
  background: #ecfdf3;
}
.row-removed {
  background: #fef3f2;
}
.cell-changed {
  background: #fff8e6;
}
.cell-added {
  background: #e6f9ee;
}
.cell-removed {
  background: #fdecea;
}
</style>
