<template>
  <section class="panel">
    <div class="panel-head">
      <div>
        <h2>Admins</h2>
        <p class="hint">All client admins, sorted by client name.</p>
      </div>
      <button type="button" class="btn-primary" @click="openCreate">Create Client</button>
    </div>

    <div class="toolbar">
      <label class="filter" for="clientFilter">Client</label>
      <select id="clientFilter" v-model="clientFilter" class="text-input">
        <option value="all">All clients</option>
        <option v-for="name in clientNames" :key="name" :value="name">{{ name }}</option>
      </select>
    </div>

    <div v-if="isLoading" class="state-box">Loading admins…</div>
    <div v-else-if="loadError" class="state-box error">Admins could not be loaded.</div>
    <div v-else-if="!admins.length" class="state-box">No admins yet.</div>
    <div v-else-if="!visibleAdmins.length" class="state-box">No admins for this client.</div>
    <div v-else class="table-scroll">
    <table>
      <thead>
        <tr>
          <th>Client</th>
          <th>Admin</th>
          <th>Client Admin Email</th>
          <th>Reset Password</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in pagedAdmins" :key="user.user_id">
          <td>{{ user.client_code }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td class="actions">
            <button
              type="button"
              class="icon-btn"
              title="Send Password Reset Link"
              aria-label="Send Password Reset Link"
              @click="sendReset(user)"
            >
              <font-awesome-icon icon="envelope" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    </div>

    <div v-if="!isLoading && !loadError && visibleAdmins.length" class="pagination">
      <div class="show-rows">
        <label for="admin-page-size">Show</label>
        <select id="admin-page-size" v-model.number="pageSize" class="text-input page-size">
          <option :value="8">8</option>
          <option :value="10">10</option>
          <option :value="25">25</option>
        </select>
        of {{ visibleAdmins.length }}
      </div>
      <div class="page-nav">
        <button type="button" aria-label="Previous page" :disabled="currentPage === 1" @click="currentPage -= 1">
          <font-awesome-icon icon="angle-left" />
        </button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button type="button" aria-label="Next page" :disabled="currentPage >= totalPages" @click="currentPage += 1">
          <font-awesome-icon icon="angle-right" />
        </button>
      </div>
    </div>

    <div v-if="showCreate" class="modal-backdrop" @click.self="closeCreate">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="create-client-title">
        <div class="modal-header">
          <div>
            <h2 id="create-client-title">Create Client</h2>
            <p class="subtitle">Add a client and its admin. The admin receives a login email.</p>
          </div>
          <button type="button" class="modal-close" aria-label="Close" @click="closeCreate">
            <font-awesome-icon icon="xmark" />
          </button>
        </div>

        <form class="modal-body" novalidate @submit.prevent="createClient">
          <div class="field">
            <label class="field-label" for="clientName">Client name</label>
            <select id="clientName" v-model="selectedClient" class="text-input">
              <option disabled value="">Select a client</option>
              <option v-for="name in clientNames" :key="name" :value="name">{{ name }}</option>
              <option value="others">Others</option>
            </select>
            <p v-if="errors.client" class="error-text">{{ errors.client }}</p>
          </div>

          <div v-if="selectedClient === 'others'" class="field">
            <label class="field-label" for="newClientName">New client name</label>
            <input
              id="newClientName"
              v-model="newClientName"
              class="text-input"
              maxlength="20"
              placeholder="Enter a new client name"
            />
            <p v-if="errors.newClient" class="error-text">{{ errors.newClient }}</p>
          </div>

          <div class="field">
            <label class="field-label" for="adminName">Admin name</label>
            <input id="adminName" v-model="adminName" class="text-input" placeholder="Admin name" />
            <p v-if="errors.adminName" class="error-text">{{ errors.adminName }}</p>
          </div>

          <div class="field">
            <label class="field-label" for="adminEmail">Admin email</label>
            <input
              id="adminEmail"
              v-model="adminEmail"
              class="text-input"
              type="email"
              placeholder="name@company.com"
              autocomplete="off"
            />
            <p v-if="errors.adminEmail" class="error-text">{{ errors.adminEmail }}</p>
          </div>

          <div class="field">
            <label class="field-label" for="adminPassword">Password</label>
            <input
              id="adminPassword"
              v-model="adminPassword"
              class="text-input"
              type="password"
              autocomplete="new-password"
            />
            <p v-if="errors.adminPassword" class="error-text">{{ errors.adminPassword }}</p>
          </div>

          <div class="field">
            <label class="field-label" for="adminConfirmPassword">Confirm password</label>
            <input
              id="adminConfirmPassword"
              v-model="adminConfirmPassword"
              class="text-input"
              type="password"
              autocomplete="new-password"
            />
            <p v-if="errors.adminConfirmPassword" class="error-text">{{ errors.adminConfirmPassword }}</p>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeCreate">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Creating…' : 'Create client' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import api_call_methods from '@/assets/api_calls/api_calls'
import { useToast } from 'vue-toast-notification'

const userStore = useUserStore()
const toast = useToast()
const userId = userStore.userID
const admins = ref([])
const isLoading = ref(true)
const loadError = ref(false)
const isSaving = ref(false)
const showCreate = ref(false)
const clientFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(8)
const selectedClient = ref('')
const newClientName = ref('')
const adminName = ref('')
const adminEmail = ref('')
const adminPassword = ref('')
const adminConfirmPassword = ref('')
const errors = ref({})

const clientNames = computed(() => {
  const names = new Set(admins.value.map((user) => user.client_code).filter(Boolean))
  return [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
})

const visibleAdmins = computed(() => {
  const rows = clientFilter.value === 'all'
    ? admins.value
    : admins.value.filter((user) => user.client_code === clientFilter.value)
  return [...rows].sort((a, b) => {
    const byClient = String(a.client_code || '').localeCompare(String(b.client_code || ''), undefined, { sensitivity: 'base' })
    if (byClient !== 0) return byClient
    return String(a.username || '').localeCompare(String(b.username || ''), undefined, { sensitivity: 'base' })
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(visibleAdmins.value.length / pageSize.value)))

const pagedAdmins = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return visibleAdmins.value.slice(start, start + pageSize.value)
})

watch([clientFilter, pageSize], () => {
  currentPage.value = 1
})

watch(visibleAdmins, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

onMounted(loadAdmins)

async function loadAdmins() {
  try {
    isLoading.value = true
    loadError.value = false
    const result = await api_call_methods.get_client_admins(userId)
    admins.value = result.data.users || []
    if (clientFilter.value !== 'all' && !clientNames.value.includes(clientFilter.value)) {
      clientFilter.value = 'all'
    }
  } catch (error) {
    console.error(error)
    loadError.value = true
    admins.value = []
  } finally {
    isLoading.value = false
  }
}

function openCreate() {
  selectedClient.value = ''
  newClientName.value = ''
  adminName.value = ''
  adminEmail.value = ''
  adminPassword.value = ''
  adminConfirmPassword.value = ''
  errors.value = {}
  showCreate.value = true
}

function closeCreate() {
  if (isSaving.value) return
  showCreate.value = false
}

function emailValid(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function validate() {
  const next = {}
  if (!selectedClient.value) {
    next.client = 'Select a client name.'
  } else if (selectedClient.value !== 'others') {
    next.client = 'This client already exists. Select Others to add a new client name.'
  }
  const clientName = newClientName.value.trim()
  if (selectedClient.value === 'others' && !clientName) {
    next.newClient = 'Enter a client name.'
  } else if (selectedClient.value === 'others' && clientName.length > 20) {
    next.newClient = 'Use 20 characters or fewer.'
  } else if (selectedClient.value === 'others' && clientNames.value.some((name) => name.toLowerCase() === clientName.toLowerCase())) {
    next.newClient = 'This client already exists.'
  }
  if (!adminName.value.trim()) {
    next.adminName = 'Enter the admin name.'
  }
  const email = adminEmail.value.trim()
  if (!email) {
    next.adminEmail = 'Enter an email address.'
  } else if (!emailValid(email)) {
    next.adminEmail = 'Enter a valid email address.'
  }
  if (!adminPassword.value) {
    next.adminPassword = 'Enter a password.'
  }
  if (!adminConfirmPassword.value) {
    next.adminConfirmPassword = 'Confirm the password.'
  } else if (adminPassword.value !== adminConfirmPassword.value) {
    next.adminConfirmPassword = 'Passwords do not match.'
  }
  errors.value = next
  return Object.keys(next).length === 0
}

async function createClient() {
  if (!validate()) return
  try {
    isSaving.value = true
    await api_call_methods.create_client({
      client_code: newClientName.value.trim(),
      admin_username: adminName.value.trim(),
      admin_email: adminEmail.value.trim(),
      admin_password: adminPassword.value,
    }, userId)
    toast.success('Client created')
    showCreate.value = false
    await loadAdmins()
  } catch (error) {
    console.error(error)
    toast.error(error.response?.data?.message || 'Client could not be created')
  } finally {
    isSaving.value = false
  }
}

async function sendReset(user) {
  try {
    await api_call_methods.send_reset_link(user.user_id, userId)
    toast.success('A code was sent to their email')
  } catch (error) {
    console.error(error)
    toast.error('The code could not be sent')
  }
}
</script>

<style scoped>
.panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
}

.panel h2,
.modal-header h2 {
  margin: 0;
  font-size: 1.15rem;
  color: #111827;
}

.hint,
.subtitle {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 18px 0;
  flex-shrink: 0;
}

.filter {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.text-input,
.btn-primary,
.btn-secondary {
  border-radius: 8px;
  padding: 10px 12px;
  font: inherit;
}

.text-input {
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111827;
  min-width: 180px;
}

.btn-primary,
.btn-secondary,
.icon-btn,
.modal-close {
  cursor: pointer;
}

.btn-primary,
.btn-secondary {
  font-weight: 600;
}

.btn-primary {
  background: #1e3a8a;
  color: #fff;
  border: 1px solid #1e3a8a;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #111827;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 10px 8px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.9rem;
}

.actions {
  width: 140px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.show-rows,
.page-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 0.875rem;
}

.page-size {
  min-width: 72px;
  padding: 6px 10px;
}

.page-nav button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  cursor: pointer;
}

.page-nav button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e3a8a;
}

.state-box {
  color: #6b7280;
}

.state-box.error {
  color: #b91c1c;
}

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
  width: min(520px, 100%);
  max-height: calc(100vh - 48px);
  overflow: auto;
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 22px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-close {
  background: none;
  border: none;
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
  color: #111827;
}

.modal-body {
  padding: 20px 22px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-body .text-input {
  width: 100%;
  min-width: 0;
}

.error-text {
  margin: 0;
  color: #dc2626;
  font-size: 0.85rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 800px) {
  .panel-head,
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
