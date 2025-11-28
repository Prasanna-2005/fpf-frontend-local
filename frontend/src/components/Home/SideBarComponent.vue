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
      <!-- <font-awesome-icon class="icon rounded-circle" icon="user" style=" border:2px solid blue; background-color: blue; color: white;  height:2.6em; overflow: hidden;"/> -->
       <div
          class="avatar-circle d-flex align-items-center justify-content-center text-white fw-bold"
        >
          {{ username?.charAt(0)?.toUpperCase() }}
        </div>
      <div>
        <div  v-if="!isCollapsed">
          <p class="mb-0  text-dark text-capitalize fw-bold">{{ username }}</p>
          <p class="mb-0 fst-italic text-muted">{{ email }}</p>
          <p class="mb-0 fst-italic text-secondary fs-6 text-capitalize small">Role: {{ role }}</p>
        </div>
      </div>
    </div>

      <hr />
      <ul class="nav nav-pills flex-column mb-auto">
        <li class="nav-item">
          <a href="/home" class="nav-link active">Home</a>
        </li>
        <li>
          <a href="#" class="nav-link link-dark">Report</a>
        </li>
        <li>
          <a  class="nav-link link-dark" @click="addFund">Add Fund</a>
        </li>
        <li >
          <a class="nav-link link-dark" v-on:click="Logout">Logout</a>
        </li>
        <li class="d-flex justify-content-between align-items-center">
          <a  class="nav-link link-dark">Setting</a>
          <font-awesome-icon class="icon rounded-circle" icon="angle-down" style="color:black" @click="toggleSetting" v-if="isSetting"/>
          <font-awesome-icon class="icon rounded-circle" icon="angle-up" style="color:black" @click="toggleSetting" v-if="!isSetting"/>
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
import { useToast } from 'vue-toast-notification';

const userStore = useUserStore()
const toast=useToast()
const email = userStore.email
const username = userStore.username
const role=userStore.role

const isCollapsed = ref(true)
const isSetting= ref(false)

// onMounted(async () => {
//   try {
//     const user_id=userStore.userID
//     const result=await api_call_methods.verify_user(user_id)
//     console.log(result)
//   } catch (error) {
//     toast.info('User Session Expired. Please Login Again...')
//     console.error("Error fetching data:", error) 
//     window.location.replace('/')
    
//   }
// })

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
      toast.info('Logging out.....')
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

