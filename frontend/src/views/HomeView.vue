<template>
    <div class="d-flex" style="height: 100vh;">
      <!-- Fixed-width sidebar -->
      <div style="width: 250px; flex-shrink: 0;">
        <SideBarComponent />
      </div>
  
      <!-- Flexible main content -->
      <div class="flex-grow-1">
        
        <TableComponent />
      </div>
    </div>
  </template>
  
  <script setup>
  import SideBarComponent from '@/components/Home/SideBarComponent.vue';
  import TableComponent from '@/components/Home/TableComponent.vue';
  
  </script>
  