import { defineStore } from 'pinia'
import {ref} from'vue'

export const useEditableStore=defineStore('response',()=>{
    const response=ref([])
    const fund_series_mapper=ref({})

    function setResponse(rawResponse) {
        response.value = rawResponse
        fund_series_mapper.value = {}

        rawResponse.funds.forEach(fund => {
        const fundId = fund.fund_id
        fund_series_mapper.value[fundId] = {}
   
        fund.series.forEach(series => {
            const seriesName = series.series_name
            fund_series_mapper.value[fundId][seriesName] = series.data.map(q => ({ 
                ...q,
                isRestoreAvailable: false,
                restoreValue: null
            }))
        })
        })
    }

    function getFunds(){
        const fund_names=Object.keys(fund_series_mapper.value)
        return fund_names
    }

    function getSeries(fundName){
        const series_names= Object.keys(fund_series_mapper.value[fundName])
        return series_names
    }
    function getfundSeriesdata(fundName,seriesName){
        const fundSeriesData=fund_series_mapper.value[fundName][seriesName]
        return fundSeriesData
    }

    function updateItem(fundName,seriesName,field_no,item_obj){
        const target = fund_series_mapper.value[fundName]?.[seriesName]
        if (!target) return

        const index = target.findIndex(item => item.field_no === field_no)
        
        if (index !== -1) {
            fund_series_mapper.value[fundName][seriesName][index]['isRestoreAvailable']=true
            fund_series_mapper.value[fundName][seriesName][index]['restoreValue']=fund_series_mapper.value[fundName][seriesName][index]['field_data']
            fund_series_mapper.value[fundName][seriesName][index]['field_data'] = item_obj 
        }

        
    }
    function restoreItem(fundName, seriesName, field_no) {
        const target = fund_series_mapper.value[fundName]?.[seriesName]
        if (!target) return

        const index = target.findIndex(item => item.field_no === field_no)
        if (index !== -1) {
        const restoreCopy = JSON.parse(JSON.stringify(target[index].restoreValue)) // deep clone
        fund_series_mapper.value[fundName][seriesName][index] = {
            ...fund_series_mapper.value[fundName][seriesName][index],
            isRestoreAvailable: false,
            field_data: restoreCopy
            }
        }
    }


    return {
        setResponse,
        getFunds,
        getSeries,
        getfundSeriesdata,
        updateItem,
        restoreItem
        
    }


})