<template>
    <form class="needs-validation" novalidate @submit.prevent="submitotp" >
        <div class="mb-3">
            <p class="instruction mb-2 text-muted">
                Check your inbox for the verification code.
            </p>
            <label for="OTPInput" class="form-label">Enter verification code</label>
            <input type="text" class="form-control" id="OTPInput"  v-model="otp" required >
            <div  class="invalid-feedback">
                    Please enter a valid verification code
            </div>
    </div>
    <div class="box">
        <button type="submit" class="btn btn-primary button-in-box" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <span v-if="!isLoading">Verify code</span>
            <span v-else>Verfiying code...</span>
        </button>
    </div>

    <div class="mt-3 text-center">
        <span v-if="timer > 0">
            Resend verification code in <strong>{{ timer }}</strong> sec
        </span>
        <a v-else href="#" @click.prevent="resendOtp" class="ms-2">Resend verification code</a>
    </div>
    </form>
    
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useToast } from 'vue-toast-notification';
import { useUserStore } from '@/stores/userStore';
import api_call_methods from '@/assets/api_calls/api_calls';

const otp = ref('');
const isLoading = ref(false);
const timer = ref(60); 
let intervalId = null;

const toast = useToast();

const props = defineProps({
    user_id: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

onMounted(() => {
    startTimer();
});

onBeforeUnmount(() => {
    clearInterval(intervalId);
});

function startTimer() {
    timer.value = 60;
    intervalId = setInterval(() => {
        if (timer.value > 0) {
            timer.value--;
        } else {
            clearInterval(intervalId);
        }
    }, 1000);
}

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
                toast.success('Code Verified Successfully!');
                userStore.login({
                    username: result.data.response.username,
                    email: props.email,
                    role: result.data.response.role,
                    userID: props.user_id
                });
                location.replace('/home');
            } else {
                toast.error('Invalid !');
            }
        } catch (error) {
            if (error.status==401){
                toast.error('Incorrect code, Please re-enter the correct verification code.')
            }
            else{
                toast.error('We’re having trouble processing your request. Please try again later')
            }
        } finally {
            isLoading.value = false;
        }
    }
    form.classList.add('was-validated');
}


async function resendOtp() {
    try {
        toast.info('Resending verification code...');
        const result=await api_call_methods.resend_otp({ user_id: props.user_id });
        console.log(result)
        toast.success('Verification code Sent Successfully!');
        startTimer(); 
    } catch (error) {
        toast.error('Failed to resend Verification code!');
        console.error(error);
    }
}
</script>

