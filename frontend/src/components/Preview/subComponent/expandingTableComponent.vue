<template>
  <div v-if="rows.length" class="table-responsive my-2">
    <table class="table table-bordered table-sm thick-border fixed-table">
      <thead>
        <tr class="thick-border">
          <th v-for="(header, index) in tableHeaders" :key="index" class="thick-border fixed-col text-center align-middle">
            {{ header }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex" class="thick-border">
          <td v-for="(cell, colIndex) in row" :key="colIndex" class="thick-border fixed-col" >
            {{ cell }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-else class="text-muted">
    No data available
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  tableHeaders: {
    type: Array,
    required: true,
  },
  value: {
    type: String,
    default: "[]",
  },
});

/* ✅ Safe JSON parse */
const rows = computed(() => {
  try {
    const parsed = JSON.parse(props.value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
});
</script>

<style>
.thick-border { border: 2px solid black; }
.fixed-table {
  table-layout: fixed; /* ensures equal width distribution or fixed widths */
  width: 100%;
}

.fixed-col {
  width: 150px; /* set your preferred width */
  word-wrap: break-word; /* wraps long text */
  text-overflow: ellipsis;
  overflow: break-word;
  white-space: normal; /* prevents wrapping if you prefer truncation */
}
</style>
