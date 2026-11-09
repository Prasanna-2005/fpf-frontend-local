<template>
  <div class="d-flex main-div admin-layout">
    <SideBarComponent @add-fund="openAddFundPopUp = true" />

    <div class="admin-main">
      <header class="admin-header">
        <div>
          <h1>Admin</h1>
          <p class="subtitle">{{ pageSubtitle }}</p>
        </div>
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

      <SuperAdminComponent v-if="isSuperAdmin" />
      <template v-else>
        <TopBarComponent @add-user="handleAddUser" @update:year="selectedYear = $event" />
        <AnalyticsTableComponent
          ref="usersTable"
          :selected-year="selectedYear"
          @edit-user="openUserEditor"
        />
      </template>
    </div>

    <div v-if="deletePopUp" class="admin-backdrop">
      <popUpComponent
        :userNameToBeDeleted="userNameToBeDeleted"
        :userIdToBeDeleted="userIdToBeDeleted"
        type="deleteUser"
        @remove-pop-up="deletePopUp = false"
      />
    </div>

    <addUserComponent v-if="adding_user" @cancel-add-user="handleCancel" />

    <editUserComponent
      v-if="editUser"
      :data="editUserData"
      :saving="savingEdit"
      @cancel-edit-user="handleEditCancel"
      @submit-edit="submitEdit"
    />

    <addFundComponent
      v-if="openAddFundPopUp"
      @cancel-add-fund="openAddFundPopUp = false"
    />
  </div>
</template>

<script setup>
import AnalyticsTableComponent from '@/components/Admin/analyticsTableComponent.vue'
import TopBarComponent from '@/components/Admin/topBarComponent.vue'
import SideBarComponent from '@/components/Home/SideBarComponent.vue'
import addUserComponent from '@/components/Admin/addUserComponent.vue'
import popUpComponent from '@/components/popUps/popUpComponent.vue'
import addFundComponent from '@/components/popUps/addFundComponent.vue'
import editUserComponent from '@/components/Admin/editUserComponent.vue'
import SuperAdminComponent from '@/components/Admin/superAdminComponent.vue'
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useToast } from 'vue-toast-notification'
import api_call_methods from '@/assets/api_calls/api_calls'

const userStore = useUserStore()
const toast = useToast()
const usersTable = ref(null)
const username = computed(() => userStore.username || 'Admin')
const role = computed(() => userStore.role || 'admin')
const isSuperAdmin = computed(() => String(userStore.role || '').toLowerCase() === 'superadmin')
const pageSubtitle = computed(() =>
  isSuperAdmin.value
    ? 'Manage Admins for the organisation'
    : 'Manage users and access for your organization',
)
const userInitial = computed(() => {
  const name = username.value || 'A'
  return name.charAt(0).toUpperCase()
})

const deletePopUp = ref(false)
const userNameToBeDeleted = ref('')
const userIdToBeDeleted = ref('')
const openAddFundPopUp = ref(false)
const editUser = ref(false)
const editUserData = ref({})
const savingEdit = ref(false)
const selectedYear = ref('2026')
const adding_user = ref(false)

function handleAddUser() {
  adding_user.value = true
}
function handleCancel() {
  adding_user.value = false
}
function openUserEditor(data) {
  editUserData.value = data
  editUser.value = true
}
function handleEditCancel() {
  editUser.value = false
}

async function submitEdit({ next, password }) {
  if (savingEdit.value) return
  savingEdit.value = true
  try {
    await api_call_methods.edit_user({
      client_code: userStore.clientCode,
      data: {
        user_id: next.user_id,
        username: next.username,
        email: next.email,
        user_role: next.role,
        password,
      },
    }, userStore.userID)
    usersTable.value?.replaceUser(next)
    editUser.value = false
    toast.success('User updated successfully')
  } catch (error) {
    toast.error(error.response?.data?.message || 'The update did not save.')
  } finally {
    savingEdit.value = false
  }
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #eef1f6;
}

.admin-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  padding: 28px 32px;
  gap: 20px;
}

.admin-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
}

.admin-header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 0.9rem;
  color: #6b7280;
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
  color: #111827;
}

.user-info .role {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: capitalize;
}

.admin-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 24px;
}
</style>
