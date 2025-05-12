<template>
    <form class="needs-validation" novalidate >
        <div class="login-container" :class="{disabled :loginSuccess}">
            <div class="heading">
                <h3>Login</h3>
            </div>
            <div class="mb-3">
                <label for="emailInput" class="form-label">Email</label>
                <input type="email" class="form-control" id="emailInput" aria-describedby="emailHelp" v-model="email" placeholder="prajjwal@quantrium.ai" required>
                
            </div>
            <div class="mb-3">
                <label for="passwordInput" class="form-label">Password</label>
                <input type="password" class="form-control" id="passwordInput" v-model="password" placeholder="********">
            </div>
            <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="rememberMe">
                <label class="form-check-label" for="rememberMe">Remember Me</label>
            </div>
            <div class="form-btn">
                <button type="submit" class="btn btn-primary" v-on:click.prevent="Handlelogin">Login</button>
            </div>
        </div>
        <hr>
        <div v-if="loginSuccess" class="otp-container"  >
            <OtpComponent/>
        </div>
    </form>
</template>

<script setup>
import {ref} from 'vue';
import OtpComponent from './OtpComponent.vue';
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

const email=ref('')
const password=ref('')
const loginSuccess=ref(false)
function Handlelogin(){
    loginSuccess.value=true
    console.log(email.value)
    console.log(password.value)
    userStore.login({username:'prajjwal',role:'contributor',userID:'1234',access_token:'dsfdhfsdjfhdjf',refresh_token:'dsdhksfdkhfkjdfhkdhfj'})
    window.userStore = useUserStore()
}
   


console.log(userStore.access_token)
</script>

<style>
.disabled{
    pointer-events: none;
    opacity: 0.6; 
    filter: grayscale(50%);
}
</style>