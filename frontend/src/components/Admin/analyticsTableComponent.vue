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
        <tr v-for="(data, index) in filteredData" :key="index">
          <th scope="row">{{ data['username'] }}</th>
          <td><button class="btn rounded-pill btn-outline-info" disabled>{{ data['role'] }}</button></td>
          <td>{{ data['email'] }}</td>
          <td>{{ data['created_at'] }}</td>
          <td><button class="btn btn-sm me-2" @click="openEditUser( data['username'],data['email'],data['role'])"><font-awesome-icon class="icon" icon="pen" /></button></td>
        </tr>
      </tbody>
    </table>
    </div>


</template>

<script setup>

import {ref,onMounted,computed} from 'vue';
import { useUserStore } from '@/stores/userStore';
import api_call_methods from '@/assets/api_calls/api_calls';

const props = defineProps({
  selectedYear: {
    type: String,
    required: true
  }
})


const userStore = useUserStore();
const user_id=userStore.userID
const data = ref([])
onMounted(async () => {
  try {
    const result=await api_call_methods.get_users(user_id)
    data.value=result.data.users
    console.log('table',data.value)
  }catch (error) {
    console.error("Error fetching data:", error)
  }
})
  

const emit= defineEmits(['delete-user','edit-user'])


const filteredData = computed(() => {
  return data.value.filter(user => {
    if (!user.created_at) return false
    return new Date(user.created_at).getFullYear().toString() === props.selectedYear
  })
})

function openEditUser(username,email,role){
  const data={
    'username':username,
    'email':email,
    'role':role
  }
  emit('edit-user',data)
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