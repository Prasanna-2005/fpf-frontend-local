<template>
  <div class="container custom-view position-relative">
    <span class="close-icon" @click="handleCancel"><font-awesome-icon class="icon me-2" icon="xmark" style="font-size: 1em;" /></span>

    <div class="d-flex justify-content-center p-2">
      <h3><b>Add Fund</b></h3>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="row mb-3">
        <div class="col-md-6">
          <label for="NameOfReportingFund" class="form-label">Name of reporting fund</label>
          <input type="text" class="form-control" id="NameOfReportingFund"  v-model="firstname" />
        </div>
        <div class="col-md-6">
          <label for="fundID" class="form-label">Private Fund ID of Reporting Fund</label>
          <input type="text" class="form-control" id="fundID"  v-model="fundID" />
        </div>
      </div>
      <div class="col-md-6">
          <label for="NfaID" class="form-label">Private Fund ID of Reporting Fund</label>
          <input type="text" class="form-control" id="NfaID"  v-model="NfaID" />
      </div>
      <div class="col-md-6">
          <label for="Lei" class="form-label">Private Fund ID of Reporting Fund</label>
          <input type="text" class="form-control" id="Lei"  v-model="Lei" />
      </div>
      <div class="col-md-6">
          <label for="isMasterFund" class="form-label">Is a Master Fund in a Master-Feeder structure?</label>
          <input type="checkbox" class="form-control"  v-model="isMasterFund" id="isMasterFund" />
          <span>{{ isMasterFund ? 'Yes' : 'No' }}</span>
      </div>
      <div class="col-md-6">
          <label for="isParallelFund" class="form-label">Is a Master Fund in a Master-Feeder structure?</label>
          <input type="checkbox" class="form-control"  v-model="isParallelFund" id="isParallelFund" />
          <span>{{ isParallelFund ? 'Yes' : 'No' }}</span>
      </div>

      <div class="w-100">
        <button type="submit" class="btn btn-primary w-100">Submit</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const NameOfReportingFund = ref('')
const fundID = ref('')
const NfaID = ref('')
const Lei = ref('')
const isMasterFund = ref(false)
const isParallelFund = ref(false)

function handleSubmit() {
  if (!NameOfReportingFund.value || !fundID.value || !NfaID.value) {
    alert('Please fill out all fields.')
    return
  }
}
const emit=defineEmits(['cancel-add-fund'])
function handleCancel(){
    emit('cancel-add-fund')
}
</script>

<style scoped>
.container {
  background-color: white;
  width: 500px;
  padding: 40px;
  border-radius: 10px;
  
}
</style>
