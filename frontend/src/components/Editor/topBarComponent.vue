<template>
    <div class="w-100 p-4 d-flex justify-content-between align-items-center">
        <h2>Editing {{ filingName }}</h2>
        <div class="dropdown">
            <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Select file
            </button>
            <ul class="dropdown-menu">
                <li  v-for="(items, index) in fundDetails" :key="index"><a class="dropdown-item" href="#">{{items}}</a></li>
            </ul>
        </div>
    </div>
</template>

<script setup>
 
const filingName="Financial Year 2024-25"

const fundDetails=['Private opportunity fund 1, L.P','Private opportunity fund 1, L.P','Private opportunity fund 1, L.P','Private opportunity fund 1, L.P']
</script>

<style scoped>

</style>