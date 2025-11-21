<template>
    <div class="form">
    <form class="needs-validation" novalidate @submit.prevent="handleSubmit">
        <div class="login-container" :class="{disabled :loginSuccess}">
            <div class="box">
                <h3>Login</h3>
            </div>
            <div class="mb-3">
                <label for="emailInput" class="form-label">Email</label>
                <input type="email" class="form-control" id="emailInput" name="email" autocomplete="email" aria-describedby="emailHelp" v-model="email" placeholder="user@company.com" required>
                <div  class="invalid-feedback">
                   Please enter a valid email address
                </div>

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


            <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="rememberMe">
                <label class="form-check-label" for="rememberMe">Remember Me</label>
            </div>
            <div class="box">
                <button type="submit" class="btn btn-primary button-in-box" :disabled="isLoading">
                    <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <span v-if="!isLoading">Login</span>
                    <span v-else>Logging in...</span>
                </button>
            </div>

        </div>
        
        
    </form>
    <div v-if="loginSuccess" class="otp-container"  >
            <hr>
            <OtpComponent :user_id="user_id" :email="email"/>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import OtpComponent from './OtpComponent.vue';
import { useUserStore } from '@/stores/userStore';
import { useToast } from 'vue-toast-notification';
import api_call_methods from '@/assets/api_calls/api_calls';

const toast = useToast();

const email = ref('');
const password = ref('');
const loginSuccess = ref(false);
const user_id = ref('');
const isLoading = ref(false); 
const showPassword = ref(false)

function togglePassword() {
  showPassword.value = !showPassword.value
}
const emit = defineEmits(['']);

async function handleSubmit(event) {
    event.preventDefault();
    const userStore = useUserStore();
    const form = event.target;

    if (!form.checkValidity()) {
        event.stopPropagation();
    } else {
        try {
            isLoading.value = true; 
            const result = await api_call_methods.login({
                username: email.value,
                password: password.value
            });

            if (result.status == '200') {
                user_id.value = result.data['user_id'];
                loginSuccess.value = true;
                toast.success('Verification code sent!');
                userStore.login({ email: email.value, role: 'Contributor', userID: user_id.value });
            } else {
                toast.error('Login failed!');
                console.log(result);
            }
        } catch (error) {
            if (error.status==404){
                toast.error('Wrong username or password')
            }
            else{
                toast.error('We’re having trouble processing your request. Please try again later')
            }
            
        } finally {
            isLoading.value = false; 
        }
    }
}
</script>
