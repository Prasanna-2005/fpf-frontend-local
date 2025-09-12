<template>
  <div v-if="isCollapsed">
    <font-awesome-icon class="icon" icon="bars" @click="toggleSidebar" style="font-weight: bolder; font-size: large; padding: 20px; color: black;" />
  </div>
  <div class="d-flex">
    <!-- Sidebar -->
    <div
      class="sidebar custom-view bg-light p-3 flex-shrink-0"
      :class="isCollapsed ? 'collapsed' : 'expanded'"
    >
    <div class="d-flex align-items-center gap-2 ">
      <font-awesome-icon class="icon rounded-circle" icon="user" style=" border:2px solid blue; background-color: blue; color: white;  height:2.6em; overflow: hidden;"/>
      <div>
        <div  v-if="!isCollapsed">
            <p class="mb-0 text-uppercase" style="color: black;">{{ username }}</p>
            <p class="mb-0 fst-italic text-muted">{{ email }}</p>
          </div>
      </div>
    </div>

      <hr />
      <ul class="nav nav-pills flex-column mb-auto">
        <li class="nav-item">
          <a href="#" class="nav-link active">Home</a>
        </li>
        <li>
          <a href="#" class="nav-link link-dark">Report</a>
        </li>
        <li>
          <a  class="nav-link link-dark" @click="addFund">Add Fund</a>
        </li>
        <li class="d-flex justify-content-between align-items-center">
          <a  class="nav-link link-dark">Setting</a>
          <font-awesome-icon class="icon rounded-circle" icon="angle-down" style="color:black" @click="toggleSetting" v-if="isSetting"/>
          <font-awesome-icon class="icon rounded-circle" icon="angle-up" style="color:black" @click="toggleSetting" v-if="!isSetting"/>
        </li>
        <li v-if="isSetting">
          <a class="nav-link link-dark" v-on:click="Logout">Logout</a>
        </li>
        <li v-if="isSetting">
          <a href="/reset" class="nav-link link-dark">Reset Password</a>
        </li>
        <li class="mt-3">
          <button @click="toggleSidebar" class="btn btn-outline-secondary btn-sm w-100">
            {{ isCollapsed ? 'Expand' : 'Collapse' }}
          </button>
        </li>
      </ul>
    </div>

  </div>
</template>
  
<script setup>
import { useUserStore } from '@/stores/userStore'
import { ref } from 'vue'
import api_call_methods from '@/assets/api_calls/api_calls'

const userStore = useUserStore()
const email = userStore.email
const username = userStore.username

const isCollapsed = ref(false)
const isSetting= ref(false)
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
const toggleSetting=()=>{
  isSetting.value=!isSetting.value
}

async function Logout(){
  const user_id=userStore.userID
  const current_time = new Date();
  userStore.logout()
  try {
      await api_call_methods.logout({
        user_id: user_id,
        logout_time: current_time.toISOString()
      });
  } catch (error) {
      console.error(error);
  } 
  window.location.replace('/')

}

const emit = defineEmits(['add-fund'])
function addFund(){
  emit('add-fund')
}
</script>

  