import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEditableStore = defineStore('response', () => {
  const response = ref([])
  const fund_mapper = ref({})

  function setResponse(rawResponse) {
    response.value = rawResponse
    fund_mapper.value = {}
   
    rawResponse.funds.forEach(fund => {
      const fundName = fund.fund_name
      fund_mapper.value[fundName] = fund.fund_data.map(q => ({
        ...q,
        isRestoreAvailable: false,
        restoreValue: null,
        fund_id: fund.fund_id
      }))
    })
  }

  function getFunds() {
    return Object.keys(fund_mapper.value)
  }

  function getFundData(fundName) {
    return fund_mapper.value[fundName] 
  }

  function getAllData(){
    return fund_mapper.value
  }

  function getFundId(fundName) {
    const fundData = fund_mapper.value[fundName]
    if (!fundData || fundData.length === 0) return null
    return fundData[0].fund_id || null
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
    getFundId
  }
})
