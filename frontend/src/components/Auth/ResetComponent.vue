<template>
    <div class="form">
    <form class="needs-validation" novalidate @submit.prevent="handleSubmit">
        <div class="login-container">
            <div class="box">
                <h3>Reset Password</h3>
            </div>
            
            <div class="mb-3 position-relative">
                <label for="passwordInput" class="form-label">Password</label>
                <input
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control pe-5"
                    id="passwordInput"
                    v-model="password"
                    required
                />
                <font-awesome-icon
                    :icon="showPassword ? 'eye-slash' : 'eye'"
                    class="text-secondary password-toggle-icon"
                    @click="togglePassword"
                />
                <div class="invalid-feedback">
                    Please enter a valid password
                </div>
            </div>

            <div class="mb-3 position-relative">
                <label for="passwordInput" class="form-label"> Confirm Password</label>
                <input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="form-control pe-5"
                    id="passwordInput"
                    v-model="confirm_password"
                    required
                />
                <font-awesome-icon
                    :icon="showConfirmPassword ? 'eye-slash' : 'eye'"
                    class="text-secondary password-toggle-icon"
                    @click="toggleConfirmPassword"
                />
                <div class="invalid-feedback">
                    Please enter a valid password
                </div>
            </div>

            
            <div class="box">
                <button type="submit" class="btn btn-primary button-in-box" :disabled="isLoading">
                    <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <span v-if="!isLoading">Change Password</span>
                    <span v-else>Changing Password...</span>
                </button>
            </div>
        </div>
        
        
    </form>
    </div>
</template>
<script setup>
import { useUserStore } from '@/stores/userStore'
import { ref, onMounted} from 'vue'
import { useToast } from 'vue-toast-notification';
import api_call_methods from '@/assets/api_calls/api_calls';

const toast = useToast();

const password=ref('')
const confirm_password=ref('')
const userStore = useUserStore()
const isLoading = ref(false); 

const showPassword = ref(false)
const showConfirmPassword=ref(false)

function togglePassword() {
  showPassword.value = !showPassword.value
}
function toggleConfirmPassword() {
  showConfirmPassword.value = !showConfirmPassword.value
}



async function handleSubmit(event){
    const form = event.target;
   
    const user_id = userStore.userID

    if (!form.checkValidity()){
        event.preventDefault();
        event.stopPropagation();
    } else {
        try {
            isLoading.value = true; 
            const result = await api_call_methods.reset_password({
                new_password:password.value
            },user_id,);
            if (result.status == '200') {
                toast.success('Password change successful!')
                userStore.logout()
                location.replace('/')
            } else {
                toast.error('Password change Unsuccesful! Please try again');
            }
        } catch (error) {
            toast.error('Something went wrong!');
            console.error(error);
        } finally {
            isLoading.value = false; 
        }

}
}
</script>