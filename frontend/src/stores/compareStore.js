import { defineStore } from 'pinia'
import { ref } from 'vue'

function mapFundsFromResponse(rawResponse) {
  const fundMapper = {}
  const funds = rawResponse?.funds || []
  funds.forEach((fund) => {
    fundMapper[fund.fund_name] = (fund.fund_data || []).map((q) => ({
      ...q,
      fund_id: fund.fund_id,
    }))
  })
  return fundMapper
}

export const useCompareStore = defineStore('compare', () => {
  const responseA = ref(null)
  const responseB = ref(null)
  const fundMapperA = ref({})
  const fundMapperB = ref({})
  const filingNameA = ref('')
  const filingNameB = ref('')
  const filingSeries = ref('')

  function setResponseA(rawResponse, name = '') {
    responseA.value = rawResponse
    fundMapperA.value = mapFundsFromResponse(rawResponse)
    if (name) filingNameA.value = name
  }

  function setResponseB(rawResponse, name = '') {
    responseB.value = rawResponse
    fundMapperB.value = mapFundsFromResponse(rawResponse)
    if (name) filingNameB.value = name
  }

  function setFilingMeta({ nameA, nameB, relatedSeries }) {
    if (nameA != null) filingNameA.value = nameA
    if (nameB != null) filingNameB.value = nameB
    if (relatedSeries != null) filingSeries.value = relatedSeries
  }

  function reset() {
    responseA.value = null
    responseB.value = null
    fundMapperA.value = {}
    fundMapperB.value = {}
    filingNameA.value = ''
    filingNameB.value = ''
    filingSeries.value = ''
  }

  return {
    responseA,
    responseB,
    fundMapperA,
    fundMapperB,
    filingNameA,
    filingNameB,
    filingSeries,
    setResponseA,
    setResponseB,
    setFilingMeta,
    reset,
  }
})
