<template>
  <div class="compare-shell">
    <div class="compare-toolbar">
      <button type="button" class="back-btn" aria-label="Back" @click="goBack">
        <font-awesome-icon icon="arrow-left" />
        Back
      </button>

      <div class="filing-pair">
        <div class="filing-side">
          <span class="filing-label">Current filing</span>
          <h5 class="filing-name">{{ nameA || 'Current filing' }}</h5>
        </div>
        <div class="compare-arrow" aria-hidden="true">
          <span class="filing-label arrow-spacer">&nbsp;</span>
          <span class="arrow-icon">
            <font-awesome-icon icon="arrow-right" />
          </span>
        </div>
        <div class="filing-side filing-picker">
          <label class="filing-label" for="compare-filing-b">Selected filing</label>
          <select
            id="compare-filing-b"
            class="filing-select"
            :value="filingIdB"
            :disabled="relatedLoading || switching"
            @change="onFilingChange"
          >
            <option v-if="relatedLoading" value="" disabled>Loading filings…</option>
            <option
              v-else-if="filingIdB && !relatedFilings.some((filing) => filing.id === filingIdB)"
              :value="filingIdB"
            >
              {{ nameB || 'Related filing' }}
            </option>
            <option
              v-for="filing in relatedFilings"
              :key="filing.id"
              :value="filing.id"
            >
              {{ filing.filing_name }}
            </option>
          </select>
          <p v-if="switching" class="switching-note mb-0">
            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            Loading comparison…
          </p>
        </div>
      </div>
    </div>

    <p class="legend-intro">
      Color shows how the selected filing differs from the current filing.
    </p>
    <div class="legend">
      <span class="legend-item" style="color: #b42318"> 
        <span class="swatch old"></span>
        Value in current filing ({{ nameA || 'current filing' }})
      </span>
      <span class="legend-item" style="color: #027a48">
        <span class="swatch new"></span>
        Value in selected filing ({{ nameB || 'selected filing' }})
      </span>
    </div>

    <div class="pdf-viewer">
      <div class="pdf-page">
        <div
          v-for="(fund, idx) in diff.funds"
          :key="fund.fund_id || fund.fund_name || idx"
          :class="['pdf-series', idx > 0 ? 'page-break' : '']"
        >
          <div class="d-flex w-100 mb-2" style="border: 1px solid;">
            <div style="border: 1px solid;" class="w-50 p-2">
              <h4>{{ fund.fund_name }}</h4>
            </div>
            <div style="border: 1px solid;" class="w-50 p-2">
              <h4>Information about the private funds you advise</h4>
            </div>
          </div>
          <p v-if="fund.presence === 'onlyInA'" class="fund-banner removed-banner">
            Fund present only in {{ nameA || 'the previous filing' }}
          </p>
          <p v-else-if="fund.presence === 'onlyInB'" class="fund-banner added-banner">
            Fund present only in {{ nameB || 'the current filing' }}
          </p>

          <div v-for="(fieldsGroup, heading) in groupByHeading(fund.fields)" :key="heading">
            <h4><b>{{ heading.split(':')[1] || heading }}</b></h4>
            <b><hr /></b>

            <div
              v-for="(fields, fieldIndex) in fieldsGroup"
              :key="fields.field_no || fieldIndex"
              class="pdf-field"
              :style="{ marginLeft: getIndent(fields.field_no) + 'px' }"
            >
              <p class="field-number">
                {{ getDisplayFieldNo(fields.field_no) }})
                <span v-if="fields.has_field_item_text">
                  <pre v-if="fields.field_no == '14'" class="formatted-text">{{ defaultText }}</pre>
                  <span v-else class="line-text">{{ fields.field_text }}:</span>
                  <span v-if="fields.field_item_type !== 'exp_table'" class="line-value">
                    <DiffValue :leaf="fields.value" :affix="fields.display_affix" />
                  </span>
                </span>
              </p>

              <tableDiffComponent
                v-if="fields.has_table_data && fields.table?.rows?.length"
                :table="fields.table"
              />

              <div v-if="fields.expTable" class="my-2">
                <div v-if="fields.expTable.scalar">
                  <DiffValue :leaf="fields.expTable.scalar" />
                </div>
                <table v-else-if="fields.expTable.rows.length" class="table table-bordered table-sm thick-border">
                  <thead>
                    <tr>
                      <th
                        v-for="(header, headerIndex) in fields.expTable.headers"
                        :key="headerIndex"
                        class="text-center"
                      >
                        {{ header }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, rowIndex) in fields.expTable.rows"
                      :key="rowIndex"
                      :class="row.status === 'added' ? 'row-added' : row.status === 'removed' ? 'row-removed' : ''"
                    >
                      <td v-for="(cell, colIndex) in row.cells" :key="colIndex">
                        <DiffValue :leaf="cell" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="fields.subItems?.length" class="field-content">
                <span v-for="(items, itemIndex) in fields.subItems" :key="items.line_item_no || itemIndex" class="line-item">
                  <p :style="{ marginLeft: getIndent(items.line_item_no) + 'px' }">
                    <span class="line-number field-number">{{ getDisplayFieldNo(items.line_item_no) }})</span>
                    <span class="line-text">{{ items.line_text }}:</span>
                    <span v-if="items.line_item_type !== 'table' && items.line_item_type !== 'exp_table'" class="line-value">
                      <DiffValue :leaf="items.value" :affix="items.display_affix" />
                    </span>
                  </p>
                  <tableDiffComponent
                    v-if="items.table?.rows?.length"
                    :table="items.table"
                  />
                  <div v-if="items.expTable" class="my-2">
                    <div v-if="items.expTable.scalar">
                      <DiffValue :leaf="items.expTable.scalar" />
                    </div>
                    <table v-else-if="items.expTable.rows.length" class="table table-bordered table-sm thick-border">
                      <thead>
                        <tr>
                          <th
                            v-for="(header, headerIndex) in items.expTable.headers"
                            :key="headerIndex"
                            class="text-center"
                          >
                            {{ header }}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, rowIndex) in items.expTable.rows" :key="rowIndex">
                          <td v-for="(cell, colIndex) in row.cells" :key="colIndex">
                            <DiffValue :leaf="cell" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { defaultText } from '@/assets/text/text'
import { diffFilings } from '@/assets/utils/diffFilings'
import { useCompareStore } from '@/stores/compareStore'
import { useUserStore } from '@/stores/userStore'
import api_call_methods from '@/assets/api_calls/api_calls'
import tableDiffComponent from './subComponent/tableDiffComponent.vue'
import DiffValue from './subComponent/diffValue.vue'

const router = useRouter()

const props = defineProps({
  filingIdA: {
    type: String,
    required: true,
  },
  filingIdB: {
    type: String,
    required: true,
  },
  switching: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['change-filing-b'])

const userStore = useUserStore()
const relatedFilings = ref([])
const relatedLoading = ref(true)
const compareStore = useCompareStore()
const nameA = computed(() => compareStore.filingNameA)
const nameB = computed(() => compareStore.filingNameB)
const diff = computed(() =>
  diffFilings(compareStore.responseA?.funds || [], compareStore.responseB?.funds || [])
)

function groupByHeading(fields) {
  return (fields || []).reduce((acc, item) => {
    const heading = item.field_heading || 'Other'
    if (!acc[heading]) acc[heading] = []
    acc[heading].push(item)
    return acc
  }, {})
}

function getDisplayFieldNo(fieldNo) {
  if (!fieldNo || typeof fieldNo !== 'string') return ''
  const parts = fieldNo.split('_')
  return parts[parts.length - 1]
}

function getIndent(fieldNo) {
  if (!fieldNo || typeof fieldNo !== 'string') return 0
  const depth = (fieldNo.match(/_/g) || []).length
  return depth * 30
}

onMounted(async () => {
  try {
    relatedLoading.value = true
    const result = await api_call_methods.get_related_filings(userStore.userID, props.filingIdA)
    relatedFilings.value = result.data?.data || []
  } catch (error) {
    console.error('Error fetching related filings:', error)
  } finally {
    relatedLoading.value = false
  }
})

function onFilingChange(event) {
  const selectedId = event.target.value
  if (!selectedId || selectedId === props.filingIdB) return
  const selected = relatedFilings.value.find((filing) => filing.id === selectedId)
  if (!selected) return
  emit('change-filing-b', selected)
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.thick-border { border: 2px solid black; }
.compare-shell {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 20px 12px;
  box-sizing: border-box;
}
.compare-toolbar {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}
.back-btn {
  background: #fff;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  color: #1f2937;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 42px;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  flex-shrink: 0;
}
.back-btn:hover {
  background: #f3f4f6;
}
.filing-pair {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  min-width: 0;
  flex: 1;
}
.filing-side {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1;
}
.filing-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #6b7280;
  margin: 0;
}
.filing-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
  height: 42px;
  display: flex;
  align-items: center;
}
.filing-select {
  width: 100%;
  min-width: 220px;
  height: 42px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  color: #111827;
  font-size: 1rem;
  font-weight: 700;
  padding: 0 12px;
  line-height: 1.3;
}
.filing-select:disabled {
  opacity: 0.7;
}
.compare-arrow {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
}
.arrow-spacer {
  visibility: hidden;
}
.arrow-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  color: #4b5563;
  font-size: 0.95rem;
}
.switching-note {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: #0d6efd;
}
.legend-intro {
  margin: 14px 4px 8px;
  font-size: 0.9rem;
  color: #4b5563;
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 18px;
  padding: 0 4px 14px;
  font-size: 0.85rem;
  color: #374151;
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.swatch {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.swatch.old { background: #b42318; }
.swatch.new { background: #027a48; }
.pdf-viewer { flex: 1; min-height: 0; border: 1px solid #ccc; background: #f2f2f2; padding: 20px; overflow-y: scroll;}
.pdf-page {
  width: 1122px; max-width: 100%; box-sizing: border-box; padding: 40px;
  background: white; margin: auto; box-shadow: 0 0 8px rgba(0,0,0,0.15);
  font-family: 'Times New Roman', serif; line-height: 1.4;
}
.pdf-field { margin-bottom: 25px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
.field-number { font-weight: bold; font-size: 16px; }
.line-item p { margin: 4px 0; }
.line-number { font-weight: bold; margin-right: 5px; }
.line-text { font-style: italic; margin-right: 5px; }
.page-break { page-break-before: always; }
.formatted-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Times New Roman', Times, serif !important;
  line-height: 1.4;
  font-size: 16px;
  font-style: italic;
}
.diff-removed { color: #b42318; }
.diff-changed-old { color: #b42318; }
.diff-changed-new, .diff-added { color: #027a48; font-weight: 600; }
.fund-banner {
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 4px;
}
.removed-banner { background: #fef3f2; color: #b42318; }
.added-banner { background: #ecfdf3; color: #027a48; }
.row-added { background: #ecfdf3; }
.row-removed { background: #fef3f2; }
</style>
