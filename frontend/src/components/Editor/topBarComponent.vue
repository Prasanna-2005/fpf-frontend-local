<template>
  <div class="w-100 d-flex pb-4 justify-content-center">
      <div class="main-container  d-flex justify-content-between align-items-center">
        <h2>Editing Filing</h2>
        <div class="dropdown">
            <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                {{ selectedFund }}
            </button>
            <ul class="dropdown-menu">
                <li  v-for="(item, index) in fundDetails" :key="index" @click="selectFund(item)"><a class="dropdown-item" href="#">{{item}}</a></li>
            </ul>
        </div>
      </div>

  </div>

</template>

<script setup>
 
import {ref,onMounted} from 'vue';

const props = defineProps({
  fundNames: { 
    type: String, 
    required: true 
  },
})

const fundDetails=props.fundNames
const filingName="Financial Year 2024-25"
const selectedFund=ref('')

const emit= defineEmits(['selected-fund'])
onMounted(() => {
  if (fundDetails.length > 0) {
    selectedFund.value = fundDetails[0];
    emit('selected-fund',selectedFund.value)
  }
});

function selectFund(item) {
  selectedFund.value = item;
  emit('selected-fund',selectedFund.value)
}


</script>

<style scoped>
.main-container{
  width: 95%;

}
</style>    