<template>
    <form >
        <div class="login-container" :class="{disabled :loginSuccess}">
            <div class="heading">
                <h3>Login</h3>
            </div>
            <div class="mb-3">
                <label for="emailInput" class="form-label">Email</label>
                <input type="email" class="form-control" id="emailInput" aria-describedby="emailHelp" v-model="email">
                
            </div>
            <div class="mb-3">
                <label for="passwordInput" class="form-label">Password</label>
                <input type="password" class="form-control" id="passwordInput" v-model="password">
            </div>
            <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="rememberMe">
                <label class="form-check-label" for="rememberMe">Remember Me</label>
            </div>
            <div class="form-btn">
                <button type="submit" class="btn btn-primary" v-on:click.prevent="login">Login</button>
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

const email=ref('')
const password=ref('')
const loginSuccess=ref(false)
function login(){
    loginSuccess.value=true
    console.log(email.value)
    console.log(password.value)
}
</script>

<style>
.disabled{
    pointer-events: none;
    opacity: 0.6; 
    filter: grayscale(50%);
}
</style>