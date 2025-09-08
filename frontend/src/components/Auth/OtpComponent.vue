<template>
    <form class="needs-validation" novalidate @submit.prevent="submitotp" >
        <div class="mb-3">
        <label for="OTPInput" class="form-label">Enter OTP</label>
        <input type="text" class="form-control" id="OTPInput"  v-model="otp" required >
        <div  class="invalid-feedback">
                   Please enter a valid OTP
        </div>
    </div>
    <div class="box">
        <button type="submit" class="btn btn-primary button-in-box" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <span v-if="!isLoading">Verify OTP</span>
            <span v-else>Verfiying OTP...</span>
        </button>
    </div>

    <!-- <span class="box">Resend otp in </span> -->
    </form>
    
</template>
<script setup>
import { ref } from 'vue';
import { useToast } from 'vue-toast-notification';
import { useUserStore } from '@/stores/userStore';
import api_call_methods from '@/assets/api_calls/api_calls';

const otp = ref('');
const isLoading = ref(false); 
const toast = useToast();

const props = defineProps({
    user_id: {
        type: String,
        required: true
    },
    email:{
        type:String,
        required:true
    }
});

async function submitotp(event) {
    event.preventDefault();
    const form = event.target;
    const userStore = useUserStore();

    if (!form.checkValidity()) {
        event.stopPropagation();
    } else {
        try {
            isLoading.value = true; 
            const result = await api_call_methods.verify_otp({
                user_id: props.user_id,
                otp: otp.value.toString()
            });

            if (result.status == '200') {
                toast.success('OTP Verified Successfully!');
                userStore.login({ username: result.data.response.username, email: props.email, role: result.data.response.role, userID: props.user_id });
                location.replace('/home');
            } else {
                toast.error('Invalid OTP!');
            }
        } catch (error) {
            toast.error('Something went wrong!');
            console.error(error);
        } finally {
            isLoading.value = false; 
        }
    }
    form.classList.add('was-validated');
}
</script>
