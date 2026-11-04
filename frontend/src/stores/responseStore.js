import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEditableStore = defineStore('response', () => {
  const response = ref([])
  const fund_mapper = ref({})
  const computations_mapper=ref({})
  const computations=ref([])
  const status=ref(localStorage.getItem('filingStatus') || '')
  const isComputationsLoading=ref(false)
  let computationsResolve = null
  let computationsPromise = null

  function startComputationsLoad() {
    isComputationsLoading.value = true
    computationsPromise = new Promise((resolve) => {
      computationsResolve = resolve
    })
  }

  function setResponse(rawResponse) {
    response.value = rawResponse
    fund_mapper.value = {}
   
    rawResponse.funds.forEach(fund => {
      const fundName = fund.fund_name
      fund_mapper.value[fundName] = fund.fund_data.map(q => ({
        ...q,
        isRestoreAvailable: false,
        restoreValue: null,
        fund_id: fund.fund_id,
        fund_series_id: fund.fund_series_id ?? fund.fundseriesid ?? fund.fund_id,
        fund_series_name: fund.fund_series_name ?? fund.fund_name
      }))
    })
  }
  function setComputations(rawComputations) {
    computations.value = rawComputations
    computations_mapper.value = {}

    if (rawComputations && Array.isArray(rawComputations.funds)) {
      rawComputations.funds.forEach(fund => {
        const fundName = fund.fund_name
        computations_mapper.value[fundName] = (fund.fund_computation || []).map(q => ({
          ...q,
          isRestoreAvailable: false,
          restoreValue: null,
          fund_id: fund.fund_id
        }))
      })
    }
    isComputationsLoading.value = false
    if (computationsResolve) {
      computationsResolve(rawComputations)
      computationsResolve = null
    }
  }

  async function ensureComputations() {
    if (!isComputationsLoading.value) return computations.value
    if (computationsPromise) return await computationsPromise
    return computations.value
  }


  function setStatus(filingStatus){
    status.value=filingStatus
    localStorage.setItem('filingStatus', filingStatus)
  }
  function getStatus(){
    return status.value
  }
  function getFunds() {
    return Object.keys(fund_mapper.value)
  }

  function getFundData(fundName) {
    return fund_mapper.value[fundName] 
  }
  function getFundComputation(fundName){
    return computations_mapper.value[fundName]
  }

  function getAllData(){
    return fund_mapper.value
  }

  function getFundId(fundName) {
    const fundData = fund_mapper.value[fundName]
    if (!fundData || fundData.length === 0) return null
    return fundData[0].fund_id || null
  }

  function idsMatch(a, b) {
    if (a == null || b == null || a === '' || b === '') return false
    return String(a).trim() === String(b).trim()
  }

  function getFundLabelBySeriesId(seriesId) {
    if (seriesId == null || seriesId === '') return null

    const funds = Array.isArray(response.value?.funds) ? response.value.funds : []
    const match = funds.find(fund =>
      idsMatch(fund.fund_series_id, seriesId) ||
      idsMatch(fund.fundseriesid, seriesId) ||
      idsMatch(fund.fund_seriesid, seriesId) ||
      idsMatch(fund.fund_id, seriesId)
    )
    if (match) {
      return match.fund_series_name || match.fund_name || null
    }

    for (const [name, rows] of Object.entries(fund_mapper.value)) {
      const row = rows?.[0]
      if (!row) continue
      if (idsMatch(row.fund_series_id, seriesId) || idsMatch(row.fund_id, seriesId)) {
        return row.fund_series_name || name
      }
    }

    return null
  }

  function updateItem(fundName, field_no, item_obj, fieldIndex) {
    const target = fund_mapper.value[fundName]
    if (!target) return

    target[fieldIndex].isRestoreAvailable = true

    // Store a copy of the original values for restore
    target[fieldIndex].restoreValue = {
      items: JSON.parse(JSON.stringify(target[fieldIndex].field_data)), // old field_data
      table_data: JSON.parse(JSON.stringify(target[fieldIndex].table_data || [])),
      field_item_value: JSON.parse(JSON.stringify(target[fieldIndex].value ? [{ value: target[fieldIndex].value }] : []))
    }

    // Update with new editedData structure
    target[fieldIndex].field_data = item_obj.items ?? []
    target[fieldIndex].table_data = item_obj.table_data ?? []
    target[fieldIndex].value = item_obj.field_item_value?.[0]?.value ?? target[fieldIndex].value
  }

  function restoreItem(fundName, field_no, fieldIndex) {
    const target = fund_mapper.value[fundName]
    if (!target) return
    const item = target[fieldIndex]
    if (!item || !item.restoreValue) return

    // Restore all parts from restoreValue
    const restoreCopy = item.restoreValue
    target[fieldIndex] = {
      ...target[fieldIndex],
      isRestoreAvailable: false,
      field_data: restoreCopy.items ?? [],
      table_data: restoreCopy.table_data ?? [],
      value: restoreCopy.field_item_value?.[0]?.value ?? null
    }
  }

  return {
    setResponse,
    getFunds,
    getFundData,
    updateItem,
    restoreItem,
    getAllData,
    getFundId,
    getFundLabelBySeriesId,
    setStatus,
    getStatus,
    status,
    setComputations,
    getFundComputation,
    isComputationsLoading,
    startComputationsLoad,
    ensureComputations
  }
})
