import { defineStore } from 'pinia'
import { ref } from 'vue'
import api_call_methods from '@/assets/api_calls/api_calls'

export const useEditableStore = defineStore('response', () => {
  const response = ref([])
  const fund_mapper = ref({})
  const computations_mapper=ref({})
  const computations=ref([])
  const status=ref(localStorage.getItem('filingStatus') || '')
  const isComputationsLoading=ref(false)
  let computationsResolve = null
  let computationsPromise = null
  const historyCache = ref({})
  const historyInflight = new Map()
  const historyGeneration = new Map()

  function historyKey(filingId, fundId, fieldNo) {
    return `${filingId}|${fundId}|${fieldNo}`
  }

  function questionHistory(filingId, fundId, fieldNo) {
    return historyCache.value[historyKey(filingId, fundId, fieldNo)] || null
  }

  async function loadQuestionHistory(userId, { filingId, fundId, fieldNo }, options = {}) {
    const key = historyKey(filingId, fundId, fieldNo)
    if (options.force) {
      historyGeneration.set(key, (historyGeneration.get(key) || 0) + 1)
      const next = { ...historyCache.value }
      delete next[key]
      historyCache.value = next
      historyInflight.delete(key)
    }
    if (historyCache.value[key]) return historyCache.value[key]
    if (historyInflight.has(key)) return historyInflight.get(key)

    const generation = historyGeneration.get(key) || 0
    const request = api_call_methods.get_history(
      userId,
      { filingId, fundId, fieldNo },
      { skipErrorToast: options.skipErrorToast !== false }
    ).then((res) => {
      if ((historyGeneration.get(key) || 0) !== generation) {
        return historyCache.value[key] || null
      }
      historyCache.value = { ...historyCache.value, [key]: res.data }
      return res.data
    }).finally(() => {
      if (historyInflight.get(key) === request) historyInflight.delete(key)
    })
    historyInflight.set(key, request)
    return request
  }

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
    ensureComputations,
    questionHistory,
    loadQuestionHistory
  }
})
