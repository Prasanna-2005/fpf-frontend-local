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
          placeholder="aliasuser@quantrium.ai"
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

      <div class="mb-3">
        <label for="ConfirmPassword" class="form-label">Confirm Password</label>
        <input
          type="password"
          class="form-control"
          id="ConfirmPassword"
          placeholder="***********"
          v-model="confirmPassword"
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
const userStore = useUserStore();

const firstname = ref('')
const lastname = ref('')
const email = ref('')
const role = ref('')
const password = ref('')
const confirmPassword = ref('')

const user_id=userStore.userID
async function handleSubmit() {
  if (!firstname.value || !lastname.value || !email.value || !role.value || !password.value || !confirmPassword.value) {
    alert('Please fill out all fields.')
    return
  }

  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match.')
    return
  }

  const userData = {
    'username': firstname.value+'.'+lastname.value,
    'email':email.value,
    'user_role': role.value,
    'password': password.value,
  }

  const data={
    'data':userData
  }
  console.log(user_id)
  const result=await api_call_methods.create_user(data,user_id)
  console.log(result)

}
const emit=defineEmits(['cancel-add-user'])
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
