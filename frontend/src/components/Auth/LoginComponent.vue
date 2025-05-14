<template>
    <div class="form">
    <form class="needs-validation" novalidate @submit.prevent="handleSubmit">
        <div class="login-container" :class="{disabled :loginSuccess}">
            <div class="box">
                <h3>Login</h3>
            </div>
            <div class="mb-3">
                <label for="emailInput" class="form-label">Email</label>
                <input type="email" class="form-control" id="emailInput" name="email" autocomplete="email" aria-describedby="emailHelp" v-model="email" placeholder="prajjwal@quantrium.ai" required>
                <div  class="invalid-feedback">
                   Please enter a valid email address
                </div>

            </div>
            <div class="mb-3">
                <label for="passwordInput" class="form-label">Password</label>
                <input type="password" class="form-control" id="passwordInput" autocomplete="current-password" v-model="password" placeholder="********" required>
                <div  class="invalid-feedback">
                   Please enter a valid password
                </div>
            </div>
            <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="rememberMe">
                <label class="form-check-label" for="rememberMe">Remember Me</label>
            </div>
            <div class="box">
                <button type="submit" class="btn btn-primary button-in-box" >Login</button>
            </div>
        </div>
        
        
    </form>
    <div v-if="loginSuccess" class="otp-container"  >
            <hr>
            <OtpComponent/>
        </div>
    </div>
</template>

<script setup>
import {ref} from 'vue';
import OtpComponent from './OtpComponent.vue';
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

const email=''
const password=''
const loginSuccess=ref(false)
function handleSubmit(event){
    const form = event.target;

    if (!form.checkValidity()) {
        console.log('dsndsjdsj')
        event.preventDefault();
        event.stopPropagation();
    } else {
    loginSuccess.value=true
    console.log(email.value)
    console.log(password.value)
    userStore.login({username:'prajjwal',role:'contributor',userID:'1234',access_token:'dsfdhfsdjfhdjf',refresh_token:'dsdhksfdkhfkjdfhkdhfj'})
    }
    form.classList.add('was-validated');

}
   


console.log(userStore.access_token)
</script>