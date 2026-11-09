<template>
  <div class="sidebar-wrap" :class="{ 'is-collapsed': isCollapsed }">
    <button
      v-if="isCollapsed"
      type="button"
      class="sidebar-expand"
      aria-label="Open sidebar"
      @click="toggleSidebar"
    >
      <font-awesome-icon icon="angle-right" />
    </button>

    <aside
      class="sidebar flex-shrink-0"
      :class="isCollapsed ? 'collapsed' : 'expanded'"
      aria-label="Main navigation"
    >
      <div class="sidebar-header">
        <div class="logo" v-show="!isCollapsed">Quantrium</div>
        <button
          v-if="!isCollapsed"
          type="button"
          class="sidebar-toggle"
          aria-label="Collapse sidebar"
          @click="toggleSidebar"
        >
          <font-awesome-icon icon="angle-left" />
        </button>
      </div>

      <ul class="sidebar-nav">
        <li v-if="role === 'admin' || role === 'superadmin'">
          <a
            href="/admin"
            class="nav-link"
            :class="{ active: isAdminRoute }"
            :aria-current="isAdminRoute ? 'page' : undefined"
          >
            <font-awesome-icon icon="user" />
            <span v-show="!isCollapsed">{{ role === 'superadmin' ? 'Clients' : 'Users' }}</span>
          </a>
        </li>
        <li v-if="role !== 'admin' && role !== 'superadmin'">
          <a
            href="/home"
            class="nav-link"
            :class="{ active: isDashboardRoute }"
            :aria-current="isDashboardRoute ? 'page' : undefined"
          >
            <font-awesome-icon icon="table-cells" />
            <span v-show="!isCollapsed">Dashboard</span>
          </a>
        </li>
        <li v-if="role !== 'admin' && role !== 'superadmin'">
          <span class="nav-link nav-link-disabled" title="Coming soon" aria-disabled="true">
            <font-awesome-icon icon="chart-line" />
            <span v-show="!isCollapsed">Report</span>
          </span>
        </li>
        <li v-if="role !== 'admin' && role !== 'superadmin'">
          <button type="button" class="nav-link" @click="addFund">
            <font-awesome-icon icon="folder-plus" />
            <span v-show="!isCollapsed">Add Fund</span>
          </button>
        </li>
      </ul>

      <ul class="sidebar-nav sidebar-nav-bottom">
        <li>
          <button
            type="button"
            class="nav-link settings-row"
            :aria-expanded="isSetting"
            @click="toggleSetting"
          >
            <font-awesome-icon icon="gear" />
            <span v-show="!isCollapsed">Settings</span>
            <font-awesome-icon
              v-if="!isCollapsed"
              class="settings-chevron"
              :icon="isSetting ? 'angle-up' : 'angle-down'"
            />
          </button>
        </li>
        <li v-if="isSetting && !isCollapsed">
          <a href="/reset?account=1" class="nav-link nav-link-sub">
            <span>Reset Password</span>
          </a>
        </li>
        <li>
          <button type="button" class="nav-link" @click="Logout">
            <font-awesome-icon icon="right-from-bracket" />
            <span v-show="!isCollapsed">Logout</span>
          </button>
        </li>
      </ul>
    </aside>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/userStore'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import api_call_methods from '@/assets/api_calls/api_calls'
import { useToast } from 'vue-toast-notification'
import { openActionToast } from '@/assets/utils/toastUtils'

const userStore = useUserStore()
const toast = useToast()
const route = useRoute()
const role = userStore.role

const isCollapsed = ref(false)
const isSetting = ref(false)

const isDashboardRoute = computed(() =>
  ['home', 'editing', 'preview'].includes(route.name)
)
const isAdminRoute = computed(() => route.name === 'admin')

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
const toggleSetting = () => {
  isSetting.value = !isSetting.value
}

async function Logout() {
  const toastInstance = openActionToast(toast, {
    title: 'Logout',
    message: 'Are you sure you want to log out?',
    type: 'warning',
    duration: 0,
    actions: [
      {
        id: 'cancel',
        label: 'Cancel',
        variant: 'secondary',
        onClick: () => toastInstance.dismiss(),
      },
      {
        id: 'logout',
        label: 'Logout',
        variant: 'primary',
        onClick: async () => {
          const user_id = userStore.userID
          const current_time = new Date()
          userStore.logout()
          try {
            toast.info('Logging out…')
            await api_call_methods.logout({
              user_id: user_id,
              logout_time: current_time.toISOString(),
            })
          } catch (error) {
            console.error(error)
          }
          toastInstance?.dismiss?.()
          window.location.replace('/')
        },
      },
    ],
  })
}

const emit = defineEmits(['add-fund'])
function addFund() {
  emit('add-fund')
}
</script>

<style scoped>
.sidebar-wrap {
  --sidebar-bg: #1e3a8a;
  --sidebar-hover: rgba(255, 255, 255, 0.12);

  display: flex;
  position: relative;
  height: 100vh;
  flex-shrink: 0;
  width: 220px;
  transition: width 0.3s ease;
}

.sidebar-wrap.is-collapsed {
  width: 0;
  min-width: 0;
  overflow: visible;
}

.sidebar-expand {
  position: fixed;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  z-index: 100;
  background: var(--sidebar-bg);
  color: #fff;
  border: none;
  border-radius: 0 8px 8px 0;
  width: 22px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 2px 0 8px rgba(30, 58, 138, 0.25);
  padding: 0;
}

.sidebar-expand:hover {
  background: #1e40af;
}

.sidebar {
  height: 100vh;
  background: var(--sidebar-bg);
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 28px 16px;
  overflow: hidden;
  transition: width 0.3s ease, padding 0.3s ease;
}

.sidebar.expanded {
  width: 220px;
}

.sidebar.collapsed {
  width: 0;
  padding: 0;
  border: none;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  padding: 0 4px;
  min-height: 32px;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #fff;
  line-height: 1;
}

.sidebar-toggle {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-toggle:hover {
  background: var(--sidebar-hover);
  color: #fff;
}

.sidebar-nav {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.sidebar-nav-bottom {
  flex: 0;
  padding-top: 16px;
  margin-top: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.9) !important;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: background 0.15s;
  cursor: pointer;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  font-family: inherit;
}

.nav-link:hover:not(.nav-link-disabled) {
  background: var(--sidebar-hover);
  color: #fff !important;
}

.nav-link.active {
  background: #fff !important;
  color: var(--sidebar-bg) !important;
  font-weight: 600;
}

.nav-link.active :deep(svg) {
  color: var(--sidebar-bg);
}

.nav-link :deep(svg) {
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
}

.nav-link-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.nav-link-sub {
  padding-left: 44px;
  font-size: 0.875rem;
  font-weight: 400;
}

.settings-row {
  position: relative;
}

.settings-chevron {
  margin-left: auto;
  font-size: 0.75rem;
  opacity: 0.8;
}
</style>
