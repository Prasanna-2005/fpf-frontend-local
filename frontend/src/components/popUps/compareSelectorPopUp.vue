<template>
  <div class="compare-backdrop" @click.self="$emit('close-click')">
    <div class="compare-card" role="dialog" aria-modal="true" aria-label="Compare">
      <header class="compare-top">
        <div class="compare-title-wrap">
          <div>
            <h5 class="compare-title">Compare</h5>
            <p class="compare-subtitle">
              <template v-if="mode === 'filings'">
                Only filings from the same reporting company are listed<span v-if="company"> - <strong>{{ company }}</strong></span>.
              </template>
              <template v-else>
                Select any two versions of this filing to compare.
              </template>
            </p>
          </div>
        </div>
        <button class="compare-close" type="button" aria-label="Close" @click="$emit('close-click')">✕</button>
      </header>

      <div class="compare-tabs" role="tablist" aria-label="Compare target">
        <button
          type="button"
          role="tab"
          :aria-selected="mode === 'filings'"
          :class="['compare-tab', { active: mode === 'filings' }]"
          @click="mode = 'filings'"
        >
          Filings
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="mode === 'versions'"
          :class="['compare-tab', { active: mode === 'versions' }]"
          @click="switchToVersions"
        >
          Versions
        </button>
      </div>

      <div class="compare-list">
        <template v-if="mode === 'filings'">
          <div v-if="loading" class="compare-state">
            <span class="spinner-border text-primary" role="status"></span>
            <p>Loading related filings…</p>
          </div>
          <div v-else-if="error" class="compare-state">
            <p class="text-danger mb-0">Could not load related filings.</p>
          </div>
          <div v-else-if="!relatedFilings.length" class="compare-state">
            <p class="mb-0">No related filings found<span v-if="company"> for <strong>{{ company }}</strong></span>.</p>
          </div>
          <label
            v-else
            v-for="filing in relatedFilings"
            :key="filing.id"
            class="compare-row"
            :class="{ selected: selectedId === filing.id }"
          >
            <input
              type="radio"
              class="compare-radio"
              name="relatedFiling"
              :value="filing.id"
              v-model="selectedId"
            />
            <span class="compare-row-body">
              <span class="compare-row-name">{{ filing.filing_name }}</span>
              <span class="compare-row-meta">
                {{ formatDate(filing.modified_on) }}
                <span v-if="filing.filingStatus" class="compare-pill">{{ filing.filingStatus }}</span>
              </span>
            </span>
            <span class="compare-check" aria-hidden="true"></span>
          </label>
        </template>

        <template v-else>
          <div v-if="versionsLoading" class="compare-state">
            <span class="spinner-border text-primary" role="status"></span>
            <p>Loading versions…</p>
          </div>
          <div v-else-if="versionsError" class="compare-state">
            <p class="text-danger mb-0">Could not load versions.</p>
          </div>
          <div v-else-if="!versions.length" class="compare-state">
            <p class="mb-0">No other versions available for this filing yet.</p>
          </div>
          <template v-else>
            <p class="compare-hint">{{ selectedVersions.length }} of 2 versions selected</p>
            <button
              v-for="v in versions"
              :key="v.version"
              type="button"
              class="compare-row"
              :class="{ selected: isVersionSelected(v.version) }"
              @click="toggleVersion(v.version)"
            >
              <span class="compare-row-body">
                <span class="compare-row-name">
                  Version {{ v.version }}
                  <span v-if="v.is_current" class="compare-pill current">Current</span>
                  <span v-else-if="v.version === currentVersionResolved" class="compare-pill">You're viewing</span>
                </span>
                <span class="compare-row-meta">Snapshot of this filing at version {{ v.version }}</span>
              </span>
              <span class="compare-check" aria-hidden="true"></span>
            </button>
          </template>
        </template>
      </div>

      <footer class="compare-footer">
        <span v-if="mode === 'versions' && versions.length > 0" class="compare-footer-hint">
          Pick two versions to enable Compare
        </span>
        <span v-else class="compare-footer-hint"></span>
        <div class="compare-actions">
          <button class="btn-cancel" type="button" @click="$emit('close-click')">Cancel</button>
          <button
            class="btn-compare"
            type="button"
            :disabled="!canCompare"
            @click="confirmCompare"
          >
            Compare
            <span aria-hidden="true">-></span>
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api_call_methods from '@/assets/api_calls/api_calls'
import { useUserStore } from '@/stores/userStore'

const props = defineProps({
  filingId: {
    type: String,
    required: true,
  },
  currentVersion: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['close-click', 'compare-selected'])
const userStore = useUserStore()

const mode = ref('filings')
const company = ref('')
const relatedFilings = ref([])
const selectedId = ref('')
const loading = ref(true)
const error = ref(false)

const versions = ref([])
const selectedVersions = ref([])
const versionsLoading = ref(false)
const versionsError = ref(false)
const versionsLoaded = ref(false)
const currentVersionResolved = ref(Number(props.currentVersion) || 0)

const canCompare = computed(() =>
  mode.value === 'filings' ? Boolean(selectedId.value) : selectedVersions.value.length === 2
)

onMounted(async () => {
  try {
    loading.value = true
    const result = await api_call_methods.get_related_filings(userStore.userID, props.filingId)
    relatedFilings.value = result.data?.data || []
    if (result.data?.company) company.value = result.data.company
    const cv = Number(result.data?.current_version) || 0
    if (!currentVersionResolved.value && cv) currentVersionResolved.value = cv
  } catch (err) {
    error.value = true
    console.error('Error fetching related filings:', err)
  } finally {
    loading.value = false
  }
})

async function loadVersions() {
  if (versionsLoaded.value) return
  versionsLoaded.value = true
  try {
    versionsLoading.value = true
    const result = await api_call_methods.get_filing_versions(userStore.userID, props.filingId)
    versions.value = result.data?.data || []
    if (result.data?.company && !company.value) company.value = result.data.company
    const cv = Number(result.data?.current_version) || 0
    if (!currentVersionResolved.value && cv) currentVersionResolved.value = cv
    // Pre-select the version the user is viewing + the current version when possible
    if (currentVersionResolved.value && versions.value.length >= 2) {
      const viewing = currentVersionResolved.value
      const head = versions.value.find((v) => v.is_current)?.version ?? versions.value[versions.value.length - 1].version
      if (viewing !== head) selectedVersions.value = [viewing, head]
    }
  } catch (err) {
    versionsError.value = true
    console.error('Error fetching filing versions:', err)
  } finally {
    versionsLoading.value = false
  }
}

function switchToVersions() {
  mode.value = 'versions'
  loadVersions()
}

function isVersionSelected(version) {
  return selectedVersions.value.includes(Number(version))
}

function toggleVersion(version) {
  const v = Number(version)
  const idx = selectedVersions.value.indexOf(v)
  if (idx >= 0) {
    selectedVersions.value = selectedVersions.value.filter((item) => item !== v)
    return
  }
  if (selectedVersions.value.length >= 2) {
    selectedVersions.value = [...selectedVersions.value.slice(1), v]
  } else {
    selectedVersions.value = [...selectedVersions.value, v]
  }
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString()
}

function confirmCompare() {
  if (mode.value === 'filings') {
    const selected = relatedFilings.value.find((filing) => filing.id === selectedId.value)
    if (!selected) return
    emit('compare-selected', { mode: 'filings', id: selected.id, filing_name: selected.filing_name })
    return
  }
  if (selectedVersions.value.length !== 2) return
  const [a, b] = [...selectedVersions.value].sort((x, y) => x - y)
  emit('compare-selected', {
    mode: 'versions',
    filingId: props.filingId,
    versionA: a,
    versionB: b,
  })
}
</script>

<style scoped>
.compare-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
  animation: compare-fade 0.15s ease-out;
}

.compare-card {
  background: #ffffff;
  width: 600px;
  max-width: 100%;
  max-height: 82vh;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.22);
  overflow: hidden;
  animation: compare-pop 0.18s ease-out;
}

.compare-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 20px 12px;
}

.compare-title-wrap {
  display: flex;
  gap: 12px;
  min-width: 0;
}

.compare-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.compare-subtitle {
  margin: 4px 0 0;
  font-size: 0.85rem;
  line-height: 1.45;
  color: #64748b;
}

.compare-subtitle strong {
  color: #0f172a;
  font-weight: 700;
}

.compare-close {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: #64748b;
  font-size: 0.9rem;
  cursor: pointer;
  line-height: 1;
}

.compare-close:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.compare-tabs {
  margin: 4px 20px 0;
  padding: 4px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.compare-tab {
  border: 0;
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #64748b;
  background: transparent;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease, box-shadow 0.12s ease;
}

.compare-tab.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.14);
}

.compare-list {
  flex: 1 1 auto;
  min-height: 220px;
  overflow-y: auto;
  padding: 14px 20px 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.compare-state {
  text-align: center;
  padding: 40px 12px;
  color: #64748b;
  font-size: 0.9rem;
}

.compare-state p {
  margin: 10px 0 0;
}

.compare-hint {
  margin: 2px 2px 4px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #64748b;
}

.compare-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  text-align: left;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  background: #ffffff;
  transition: border-color 0.12s ease, background 0.12s ease, box-shadow 0.12s ease;
  font: inherit;
  color: inherit;
}

.compare-row:hover {
  border-color: #93c5fd;
  background: #f8fbff;
}

.compare-row.selected {
  border-color: #2563eb;
  background: #eff6ff;
  box-shadow: 0 0 0 1px #2563eb inset;
}

.compare-radio {
  margin-top: 3px;
  accent-color: #2563eb;
}

.compare-row-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.compare-row-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.compare-row-meta {
  font-size: 0.8rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.compare-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #334155;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
}

.compare-pill.current {
  color: #166534;
  background: #dcfce7;
  border-color: #bbf7d0;
}

.compare-check {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 2px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  position: relative;
  transition: border-color 0.12s ease, background 0.12s ease;
}

.compare-row.selected .compare-check {
  border-color: #2563eb;
  background: #2563eb;
}

.compare-row.selected .compare-check::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 5px;
  height: 9px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.compare-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px 18px;
  border-top: 1px solid #eef2f7;
  background: #ffffff;
}

.compare-footer-hint {
  font-size: 0.78rem;
  color: #94a3b8;
}

.compare-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.btn-cancel {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #334155;
  font-weight: 600;
  font-size: 0.88rem;
  padding: 9px 16px;
  border-radius: 10px;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #f8fafc;
}

.btn-compare {
  border: 1px solid #1d4ed8;
  background: #2563eb;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.88rem;
  padding: 9px 18px;
  border-radius: 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.28);
}

.btn-compare:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-compare:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

@keyframes compare-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes compare-pop {
  from { opacity: 0; transform: translateY(10px) scale(0.99); }
  to { opacity: 1; transform: none; }
}
</style>
