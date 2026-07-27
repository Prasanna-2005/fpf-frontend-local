<template>
  <div class="modal-backdrop" @click.self="$emit('close-click')">
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="comp-title">
      <div class="modal-header">
        <h2 id="comp-title">Question {{ displayFieldNo }}: Computations</h2>
        <button type="button" class="modal-close" aria-label="Close" @click="$emit('close-click')">
          <font-awesome-icon icon="xmark" />
        </button>
      </div>

      <div class="modal-body">
        <!-- Top-level formula / question -->
        <div v-if="field.formula && field.formula !== 'null'" class="comp-row">
          <div class="comp-label">
            {{ field.field_text || 'Computation' }}
          </div>
          <div class="comp-value">{{ displayFormula(field.formula) }}</div>
          <span class="tag-btn" :class="tagClass(field.type, field.formula)">
            <font-awesome-icon :icon="tagIcon(field.type, field.formula)" />
            {{ tagLabel(field.type, field.formula) }}
          </span>
        </div>

        <div
          v-else-if="field.field_text && !field.field_data?.length"
          class="comp-row"
        >
          <div class="comp-label">{{ field.field_text }}</div>
          <div class="comp-value">{{ displayFormula(field.formula) }}</div>
          <span class="tag-btn" :class="tagClass(field.type, field.formula)">
            <font-awesome-icon :icon="tagIcon(field.type, field.formula)" />
            {{ tagLabel(field.type, field.formula) }}
          </span>
        </div>

        <!-- Sub-field rows -->
        <div
          v-for="(item, index) in field.field_data || []"
          :key="index"
          class="comp-row"
        >
          <div class="comp-label">
            <span v-if="getDisplayLineNo(item.line_item_no)">({{ getDisplayLineNo(item.line_item_no) }})</span>
            {{ item.line_text }}
          </div>
          <div class="comp-value">
            {{ displayFormula(item.computation_formula) }}
          </div>
          <span
            class="tag-btn"
            :class="tagClass(item.computation_type, item.computation_formula)"
          >
            <font-awesome-icon
              :icon="tagIcon(item.computation_type, item.computation_formula)"
            />
            {{ tagLabel(item.computation_type, item.computation_formula) }}
          </span>
        </div>

        <!-- Table data -->
        <div
          v-if="Array.isArray(field.table_data) && field.table_data.length"
          class="table-section"
        >
          <div class="table-title">Table Data</div>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th
                    v-for="col in getTableColumns(field.table_data)"
                    :key="col"
                  >
                    {{ formatColumn(col) }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, rowIndex) in field.table_data"
                  :key="rowIndex"
                >
                  <td
                    v-for="col in getTableColumns(field.table_data)"
                    :key="col"
                  >
                    <div class="cell-value">{{ row[col] || '—' }}</div>
                    <span
                      v-if="col !== 's.name' && row['s.computationType']"
                      class="tag-btn sm"
                      :class="tagClass(row['s.computationType'][col], row[col])"
                    >
                      {{ tagLabel(row['s.computationType'][col], row[col]) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div
          v-if="!hasContent"
          class="empty-state"
        >
          No computation details available for this question.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  field: {
    type: Object,
    required: true,
  },
})

defineEmits(['close-click'])

const displayFieldNo = computed(() => {
  const no = props.field?.field_no
  if (!no) return ''
  const parts = String(no).split('_')
  return parts[parts.length - 1]
})

const hasContent = computed(() => {
  const f = props.field || {}
  return Boolean(
    (f.formula && f.formula !== 'null') ||
      f.field_text ||
      (Array.isArray(f.field_data) && f.field_data.length) ||
      (Array.isArray(f.table_data) && f.table_data.length)
  )
})

function getDisplayLineNo(lineItemNo) {
  if (!lineItemNo) return ''
  const parts = lineItemNo.split('_')
  return parts[parts.length - 1]
}

function getTableColumns(tableData) {
  if (!Array.isArray(tableData) || !tableData.length) return []
  return Object.keys(tableData[0]).filter(
    (col) => col !== 's.text' && col !== 's.computationType'
  )
}

function formatColumn(col) {
  return col.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function displayFormula(formula) {
  if (formula == null || formula === 'null' || formula === '') return 'N/A'
  return formula
}

function isUnavailable(type, formula) {
  return (
    type == null ||
    type === 'null' ||
    formula == null ||
    formula === 'null' ||
    formula === '' ||
    formula === 'N/A' ||
    formula === '-'
  )
}

function tagLabel(type, formula) {
  if (isUnavailable(type, formula) && (formula === 'N/A' || formula === 'null' || !formula)) {
    return 'Not Available'
  }
  if (type === 'null' || type == null) return 'Not Available'
  if (type === 'formula') return 'Formula'
  if (type === 'filters') return 'Filter'
  return 'Static Data'
}

function tagClass(type, formula) {
  const label = tagLabel(type, formula)
  if (label === 'Not Available') return 'na'
  if (label === 'Formula') return 'formula'
  if (label === 'Filter') return 'filter'
  return 'static'
}

function tagIcon(type, formula) {
  const label = tagLabel(type, formula)
  if (label === 'Not Available') return 'circle'
  if (label === 'Formula') return 'calculator'
  if (label === 'Filter') return 'filter'
  return 'lock'
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 24px;
}

.modal-card {
  background: #fff;
  width: min(720px, 100%);
  max-height: calc(100vh - 48px);
  overflow: auto;
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 22px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 8px 22px 22px;
}

.comp-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
}

.comp-row:last-child {
  border-bottom: none;
}

.comp-label {
  font-size: 0.85rem;
  color: #6b7280;
  line-height: 1.4;
}

.comp-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  word-break: break-word;
  white-space: pre-wrap;
}

.tag-btn {
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: default;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  justify-self: end;
}

.tag-btn.sm {
  padding: 3px 8px;
  font-size: 0.7rem;
  margin-top: 4px;
}

.tag-btn.static {
  background: #eff6ff;
  border: 1px solid #93c5fd;
  color: #2563eb;
}

.tag-btn.formula {
  background: #f5f3ff;
  border: 1px solid #c4b5fd;
  color: #6d28d9;
}

.tag-btn.filter {
  background: #ecfeff;
  border: 1px solid #67e8f9;
  color: #0e7490;
}

.tag-btn.na {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #64748b;
}

.table-section {
  margin-top: 12px;
  padding-top: 8px;
}

.table-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 10px;
}

.table-responsive {
  overflow: auto;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

th {
  background: #e8eef8;
  color: #6b7280;
  font-weight: 600;
  text-align: left;
  padding: 12px 14px;
  white-space: nowrap;
}

td {
  padding: 12px 14px;
  border-top: 1px solid #f3f4f6;
  vertical-align: top;
}

.cell-value {
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
}

.empty-state {
  padding: 32px 8px;
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
}

@media (max-width: 700px) {
  .comp-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .tag-btn {
    justify-self: start;
  }
}
</style>
