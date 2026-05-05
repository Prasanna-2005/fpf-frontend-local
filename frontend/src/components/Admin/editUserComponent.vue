<template>
  <div class="container custom-view position-relative">
    <span class="close-icon" @click="handleCancel"><font-awesome-icon class="icon me-2" icon="xmark" style="font-size: 1em;" /></span>

    <div class="d-flex justify-content-center p-2">
      <h3><b>Add User</b></h3>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="row mb-3">
        <div class="col-md-6">
          <label for="firstName" class="form-label">First Name</label>
          <input type="text" class="form-control" id="firstName" placeholder="Alias" v-model="firstname" />
        </div>
        <div class="col-md-6">
          <label for="lastName" class="form-label">Last Name</label>
          <input type="text" class="form-control" id="lastName" placeholder="User" v-model="lastname" />
        </div>
      </div>

      <div class="mb-3">
        <label for="Email" class="form-label">Email</label>
        <input
          type="email"
          class="form-control"
          id="Email"
          v-model="email"
        />
      </div>

      <div class="mb-3">
        <label for="dropdown" class="form-label">Role</label>
        <select class="form-select" v-model="role">
          <option disabled value="">Select</option>
          <option value="contributor">Contributor</option>
          <option value="approver">Approver</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="Password" class="form-label">Password</label>
        <input
          type="password"
          class="form-control"
          id="Password"
          placeholder="***********"
          v-model="password"
        />
      </div>
      <div class="w-100">
        <button type="submit" class="btn btn-primary w-100">Submit</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api_call_methods from '@/assets/api_calls/api_calls'
import { useUserStore } from '@/stores/userStore';
import { useToast } from 'vue-toast-notification';
const toast = useToast();
const userStore = useUserStore();
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})
console.log('edituser prop',props.data)
const names = props.data.username?.split('.') || []
const firstname = ref(names[0] || '')
const lastname = ref(names[1] || '')
const email = ref(props.data.email)
const role = ref(props.data.role)



const user_id=userStore.userID
async function handleSubmit() {
  try{
    if (!firstname.value || !lastname.value || !email.value || !role.value) {
      alert('Please fill out all fields.')
      return
    }
  
   

    const userData = {
      'username': firstname.value+'.'+lastname.value,
      'email':email.value,
      'user_role': role.value,
    }
    const data={
      'client_code':userStore.clientCode,
      'data':userData
    }
    console.log(data)
    console.log(user_id)
    await api_call_methods.edit_user(data,user_id)
    toast.info("Added User successfully")
    location.reload()
  } catch(err){
    console.log(err)
    toast.error('Failed to add User')
  }
}
const emit=defineEmits(['cancel-user'])
function handleCancel(){
    emit('cancel-add-user')
}
</script>

<style scoped>
.container {
  background-color: white;
  width: 500px;
  padding: 40px;
  border-radius: 10px;
  
}
</style>
