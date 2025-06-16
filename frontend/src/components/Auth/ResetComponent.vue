<template>
    <div class="form">
    <form class="needs-validation" novalidate @submit.prevent="handleSubmit">
        <div class="login-container">
            <div class="box">
                <h3>Reset Password</h3>
            </div>
            
            <div class="mb-3">
                <label for="passwordInput" class="form-label">Password</label>
                <input type="password" class="form-control" id="passwordInput"  v-model="password" placeholder="********" required>
                <div  class="invalid-feedback">
                   Please enter a valid password
                </div>
            </div>
            <div class="mb-3">
                <label for="passwordInput" class="form-label">Confirm Password</label>
                <input type="password" class="form-control" id="passwordInput"  v-model="confirm_password" placeholder="********" required>
                <div  class="invalid-feedback">
                   Please enter a valid password
                </div>
            </div>
            
            <div class="box">
                <button type="submit" class="btn btn-primary button-in-box" >Reset</button>
            </div>
        </div>
        
        
    </form>
    </div>
</template>
<script setup>
const password=''
const confirm_password=''
function handleSubmit(event){
    const form = event.target;

    if (!form.checkValidity()) {
        
        event.preventDefault();
        event.stopPropagation();
    } else {
    //API call
    }
    form.classList.add('was-validated');

}
</script>