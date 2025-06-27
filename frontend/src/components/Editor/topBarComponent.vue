<template>
    <div class="w-100 p-4 d-flex justify-content-between align-items-center">
        <h2>Editing {{ filingName }}</h2>
        <div class="dropdown">
            <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                {{ selectedFund }}
            </button>
            <ul class="dropdown-menu">
                <li  v-for="(item, index) in fundDetails" :key="index" @click="selectFund(item)"><a class="dropdown-item" href="#">{{item}}</a></li>
            </ul>
        </div>
    </div>
</template>

<script setup>
 
import {ref,onMounted} from 'vue';

const fundDetails=['Private opportunity fund 1, L.P','Private opportunity fund 2, L.P','Private opportunity fund 3, L.P','Private opportunity fund 4, L.P']

const filingName="Financial Year 2024-25"
const selectedFund=ref('')


onMounted(() => {
  if (fundDetails.length > 0) {
    selectedFund.value = fundDetails[0];
  }
});

function selectFund(item) {
  selectedFund.value = item;
}


</script>

<style scoped>

</style>    