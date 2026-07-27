<template>
  <section class="panel">
    <div v-if="isLoading" class="state-box">
      <span class="ui-spinner" role="status" aria-hidden="true"></span>
      <p>Loading users…</p>
    </div>

    <div v-else-if="!filteredData.length" class="state-box">
      <p>No users found for {{ selectedYear }}.</p>
    </div>

    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">S/N</th>
            <th scope="col">Name</th>
            <th scope="col">Role</th>
            <th scope="col">Email</th>
            <th scope="col">Created At</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in filteredData" :key="user.email || index">
            <td class="sn">{{ String(index + 1).padStart(2, '0') }}</td>
            <td>
              <div class="person">
                <span class="avatar">{{ getInitials(user.username) }}</span>
                <span class="username">{{ user.username }}</span>
              </div>
            </td>
            <td>
              <span class="role-badge" :class="roleClass(user.role)">
                {{ formatRole(user.role) }}
              </span>
            </td>
            <td class="email">{{ user.email }}</td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>
              <button
                type="button"
                class="icon-btn"
                title="Edit user"
                aria-label="Edit user"
                @click="openEditUser(user.username, user.email, user.role)"
              >
                <font-awesome-icon icon="pen" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import api_call_methods from '@/assets/api_calls/api_calls'

const props = defineProps({
  selectedYear: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['delete-user', 'edit-user'])

const userStore = useUserStore()
const userId = userStore.userID
const data = ref([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    isLoading.value = true
    const result = await api_call_methods.get_users(userId)
    data.value = result.data.users || []
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    isLoading.value = false
  }
})

const filteredData = computed(() => {
  return data.value.filter((user) => {
    if (!user.created_at) return false
    return new Date(user.created_at).getFullYear().toString() === props.selectedYear
  })
})

function openEditUser(username, email, role) {
  emit('edit-user', { username, email, role })
}

function getInitials(name = '') {
  const parts = String(name).split(/[.\s_-]+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function formatRole(role = '') {
  if (!role) return '—'
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
}

function roleClass(role = '') {
  const r = String(role).toLowerCase()
  if (r === 'approver') return 'approver'
  if (r === 'admin') return 'admin'
  return 'contributor'
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}
</script>

<style scoped>
.panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.state-box {
  flex: 1;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #6b7280;
  text-align: center;
}

.state-box p {
  margin: 0;
  font-size: 0.9rem;
}

.ui-spinner {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2.5px solid rgba(30, 58, 138, 0.18);
  border-top-color: #1e3a8a;
  animation: ui-spin 0.75s linear infinite;
  display: inline-block;
}

@keyframes ui-spin {
  to {
    transform: rotate(360deg);
  }
}

.table-wrap {
  overflow: auto;
  flex: 1;
  min-height: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 14px 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
  color: #1f2937;
  vertical-align: middle;
}

thead th {
  position: sticky;
  top: 0;
  background: #f8fafc;
  color: #6b7280;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border-bottom: 1px solid #e5e7eb;
  z-index: 1;
}

tbody tr:hover {
  background: #f9fafb;
}

.sn {
  color: #6b7280;
  font-variant-numeric: tabular-nums;
  width: 56px;
}

.person {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #eff6ff;
  color: #1e3a8a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.username {
  font-weight: 600;
  text-transform: capitalize;
}

.email {
  color: #4b5563;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-badge.contributor {
  background: #eff6ff;
  color: #1e3a8a;
}

.role-badge.approver {
  background: #ffedd5;
  color: #ea580c;
}

.role-badge.admin {
  background: #f1f5f9;
  color: #475569;
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
  cursor: pointer;
}

.icon-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e3a8a;
}
</style>
