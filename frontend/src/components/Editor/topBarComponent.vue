<template>
  <div class="w-100 d-flex pb-4 justify-content-center">
      <div class="main-container  d-flex justify-content-between align-items-center">
        <h3 class="text-capitalize">Editing : {{ filingName }}</h3>
        <div class="dropdown">
            <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                {{ selectedFund }}
            </button>
            <ul class="dropdown-menu scrollable-dropdown">
                <li  v-for="(item, index) in fundDetails" :key="index" @click="selectFund(item)"><a class="dropdown-item" href="#">{{item}}</a></li>
            </ul>
        </div>
      </div>

  </div>

</template>

<script setup>
 
import {ref,onMounted} from 'vue';
import { useFileStore } from '@/stores/fileStore';
const fileStore=useFileStore()

const props = defineProps({
  fundNames: { 
    type: String, 
    required: true 
  },
})

const fundDetails=props.fundNames
const filingName=fileStore.getfilingName()
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
.scrollable-dropdown {
  max-height: 60vh;
  overflow-y: auto;
  overflow-x: hidden;
}

</style>    