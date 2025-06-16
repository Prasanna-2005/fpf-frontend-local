<template>
    <form class="needs-validation" novalidate @submit.prevent="submitotp" >
        <div class="mb-3">
        <label for="OTPInput" class="form-label">Enter OTP</label>
        <input type="number" class="form-control" id="OTPInput"  v-model="otp" required >
        <div  class="invalid-feedback">
                   Please enter a valid OTP
        </div>
    </div>
    <div class="box">
        <button type="submit" class="btn btn-primary button-in-box" >Submit</button>
    </div>

    <span class="box">Resend otp in </span>
    </form>
    
</template>
<script setup>
import { useToast } from 'vue-toast-notification'
import { useUserStore } from '@/stores/userStore'
const otp=''
const toast = useToast()
function submitotp(event){
    event.preventDefault()
    const form = event.target;
    const userStore = useUserStore()

    if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
    } else {
    //API Call
    setTimeout(3000)
    location.replace('/home')
    }
    form.classList.add('was-validated');
}
</script>