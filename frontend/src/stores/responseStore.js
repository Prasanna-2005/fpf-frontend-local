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
        restoreValue: null
      }))
    })
    console.log(fund_mapper.value)
   
  }

  function getFunds() {
    // return all fund names
    return Object.keys(fund_mapper.value)
  }

  function getFundData(fundName) {
    return fund_mapper.value[fundName] 
  }
  function getAllData(){
    return fund_mapper.value
  }

  function updateItem(fundName, field_no, item_obj, fieldIndex) {
    const target = fund_mapper.value[fundName]
    if (!target) return

    target[fieldIndex].isRestoreAvailable = true
    target[fieldIndex].restoreValue = target[fieldIndex].field_data
    target[fieldIndex].field_data = item_obj
  }

  function restoreItem(fundName, field_no, fieldIndex) {
    const target = fund_mapper.value[fundName]
    if (!target) return
    const item = target[fieldIndex]
    if (!item) return

    const restoreCopy = JSON.parse(JSON.stringify(item.restoreValue))
    target[fieldIndex] = {
      ...target[fieldIndex],
      isRestoreAvailable: false,
      field_data: restoreCopy
    }
  }


  return {
    setResponse,
    getFunds,      
    getFundData,   
    updateItem,
    restoreItem,
    getAllData
  }

})
