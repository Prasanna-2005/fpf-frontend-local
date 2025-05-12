<template>
    <div class="container rounded">
        <div class="row">
            <div class="col"> 
                <ImageComponent/>
            </div>
            <div class="col">
                <div class="form-container">
                    <LoginComponent/>
                </div>
                
            </div>
        </div>
    </div>
</template>
<script setup>
import LoginComponent from '@/components/Auth/LoginComponent.vue'
import ImageComponent from '@/components/Auth/ImageComponent.vue'
</script>
<style scoped>
.otp-container{
    opacity: 30%;
} 
.container .row{
    border:2px solid black;
    padding: 0;
}
.container .col{
    padding: 0;
}
.form-container{
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.form-container form{
    width: 60%;
}
.heading{
    display: flex;
    justify-content: center;
}
.form-btn{
    display: flex;
    justify-content: center;
}
.form-btn button{
    width: 100%;
}

</style>