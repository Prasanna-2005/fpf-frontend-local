<template> 
 <div class="max-dimensions p-4">
    <table class="table rounded table-bordered">
      <thead class="table-light">
        <tr>
          <th class="tr-padding" scope="col">Name</th>
          <th scope="col">Role</th>
          <th scope="col">Email</th>
          <th scope="col">Created at</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody class="table-group-divider">
        <tr v-for="(data, index) in data" :key="index">
          <th scope="row">{{ data['username'] }}</th>
          <td><button class="btn rounded-pill btn-outline-info" disabled>{{ data['role'] }}</button></td>
          <td>{{ data['email'] }}</td>
          <td>{{ data['created_at'] }}</td>
          <td>
            <a href="#"><font-awesome-icon class="icon" icon="trash" @click="handleDelete(data['username'],data['user_id'])"/></a>
          </td>
        </tr>
      </tbody>
    </table>
    </div>


</template>

<script setup>

import {ref,onMounted} from 'vue';
import { useUserStore } from '@/stores/userStore';
import api_call_methods from '@/assets/api_calls/api_calls';




const userStore = useUserStore();
const user_id=userStore.userID
const data=ref('')
onMounted(async () => {
  try {
    const result=await api_call_methods.get_users(user_id)
    data.value=result.data.users
    console.log('table',data.value)
  } catch (error) {
    console.error("Error fetching data:", error)
  }
})

const table_data = [
  { id:'12344',name: 'Alice', role: 'Contributor', uploaded: 12, reviewed: 9 },
  { id:'12344',name: 'Bob', role: 'Reviewer', uploaded: 5, reviewed: 15 },
  { id:'12344',name: 'Charlie', role: 'Contributor', uploaded: 8, reviewed: 8 },
  { id:'12344',name: 'Diana', role: 'Reviewer', uploaded: 3, reviewed: 10 },
  { id:'12344',name: 'Ethan', role: 'Admin', uploaded: 20, reviewed: 18 },
  { id:'12344',name: 'Fiona', role: 'Contributor', uploaded: 6, reviewed: 6 },
];

const emit= defineEmits(['delete-user'])

function handleDelete(name,id){
    emit('delete-user',{ 'name':name, 'id':id })
    
}


</script>

<style scoped>
tr th, tr td {
  padding: 30px;
}

.max-dimensions{
    width: 60% !important;

}


</style>