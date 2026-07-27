<template>
  <div class="d-flex main-div admin-layout">
    <SideBarComponent @add-fund="openAddFundPopUp = true" />

    <div class="admin-main">
      <header class="admin-header">
        <div>
          <h1>Admin</h1>
          <p class="subtitle">Manage users and access for your organization</p>
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

      <TopBarComponent @add-user="handleAddUser" @update:year="selectedYear = $event" />
      <AnalyticsTableComponent :selected-year="selectedYear" @edit-user="openUserEditor" />
    </div>

    <div v-if="deletePopUp" class="admin-backdrop">
      <PopUpComponent
        :user-name-to-be-deleted="userNameToBeDeleted"
        :user-id-to-be-deleted="userIdToBeDeleted"
        type="deleteUser"
        @remove-pop-up="deletePopUp = false"
      />
    </div>

    <AddUserComponent v-if="addingUser" @cancel-add-user="handleCancelAddUser" />

    <EditUserComponent
      v-if="editUserOpen"
      :data="editUserData"
      @cancel-edit-user="handleCancelEditUser"
    />

    <AddFundComponent v-if="openAddFundPopUp" @cancel-add-fund="openAddFundPopUp = false" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import AnalyticsTableComponent from '@/components/Admin/analyticsTableComponent.vue'
import TopBarComponent from '@/components/Admin/topBarComponent.vue'
import AddUserComponent from '@/components/Admin/addUserComponent.vue'
import EditUserComponent from '@/components/Admin/editUserComponent.vue'
import SideBarComponent from '@/components/Home/SideBarComponent.vue'
import PopUpComponent from '@/components/popUps/popUpComponent.vue'
import AddFundComponent from '@/components/popUps/addFundComponent.vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

const username = computed(() => userStore.username || 'Admin')
const role = computed(() => userStore.role || 'admin')
const userInitial = computed(() => (username.value || 'A').charAt(0).toUpperCase())

const deletePopUp = ref(false)
const userNameToBeDeleted = ref('')
const userIdToBeDeleted = ref('')
const openAddFundPopUp = ref(false)
const editUserOpen = ref(false)
const editUserData = ref({})
const selectedYear = ref('2026')
const addingUser = ref(false)

function handleAddUser() {
  addingUser.value = true
}

function handleCancelAddUser() {
  addingUser.value = false
}

function openUserEditor(data) {
  editUserData.value = data
  editUserOpen.value = true
}

function handleCancelEditUser() {
  editUserOpen.value = false
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
  display: flex;
  flex-direction: column;
  max-height: 100vh;
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
