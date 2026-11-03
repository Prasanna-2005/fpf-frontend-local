<template>
  <div class="compare-shell">
    <div class="compare-toolbar">
      <button type="button" class="back-btn" aria-label="Back" @click="goBack">
        <font-awesome-icon icon="arrow-left" />
        Back
      </button>

      <div class="filing-pair">
        <div class="filing-side">
          <span class="filing-label">{{ compareMode === 'versions' ? 'Version A' : 'Current filing' }}</span>
          <h5 class="filing-name">{{ nameA || 'Current filing' }}</h5>
        </div>
        <div class="compare-arrow" aria-hidden="true">
          <span class="filing-label arrow-spacer">&nbsp;</span>
          <span class="arrow-icon">
            <font-awesome-icon icon="arrow-right" />
          </span>
        </div>
        <div class="filing-side filing-picker">
          <label v-if="compareMode === 'versions'" class="filing-label" for="compare-version-b">Version B</label>
          <label v-else class="filing-label" for="compare-filing-b">Selected filing</label>
          <select
            v-if="compareMode === 'versions'"
            id="compare-version-b"
            class="filing-select"
            :value="versionB"
            :disabled="versionsLoading || switching"
            @change="onVersionChange"
          >
            <option v-if="versionsLoading" value="" disabled>Loading versions…</option>
            <option
              v-else-if="versionB && !otherVersions.some((v) => String(v.version) === String(versionB))"
              :value="versionB"
            >
              Version {{ versionB }}
            </option>
            <option
              v-for="v in otherVersions"
              :key="v.version"
              :value="String(v.version)"
            >
              Version {{ v.version }}{{ v.is_current ? ' (current)' : '' }}
            </option>
          </select>
          <select
            v-else
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

    <div class="legend-card">
      <p class="legend-intro">
        <font-awesome-icon icon="code-compare" class="legend-ic" />
        <span>{{
          compareMode === 'versions'
            ? 'Color shows how Version B differs from Version A of the same filing.'
            : 'Color shows how the selected filing differs from the current filing.'
        }}</span>
      </p>
      <div class="legend-row">
      <div class="legend">
        <span class="legend-item" style="color: #b42318">
          <span class="swatch old"></span>
          Value in {{ compareMode === 'versions' ? 'Version A' : 'current filing' }} ({{ nameA || 'A' }})
        </span>
        <span class="legend-item" style="color: #027a48">
          <span class="swatch new"></span>
          Value in {{ compareMode === 'versions' ? 'Version B' : 'selected filing' }} ({{ nameB || 'B' }})
        </span>
      </div>
      </div>
    </div>

    <div class="pdf-viewer">
      <div class="pdf-page">
        <div
          v-for="(fund, idx) in diff.funds"
          :key="fund.fund_id || fund.fund_name || idx"
          :class="['pdf-series', idx > 0 ? 'page-break' : '']"
        >
          <div class="fund-head">
            <h4 class="fund-name">{{ fund.fund_name }}</h4>
            <span class="fund-sub">Information about the private funds you advise</span>
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
              :class="fieldRowClass(fields)"
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
                      <td v-for="(cell, colIndex) in row.cells" :key="colIndex" :class="cellClass(cell)">
                        <DiffValue :leaf="cell" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

                <div v-if="fields.subItems?.length" class="field-content">
                  <div v-for="(items, itemIndex) in fields.subItems" :key="items.line_item_no || itemIndex" class="sub-item" :class="subItemClass(items)">
                  <p>
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
                          <td v-for="(cell, colIndex) in row.cells" :key="colIndex" :class="cellClass(cell)">
                            <DiffValue :leaf="cell" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
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
  versionA: {
    type: String,
    default: '',
  },
  versionB: {
    type: String,
    default: '',
  },
  compareMode: {
    type: String,
    default: 'filings',
  },
  switching: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['change-filing-b', 'change-version-b'])

const userStore = useUserStore()
const relatedFilings = ref([])
const relatedLoading = ref(true)
const filingVersions = ref([])
const versionsLoading = ref(false)
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

function fieldRowClass(field) {
  const status = field?.value?.status
  if (status === 'changed') return 'is-changed'
  if (status === 'added') return 'is-added'
  if (status === 'removed') return 'is-removed'
  return ''
}

/* Highlight only the exact sub-question line that changed — same rule as
   table cells. The parent question row stays untouched. */
function subItemClass(item) {
  const status = item?.value?.status
  if (status === 'changed') return 'sub-changed'
  if (status === 'added') return 'sub-added'
  if (status === 'removed') return 'sub-removed'
  return ''
}

function cellClass(cell) {
  const status = cell?.status
  if (status === 'changed') return 'cell-changed'
  if (status === 'added') return 'cell-added'
  if (status === 'removed') return 'cell-removed'
  return ''
}

/* Side B version options: every version except the fixed base (Version A). */
const otherVersions = computed(() =>
  (filingVersions.value || []).filter((v) => String(v.version) !== String(props.versionA))
)

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
  if (props.compareMode === 'versions') {
    try {
      versionsLoading.value = true
      const result = await api_call_methods.get_filing_versions(userStore.userID, props.filingIdA)
      filingVersions.value = result.data?.data || []
    } catch (error) {
      console.error('Error fetching filing versions:', error)
    } finally {
      versionsLoading.value = false
    }
  }
})

function onFilingChange(event) {
  const selectedId = event.target.value
  if (!selectedId || selectedId === props.filingIdB) return
  const selected = relatedFilings.value.find((filing) => filing.id === selectedId)
  if (!selected) return
  emit('change-filing-b', selected)
}

function onVersionChange(event) {
  const selectedVersion = event.target.value
  if (!selectedVersion || String(selectedVersion) === String(props.versionB)) return
  emit('change-version-b', Number(selectedVersion))
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
  align-items: stretch;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05), 0 6px 18px rgba(16, 24, 40, 0.06);
}
.back-btn {
  background: #fff;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  color: #1f2937;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  gap: 8px;
  height: 42px;
  padding: 0 14px;
  border-radius: 9px;
  font-size: 0.85rem;
  font-weight: 600;
  flex-shrink: 0;
  transition: background 0.12s ease, border-color 0.12s ease;
}
.back-btn:hover {
  background: #f8fafc;
  border-color: #d1d5db;
}
.filing-pair {
  display: flex;
  align-items: stretch;
  gap: 10px;
  min-width: 0;
  flex: 1;
}
.filing-side {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  min-width: 0;
  flex: 1;
  background: #f8fafc;
  border: 1px solid #eef1f4;
  border-radius: 10px;
  padding: 8px 14px;
}
.filing-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6b7280;
  margin: 0;
}
.filing-name {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.filing-select {
  width: 100%;
  min-width: 200px;
  height: 32px;
  border: 1px solid #d1d5db;
  border-radius: 7px;
  background: #fff;
  color: #111827;
  font-size: 0.95rem;
  font-weight: 700;
  padding: 0 8px;
  line-height: 1.3;
  outline: none;
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
}
.filing-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.12);
}
.filing-select:disabled {
  opacity: 0.7;
}
.compare-arrow {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.arrow-spacer {
  visibility: hidden;
}
.arrow-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px solid #e5e7eb;
  color: #4b5563;
  font-size: 0.85rem;
}
.switching-note {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: #0d6efd;
}
.legend-card {
  margin-top: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px 16px 12px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
}
.legend-intro {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}
.legend-ic {
  color: #6b7280;
  font-size: 0.8rem;
}
.legend-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 16px;
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 18px;
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
.fund-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
  border: 1px solid #111;
  padding: 10px 14px;
  margin-bottom: 8px;
}
.fund-head .fund-name {
  margin: 0;
  font-size: 1.25rem;
}
.fund-sub {
  margin: 0;
  font-size: 1rem;
  color: #374151;
}
.pdf-field { margin-bottom: 25px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
.pdf-field.is-changed { background: #fff7e0; box-shadow: inset 3px 0 0 #e8930c; padding-left: 8px; }
.pdf-field.is-added { background: #eafbef; box-shadow: inset 3px 0 0 #12b76a; padding-left: 8px; }
.pdf-field.is-removed { background: #fdeeee; box-shadow: inset 3px 0 0 #d92d20; padding-left: 8px; }
.sub-item { border-radius: 6px; padding: 2px 8px; }
.sub-item.sub-changed { background: #fff7e0; box-shadow: inset 3px 0 0 #e8930c; }
.sub-item.sub-added { background: #eafbef; box-shadow: inset 3px 0 0 #12b76a; }
.sub-item.sub-removed { background: #fdeeee; box-shadow: inset 3px 0 0 #d92d20; }
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
.cell-changed { background: #fff8e6; }
.cell-added { background: #e6f9ee; }
.cell-removed { background: #fdecea; }
</style>
