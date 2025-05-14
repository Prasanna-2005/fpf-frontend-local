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

    <span class="box">Resend otp in {{ countdown }}</span>
    </form>
    
</template>
<script setup>

const otp=''
function submitotp(event){
    const form = event.target;

    if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
    } else {
    alert(`otp is here: ${otp}`)
    }
    form.classList.add('was-validated');
}
</script>