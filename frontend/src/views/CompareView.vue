<template>
    <div class="d-flex main-div" >
            <div >
                <SideBarComponent  @add-fund="openAddFundPopUp=true"/>
            </div>
            <div v-if="loading" class="flex-grow-1 d-flex flex-column justify-content-center align-items-center position-relative">
                    <div v-if="loader" class="loader-box text-center p-4 mt-3">
                        <span class="spinner-border text-primary mb-3" style="width: 2.5rem; height: 2.5rem;" role="status"></span>
                        <h6 class="fw-semibold text-primary mb-1">Loading Compare Page...</h6>
                        <p class="text-muted mb-0">Please wait while we prepare your data.</p>
                    </div>
                    <div v-else class="error-box text-center p-4 mt-3">
                        <font-awesome-icon icon="triangle-exclamation" class="text-danger fs-1 mb-3" />
                        <h5 class="fw-semibold mb-2">Failed to Load Compare Page</h5>
                        <p class="text-muted mb-4">
                        Something went wrong while loading the comparison. Please check your connection or return to the home page.
                        </p>
                        <a href="/home" class="home-btn">
                        <font-awesome-icon class="icon me-2" icon="file-lines" /> Dashboard
                        </a>
                    </div>
              </div>
            <div v-else class="flex-grow-1 d-flex flex-column compare-page">
                <CompareComponent
                  :filingIdA="filingIdA"
                  :filingIdB="filingIdB"
                  :switching="switching"
                  @change-filing-b="onChangeFilingB"
                />
            </div>
            <div v-if="openAddFundPopUp" class="backdrop">
                    <addFundComponent @cancel-add-fund="openAddFundPopUp=false"/>
            </div>
        </div>
</template>

<script setup>
import SideBarComponent from '@/components/Home/SideBarComponent.vue';
import addFundComponent from '@/components/popUps/addFundComponent.vue';
import CompareComponent from '@/components/Compare/CompareComponent.vue';
import {ref, computed, onMounted} from 'vue'
import { useUserStore } from '@/stores/userStore';
import api_call_methods from '@/assets/api_calls/api_calls';
import { useCompareStore } from '@/stores/compareStore'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const compareStore = useCompareStore()
const filingIdA = computed(() => route.query.filing_id_a || '')
const filingIdB = computed(() => route.query.filing_id_b || '')

const openAddFundPopUp = ref(false)
const loading = ref(true)
const loader = ref(true)
const switching = ref(false)
const userStore = useUserStore();
const user_id = userStore.userID

onMounted(async () => {
  try {
    loading.value = true
    if (!filingIdA.value || !filingIdB.value) {
      throw new Error('Missing filing ids')
    }
    compareStore.setFilingMeta({
      nameA: route.query.name_a || localStorage.getItem('filingName') || '',
      nameB: route.query.name_b || '',
    })
    const [resultA, resultB] = await Promise.all([
      api_call_methods.get_response(user_id, filingIdA.value),
      api_call_methods.get_response(user_id, filingIdB.value),
    ])
    compareStore.setResponseA(resultA.data, route.query.name_a || '')
    compareStore.setResponseB(resultB.data, route.query.name_b || '')
    loading.value = false
  } catch (error) {
    loader.value = false
    console.error('Error fetching compare data:', error)
  }
})

async function onChangeFilingB(filing) {
  if (!filing?.id || filing.id === filingIdB.value) return
  try {
    switching.value = true
    toast.info(`Loading comparison with ${filing.filing_name || 'the selected filing'}…`)
    const resultB = await api_call_methods.get_response(user_id, filing.id)
    compareStore.setResponseB(resultB.data, filing.filing_name || '')
    compareStore.setFilingMeta({
      nameA: compareStore.filingNameA,
      nameB: filing.filing_name || '',
    })
    await router.replace({
      name: 'compare',
      query: {
        ...route.query,
        filing_id_b: filing.id,
        name_b: filing.filing_name || '',
      },
    })
    toast.success(`Comparing with ${filing.filing_name || 'the selected filing'}`)
  } catch (error) {
    console.error('Error switching comparison filing:', error)
    toast.error('Could not load the selected filing')
  } finally {
    switching.value = false
  }
}
</script>

<style scoped>
.error-box {
  background-color: #ffffff;
  border: 1px solid #e3e6ea;
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  max-width: 420px;
  width: 90%;
  animation: fadeIn 0.4s ease-in-out;
}

.home-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #0d6efd;
  color: #fff;
  font-weight: 500;
  padding: 0.6rem 1.4rem;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 3px 6px rgba(13, 110, 253, 0.15);
}

.home-btn:hover {
  background-color: #0b5ed7;
  box-shadow: 0 5px 12px rgba(13, 110, 253, 0.3);
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.loader-box,
.error-box {
  background-color: #ffffff;
  border: 1px solid #e3e6ea;
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  max-width: 420px;
  width: 90%;
  animation: fadeIn 0.4s ease-in-out;
}

.loader-box h6 {
  color: #0d6efd;
  letter-spacing: 0.3px;
}

.loader-box p {
  font-size: 0.9rem;
  color: #6c757d;
}

.compare-page {
  min-width: 0;
  height: 100%;
  align-items: stretch;
  justify-content: flex-start;
  overflow: hidden;
}
</style>
