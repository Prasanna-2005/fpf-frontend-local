

<template>
  <div>
    <TopBarComponent @update:search="handleSearch" @upload-click="handleUploadClick" />
  </div>
  <div class="table-div">
    <table class="table">
      <thead class="table-light">
        <tr>
          <th class="tr-padding" scope="col">Filing Name</th>
          <th scope="col">Prepared By</th>
          <th scope="col">Status</th>
          <th scope="col">Modified By</th>
          <th scope="col">Modified On</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody class="table-group-divider">
        <tr v-for="(data, index) in paginatedData" :key="index">
          <th scope="row"><a href="">{{ data['filing_name'] }}</a></th>
          <td>{{ data['prepared_by'] }}</td>
          <td>{{ data['status'] }}</td>
          <td>{{ data['modified_by'] }}</td>
          <td>{{ data['modified_on'] }}</td>
          <td>
            <a href="#"><font-awesome-icon class="icon" icon="trash" /></a>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="d-flex justify-content-end pagination">
      <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="btn" ><</button>

      <button
        v-for="page in totalPages"
        :key="page"
        :class="{ active: currentPage === page }"
        @click="goToPage(page)"
        class="btn"
      >
        {{ page }}
      </button>

      <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="btn">></button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed,onMounted } from 'vue'
import TopBarComponent from '@/components/Home/TopBarComponent.vue';
import sample_json from '@/assets/Sample_data/sample'
import api_call_methods from '@/assets/api_calls/api_calls';
import { useUserStore } from '@/stores/userStore';
const userStore = useUserStore();

const data = ref({ data: [] })   
const user_id=userStore.userID
onMounted(async () => {
  try {
    const result=await api_call_methods.filings_list(user_id)
    data.value=result
  } catch (error) {
    console.error("Error fetching data:", error)
  }
})

const currentPage = ref(1)
const itemsPerPage = 4
const searchQuery = ref('')


function handleSearch(query) {
  searchQuery.value = query
  currentPage.value = 1
}


const filteredData = computed(() => {
  if (!searchQuery.value.trim()) return data.value['data']
  const q = searchQuery.value.toLowerCase()
  return data.value['data'].filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(q)
    )
  )
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredData.value.slice(start, start + itemsPerPage)
})

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const emit = defineEmits(['trigger-upload'])
function handleUploadClick() {
  emit('trigger-upload') 
}
</script>

<style scoped>
tr th, tr td {
  padding: 30px;
}

table {
  border-radius: 10px;
}

thead {
  background-color: aliceblue;
}

th {
  font-weight: bolder;
}
</style>
