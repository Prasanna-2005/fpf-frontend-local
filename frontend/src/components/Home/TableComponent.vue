

<template>
  <div>
    <TopBarComponent @update:search="handleSearch" @upload-click="handleUploadClick" />
  </div>
  <div v-if="isLoading" style="height: 300px" class="d-flex justify-content-center align-items-center">
    <p>Loading Filings table....</p>
  </div>
  <div v-else class="table-div">
    <table class="table">
      <thead class="table-light">
        <tr>
          <th class="tr-padding w-25" scope="col">Filing Name</th>
          <th scope="col" class="w-25">Prepared By</th>
          <th scope="col">Status</th>
          <th scope="col" class="w-25">Modified By</th>
          <th scope="col" class="w-25" @click="toggleSortOrder">
            Modified On
            <font-awesome-icon v-if="sortOrder === 'desc'" icon="arrow-down" />
            <font-awesome-icon v-else icon="arrow-up" />
          </th>
          <!-- <th scope="col"></th> -->
        </tr>
      </thead>
      <tbody class="table-group-divider">
        <tr v-for="(data, index) in paginatedData" :key="index">
          <td class="w-25">
              <a href="#" @click="goToEditing(data['id'],data['filingStatus'])">
                  {{ data['filing_name'] }}
                </a>
          </td>
          <td class="w-25">{{ data['prepared_by'] }}</td>
          <td>{{ data['filingStatus'] }}</td>
          <td class="w-25">{{ data['modified_by'] }}</td>
          <td class="w-25">{{ formatDate(data['modified_on'] )}}</td>
          <!-- <td>
            <a href="#"><font-awesome-icon class="icon" icon="trash" /></a>
          </td> -->
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
import { useRouter } from 'vue-router'
import TopBarComponent from '@/components/Home/TopBarComponent.vue';
import sample_json from '@/assets/Sample_data/sample'
import api_call_methods from '@/assets/api_calls/api_calls';
import { useUserStore } from '@/stores/userStore';
import { useEditableStore } from '@/stores/responseStore'
const responseStore = useEditableStore()
const userStore = useUserStore();

const isLoading=ref(true)
const data = ref({ data: [] })   
const user_id=userStore.userID
const router = useRouter()
const role=userStore.role


function goToEditing(filingId, filingStatus) {
  responseStore.setStatus(filingStatus)
  if(filingStatus=="Approved" || (filingStatus=="Review")){
    router.push({ name: 'preview', query: { filing_id: filingId } })
  }
  else{
  router.push({ name: 'editing', query: { filing_id: filingId } })
  }
}




onMounted(async () => {
  try {
    isLoading.value=true
    const result=await api_call_methods.filings_list(user_id)
    data.value=result
  } catch (error) {
    console.error("Error fetching data:", error)
  }
  finally{
    isLoading.value=false
  }
})

const currentPage = ref(1)
const itemsPerPage = 4
const searchQuery = ref('')


function handleSearch(query) {
  searchQuery.value = query
  currentPage.value = 1
}

const sortOrder = ref('desc') 

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

const filteredData = computed(() => {
  let tempData = data.value['data'];

  
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    tempData = tempData.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(q)
      )
    );
  }
   tempData = [...tempData].sort((a, b) => {
    const dateA = new Date(a.modified_on);
    const dateB = new Date(b.modified_on);
    return sortOrder.value === 'desc'
      ? dateB - dateA
      : dateA - dateB;
  });

  return tempData;
});


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


function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', 
    { day: '2-digit', month: 'short', year: 'numeric' }
  );
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
