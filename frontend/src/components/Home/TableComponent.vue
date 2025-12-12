

<template>
  <div>
    <TopBarComponent @update:search="handleSearch" @upload-click="handleUploadClick" />
  </div>
  <div v-if="isLoading" style="height: 300px" class="d-flex justify-content-center align-items-center">
    <p>Loading Filings table....</p>
  </div>
  <div v-else class="table-div">
    <table class="table ">
  <thead class="table-light">
    <tr>
      <th style="width: 15%">Filing Name</th>
      <th style="width: 15%">Prepared By</th>
      <th style="width: 15%">Status</th>
      <th style="width: 15%">XML</th>
      <th style="width: 15%">Modified By</th>
      <th style="width: 15%; cursor:pointer" @click="toggleSortOrder">
        Modified On
        <font-awesome-icon v-if="sortOrder === 'desc'" icon="arrow-down" />
        <font-awesome-icon v-else icon="arrow-up" />
      </th>
      <th style="width: 10%"></th>
    </tr>
  </thead>

  <tbody>
    <tr v-for="(data, index) in paginatedData" :key="index">
      <td><a href="#" @click="goToEditing(data['id'],data['filingStatus'],data['filing_name'])"> {{ data['filing_name'] }} </a></td>
      <td class="text-capitalize">{{ data['prepared_by'] }}</td>
      <td>{{ data['filingStatus'] }}</td>

      <!-- XML Column -->
      <td >
        <button
          class="bg-transparent border-0 p-0"
          style="cursor: pointer;"
          :disabled="data['filingStatus'] !== 'Approved'"
          @click="downloadXML(data['id'])"
        >
          <font-awesome-icon 
            icon="download"
            :class="{
              'text-secondary': data['filingStatus'] !== 'Approved',
              'text-primary': data['filingStatus'] === 'Approved'
            }"
          />
        </button>
      </td>

      <td class="text-capitalize">{{ data['modified_by'] }}</td>
      <td>{{ formatDate(data['modified_on']) }}</td>
      <td class="text-center">
        <button
          class="bg-transparent border-0 p-0"
          style="cursor: pointer;"
          :disabled="data['filingStatus'] == 'Archived'"
          @click="deleteFiling(data['id'])"
        >
          <font-awesome-icon icon="trash" 
          :class="{
              'text-danger': data['filingStatus'] !== 'Archived',
              'text-secondary': data['filingStatus'] === 'Archived'
          }" />
        </button>
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
import { useRouter } from 'vue-router'
import TopBarComponent from '@/components/Home/TopBarComponent.vue';
import api_call_methods from '@/assets/api_calls/api_calls';
import { useUserStore } from '@/stores/userStore';
import { useEditableStore } from '@/stores/responseStore'
import { useToast } from 'vue-toast-notification';
import utils from '@/assets/utils/utils'
import { useFileStore } from '@/stores/fileStore';
const responseStore = useEditableStore()
const userStore = useUserStore();

const isLoading=ref(true)
const data = ref({ data: [] })   
const user_id=userStore.userID
const router = useRouter()
const role=userStore.role
const toast=useToast()
const fileStore=useFileStore()

function goToEditing(filingId, filingStatus,filingName) {
  responseStore.setStatus(filingStatus)
  localStorage.setItem('filingName',filingName)
  if(filingStatus=="Approved" || (filingStatus=="Review")){
    router.push({ name: 'preview', query: { filing_id: filingId } })
  }
  else{
  router.push({ name: 'editing', query: { filing_id: filingId } })
  }
}

async function downloadXML(filingId){
    toast.info("Downloading XML.....")
    const result=await api_call_methods.get_xml_data(user_id,filingId)
    utils.downloadXMLFile(result.data)
    toast.success("XML file downloaded")
}

async function deleteFiling(filingId) {
  toast.info("Deleting filing.....")
  const status="Archived"
  await api_call_methods.update_status(user_id,filingId,status)
  toast.success("filing deleted successfully")
  location.reload();
}


onMounted(async () => {
  try {
    isLoading.value=true
    const result=await api_call_methods.filings_list(user_id)
    data.value=result
    const names = result.data.map(item => item.filing_name.toLowerCase())
    fileStore.setExistingNames(names)

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

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    tempData = tempData.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(q)
      )
    );
  }

  // Sort so that archived always goes last
  tempData = [...tempData].sort((a, b) => {
    
    const isAArchived = a.filingStatus?.toLowerCase() === 'archived';
    const isBArchived = b.filingStatus?.toLowerCase() === 'archived';

    if (isAArchived && !isBArchived) return 1;   // A goes after B
    if (!isAArchived && isBArchived) return -1;  // A goes before B

    // If both are same status group → sort by date
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
