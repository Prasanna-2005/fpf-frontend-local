<template>
    <div class="mb-3">
        <label for="OTPInput" class="form-label">Enter OTP</label>
        <input type="password" class="form-control" id="OTPInput" aria-describedby="passwordhelp" v-model="otp" >
    </div>
    <div class="form-btn">
        <button type="submit" class="btn btn-primary" v-on:click.prevent="submitotp" >Submit</button>
    </div>
</template>
<script setup>
console.log('hellp')
</script>