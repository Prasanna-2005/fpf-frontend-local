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

    function updateItem(fundName,seriesName,field_no,item_obj,fieldIndex){ 
        fund_series_mapper.value[fundName][seriesName][fieldIndex]['isRestoreAvailable']=true
        fund_series_mapper.value[fundName][seriesName][fieldIndex]['restoreValue']=fund_series_mapper.value[fundName][seriesName][fieldIndex]['field_data']
        fund_series_mapper.value[fundName][seriesName][fieldIndex]['field_data'] = item_obj    
    }
    function restoreItem(fundName, seriesName, field_no,fieldIndex) {
        //to be used in later stage of development
        const target = fund_series_mapper.value[fundName]?.[seriesName]
        if (!target) return
        const item = target[fieldIndex]
        if (!item) return
        const restoreCopy = JSON.parse(JSON.stringify(item.restoreValue)) 
        fund_series_mapper.value[fundName][seriesName][fieldIndex] = {
            ...fund_series_mapper.value[fundName][seriesName][fieldIndex],
            isRestoreAvailable: false,
            field_data: restoreCopy
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