<template>
  <div class="dashboard">
    <header class="dash-header">
      <h1>Dashboard</h1>
      <div class="header-right">
        <div class="user">
          <div class="user-avatar" aria-hidden="true">{{ userInitial }}</div>
          <div class="user-info">
            <div class="name">{{ username }}</div>
            <div class="role">{{ role }}</div>
          </div>
        </div>
      </div>
    </header>

    <FilingStatsCards :stats="stats" />

    <section class="panel">
      <div class="panel-toolbar">
        <h2>All Filings</h2>
        <div class="toolbar-actions">
          <div class="search">
            <label class="visually-hidden" for="filings-search">Search filings</label>
            <font-awesome-icon icon="search" aria-hidden="true" />
            <input
              id="filings-search"
              type="search"
              placeholder="Search"
              v-model="searchQuery"
              @input="currentPage = 1"
            />
          </div>
          <label class="visually-hidden" for="filings-status">Filter by status</label>
          <select
            id="filings-status"
            class="select"
            v-model="selectedStatus"
            @change="currentPage = 1"
          >
            <option value="all">Filter: All Status</option>
            <option value="Review">Review</option>
            <option value="Approved">Approved</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
          <label class="visually-hidden" for="filings-year">Filter by year</label>
          <select
            id="filings-year"
            class="select"
            v-model="selectedYear"
            @change="currentPage = 1"
          >
            <option value="Year">Select Year</option>
            <option v-for="year in yearOptions" :key="year" :value="String(year)">
              {{ year }}
            </option>
          </select>
          <button type="button" class="btn-create" @click="handleUploadClick">
            + Create New Filing
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="loading-state">
        <p>Loading Filings table....</p>
      </div>

      <template v-else>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">S/N</th>
                <th scope="col">Filing Name</th>
                <th scope="col">Prepared By</th>
                <th scope="col">Status</th>
                <th scope="col">Modified By</th>
                <th scope="col" class="sortable" @click="toggleSortOrder">
                  Modified On
                  <span class="sort-icons" aria-hidden="true">
                    <font-awesome-icon icon="angle-up" />
                    <font-awesome-icon icon="angle-down" />
                  </span>
                </th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in paginatedData" :key="row.id || index">
                <td class="sn">{{ serialNumber(index) }}</td>
                <td>
                  <a
                    href="#"
                    class="filing-link"
                    @click.prevent="goToEditing(row.id, row.filingStatus, row.filing_name)"
                  >
                    {{ row.filing_name }}
                  </a>
                </td>
                <td>
                  <div class="person">
                    <span class="avatar" :class="avatarColor(row.prepared_by)">
                      {{ getInitials(row.prepared_by) }}
                    </span>
                    <span class="text-capitalize">{{ row.prepared_by }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge" :class="statusClass(row.filingStatus)">
                    {{ statusLabel(row.filingStatus) }}
                  </span>
                </td>
                <td>
                  <div class="person">
                    <span class="avatar" :class="avatarColor(row.modified_by)">
                      {{ getInitials(row.modified_by) }}
                    </span>
                    <span class="text-capitalize">{{ row.modified_by }}</span>
                  </div>
                </td>
                <td>{{ formatFilingDate(row.modified_on) }}</td>
                <td>
                  <div class="actions">
                    <button
                      type="button"
                      class="download"
                      :disabled="normalizeStatus(row.filingStatus) !== 'approved'"
                      aria-label="Download XML"
                      @click="downloadXML(row.id)"
                    >
                      <font-awesome-icon icon="download" />
                    </button>
                    <button
                      type="button"
                      class="delete"
                      :disabled="normalizeStatus(row.filingStatus) === 'archived'"
                      aria-label="Archive filing"
                      @click="deleteFiling(row.id)"
                    >
                      <font-awesome-icon icon="trash" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedData.length === 0">
                <td colspan="7" class="empty-row">No filings found</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <div class="show-rows">
            <label for="filings-page-size">Show</label>
            <select id="filings-page-size" v-model.number="itemsPerPage" @change="currentPage = 1">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>
            of {{ filteredData.length }}
          </div>
          <div class="page-nav">
            <button
              type="button"
              aria-label="Previous page"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              <font-awesome-icon icon="angle-left" />
            </button>
            <span>{{ currentPage }} / {{ totalPages }}</span>
            <button
              type="button"
              aria-label="Next page"
              :disabled="currentPage >= totalPages"
              @click="goToPage(currentPage + 1)"
            >
              <font-awesome-icon icon="angle-right" />
            </button>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api_call_methods from '@/assets/api_calls/api_calls'
import { useUserStore } from '@/stores/userStore'
import { useEditableStore } from '@/stores/responseStore'
import { useToast } from 'vue-toast-notification'
import utils from '@/assets/utils/utils'
import { useFileStore } from '@/stores/fileStore'
import FilingStatsCards from '@/components/Home/FilingStatsCards.vue'
import {
  normalizeStatus,
  statusClass,
  statusLabel,
  matchesStatusFilter,
  getInitials,
  avatarColor,
  formatFilingDate,
  computeFilingStats,
} from '@/assets/utils/filingDashboardUtils'

const responseStore = useEditableStore()
const userStore = useUserStore()
const isLoading = ref(true)
const data = ref({ data: [] })
const user_id = userStore.userID
const router = useRouter()
const role = userStore.role
const username = userStore.username
const toast = useToast()
const fileStore = useFileStore()

const userInitial = computed(() => (username || '?').charAt(0).toUpperCase())

const stats = computed(() => computeFilingStats(data.value?.data || []))

const yearOptions = computed(() => {
  const years = new Set()
  const current = new Date().getFullYear()
  years.add(current)
  years.add(current - 1)
  years.add(current - 2)

  for (const item of data.value?.data || []) {
    if (item.modified_on) {
      years.add(new Date(item.modified_on).getFullYear())
    }
  }

  return [...years].filter((y) => !Number.isNaN(y)).sort((a, b) => b - a)
})

function serialNumber(index) {
  return String((currentPage.value - 1) * itemsPerPage.value + index + 1).padStart(2, '0')
}

function goToEditing(filingId, filingStatus, filingName) {
  responseStore.setStatus(filingStatus)
  localStorage.setItem('filingName', filingName)
  if (filingStatus === 'Approved' || filingStatus === 'Review') {
    router.push({ name: 'preview', query: { filing_id: filingId } })
  } else {
    router.push({ name: 'editing', query: { filing_id: filingId } })
  }
}

async function downloadXML(filingId) {
  try {
    toast.info('Downloading XML.....')
    const result = await api_call_methods.get_xml_data(user_id, filingId)
    utils.downloadXMLFile(result.data)
    toast.success('XML file downloaded')
  } catch (error) {
    console.error(error)
    toast.error('Failed to download XML')
  }
}

async function deleteFiling(filingId) {
  try {
    toast.info('Archiving filing.....')
    await api_call_methods.update_status(user_id, filingId, 'Archived')
    data.value = {
      ...data.value,
      data: (data.value.data || []).map((item) =>
        item.id === filingId ? { ...item, filingStatus: 'Archived' } : item
      ),
    }
    toast.success('Filing archived successfully')
  } catch (error) {
    console.error(error)
    toast.error('Failed to archive filing')
  }
}

onMounted(async () => {
  try {
    const clientCode = userStore.clientCode
    isLoading.value = true
    const result = await api_call_methods.filings_list(user_id, clientCode)
    data.value = result
    const names = (result.data || []).map((item) => item.filing_name.toLowerCase())
    fileStore.setExistingNames(names)
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.error('Failed to load filings')
  } finally {
    isLoading.value = false
  }
})

const currentPage = ref(1)
const itemsPerPage = ref(10)
const searchQuery = ref('')
const selectedYear = ref('Year')
const selectedStatus = ref('all')
const sortOrder = ref('desc')

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

const filteredData = computed(() => {
  let tempData = data.value?.data || []

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    tempData = tempData.filter((item) =>
      Object.values(item).some((value) => String(value).toLowerCase().includes(q))
    )
  }

  if (selectedStatus.value && selectedStatus.value !== 'all') {
    tempData = tempData.filter((item) =>
      matchesStatusFilter(item.filingStatus, selectedStatus.value)
    )
  }

  if (selectedYear.value && selectedYear.value !== 'Year') {
    tempData = tempData.filter((item) => {
      if (!item.modified_on) return false
      const year = new Date(item.modified_on).getFullYear()
      return year === Number(selectedYear.value)
    })
  }

  return [...tempData].sort((a, b) => {
    const isAArchived = normalizeStatus(a.filingStatus) === 'archived'
    const isBArchived = normalizeStatus(b.filingStatus) === 'archived'

    if (isAArchived && !isBArchived) return 1
    if (!isAArchived && isBArchived) return -1

    const dateA = new Date(a.modified_on)
    const dateB = new Date(b.modified_on)

    return sortOrder.value === 'desc' ? dateB - dateA : dateA - dateB
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredData.value.length / itemsPerPage.value) || 1)
)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredData.value.slice(start, start + itemsPerPage.value)
})

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const emit = defineEmits(['trigger-upload'])
function handleUploadClick() {
  emit('trigger-upload')
}
</script>

<style scoped>
.dashboard {
  --dash-primary: #1e3a8a;
  --dash-link: #2563eb;
  --dash-muted: #6b7280;
  --dash-border: #e5e7eb;
  --dash-card: #fff;
  --dash-danger: #dc2626;

  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  overflow: hidden;
  padding: 4px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.dash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.dash-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1e3a8a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
}

.user-info .name {
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: capitalize;
  line-height: 1.25;
}

.user-info .role {
  font-size: 0.75rem;
  color: var(--dash-muted);
  text-transform: capitalize;
}

.panel {
  background: var(--dash-card);
  border: 1px solid var(--dash-border);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.panel-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.panel-toolbar h2 {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search {
  position: relative;
}

.search :deep(svg) {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.85rem;
}

.search input {
  border: 1px solid var(--dash-border);
  border-radius: 8px;
  padding: 9px 12px 9px 36px;
  font-size: 0.875rem;
  width: 180px;
  outline: none;
  background: #fff;
}

.search input:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.select {
  border: 1px solid var(--dash-border);
  border-radius: 8px;
  padding: 9px 32px 9px 12px;
  font-size: 0.875rem;
  background: #fff
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")
    no-repeat right 10px center;
  appearance: none;
  cursor: pointer;
  color: #1f2937;
  outline: none;
}

.btn-create {
  background: var(--dash-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.btn-create:hover {
  background: #1e40af;
}

.loading-state {
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dash-muted);
}

.table-wrap {
  overflow: auto;
  flex: 1;
  min-height: 0;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.875rem;
}

thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #e8eef8;
  color: var(--dash-muted);
  font-weight: 600;
  text-align: left;
  padding: 14px 16px;
  white-space: nowrap;
  border-bottom: 1px solid #dbe3f0;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.03em;
}

thead th:first-child {
  border-radius: 8px 0 0 8px;
}

thead th:last-child {
  border-radius: 0 8px 8px 0;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sort-icons {
  display: inline-flex;
  flex-direction: column;
  margin-left: 4px;
  vertical-align: middle;
  opacity: 0.45;
  line-height: 0.6;
  font-size: 0.55rem;
}

tbody td {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
  color: #374151;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background: #fafbfc;
}

.sn {
  color: var(--dash-muted);
  font-weight: 500;
}

.filing-link {
  color: var(--dash-link);
  text-decoration: none;
  font-weight: 500;
}

.filing-link:hover {
  text-decoration: underline;
}

.person {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.avatar.blue { background: #3b82f6; }
.avatar.teal { background: #14b8a6; }
.avatar.purple { background: #8b5cf6; }
.avatar.pink { background: #ec4899; }
.avatar.indigo { background: #6366f1; }
.avatar.cyan { background: #06b6d4; }
.avatar.amber { background: #f59e0b; }
.avatar.rose { background: #f43f5e; }

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
}

.badge::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.badge.review {
  background: #ffedd5;
  color: #9a3412;
}
.badge.approved {
  background: #dcfce7;
  color: #166534;
}
.badge.draft {
  background: #f1f5f9;
  color: #334155;
}
.badge.archived {
  background: #fee2e2;
  color: var(--dash-danger);
}

.actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.actions button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  font-size: 1rem;
}

.actions .download {
  color: var(--dash-link);
}
.actions .delete {
  color: var(--dash-danger);
}
.actions button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.empty-row {
  text-align: center;
  color: var(--dash-muted);
  padding: 40px 16px !important;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 8px;
  flex-wrap: wrap;
  gap: 12px;
  flex-shrink: 0;
}

.show-rows {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--dash-muted);
}

.show-rows select {
  border: 1px solid var(--dash-border);
  border-radius: 6px;
  padding: 6px 28px 6px 10px;
  font-size: 0.875rem;
  appearance: none;
  background: #fff
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")
    no-repeat right 8px center;
  cursor: pointer;
}

.page-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.page-nav button {
  background: none;
  border: 1px solid var(--dash-border);
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--dash-muted);
}

.page-nav button:hover:not(:disabled) {
  background: #f9fafb;
}

.page-nav button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
