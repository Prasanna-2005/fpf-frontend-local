<template>
    <div class="d-flex" >
      <div >
        <SideBarComponent />
      </div>
      <div class="flex-grow-1 d-flex justify-content-center align-items-center">
        <div class="table-container ">
            <TableComponent />
        </div>
        
      </div> 
    </div>
</template>
  
<script setup>
import TableComponent from '@/components/Home/TableComponent.vue';
import SideBarComponent from '@/components/Home/SideBarComponent.vue';

</script>
    
