import { defineStore } from 'pinia'
import {ref,toRaw} from'vue'

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
            fund_series_mapper.value[fundId][seriesName] = series.data.map(q => ({ ...q }))
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
        const data=toRaw(fund_series_mapper.value[fundName][seriesName])
        return data
    }


    return {
        setResponse,
        getFunds,
        getSeries,
        getfundSeriesdata  
    }


})