<template>
    <div v-if="isCollapsed">
      <font-awesome-icon class="icon" icon="bars" @click="toggleSidebar" style="font-weight: bolder; font-size: large; padding: 20px; color: black;" />
    </div>
    <div class="d-flex">
      <!-- Sidebar -->
      <div
        class="sidebar bg-light p-3 flex-shrink-0"
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
            <a href="#" class="nav-link link-dark">Add Fund</a>
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

  const Logout=()=>{
    userStore.logout()
    window.location.replace('/')

  }
  </script>
  
  <style scoped>
  .sidebar {
    height: 100vh;
    overflow: hidden;
    transition: all 0.3s ease;
    color: white !important;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(2.4px);
    -webkit-backdrop-filter: blur(2.4px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    overflow: hidden;
}



  .sidebar.expanded {
    width: 300px;
  }
  
  .sidebar.collapsed {
    width: 0;
    padding: 0 !important;
  }
  
  .sidebar.collapsed .nav-link {
    text-align: center;
    font-size: 0;
  }
  .sidebar.collapsed .icon {
    text-align: center;
    font-size: 0;
  }
  
  .sidebar.collapsed .nav-link::before {
    font-size: 16px;
    content: attr(title);
    display: inline-block;
  }
  
  .nav-link.active {
    background-color: #0d6efd;
    color: white;
  }
  </style>
  