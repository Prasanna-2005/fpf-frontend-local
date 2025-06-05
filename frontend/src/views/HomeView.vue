<template>
    <div class="d-flex" >
      <div >
        <SideBarComponent />
      </div>
      <div class="flex-grow-1 d-flex justify-content-center align-items-center">
        <div class="my-div ">
            <TableComponent />
        </div>
        
      </div> 
    </div>
  </template>
  
  <script setup>
  import TableComponent from '@/components/Home/TableComponent.vue';
  import SideBarComponent from '@/components/Home/SideBarComponent.vue';

  </script>
    
<style>

.my-div{
    height: 95%;
    width: 95%;
    border: 1px solid whitesmoke;
    max-height: 95%;
    padding: 50px;
    border-radius: 45px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(2.4px);
    -webkit-backdrop-filter: blur(2.4px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    overflow: hidden;
}


</style>