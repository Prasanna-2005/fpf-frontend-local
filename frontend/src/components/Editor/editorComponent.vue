<template>
    <div class="w-100 p-2">
        <div class="button-options">
            <button class="btn btn-primary m-2 border-0"><font-awesome-icon class="icon" icon="download" /> Pdf Preview</button>
            <button class="btn btn-primary m-2 border-0"><font-awesome-icon class="icon" icon="download" /> Input File</button>
            <button class="btn btn-primary m-2 border-0"><font-awesome-icon class="icon" icon="check-double" /> Save</button>
            <button class="btn btn-primary m-2 border-0"><font-awesome-icon class="icon" icon="arrow-left" />Back</button>
        </div>
        <div class="max-dimensions" style="border: 1px solid; height: 730px; overflow: scroll;">
            <div class="editor-header">
                <h3>{{ props.fundName }} {{ props.seriesName }}</h3>

            </div>
            <div > 
                 <div v-for="(fields,fieldIndex) in data" :key="fieldIndex">
                    <p> <span>{{ fields['field_no'] }})</span></p>
                    <div class="d-flex justify-content-end">
                        <div style="width: 95%;">
                            <span v-for="(items,itemIndex) in fields.field_data" :key="itemIndex">
                                <InputItemComponent v-if="items.line_item_type==='text'" :itemNumber="items.line_item_no" :itemText="items.line_text" :itemValue="items.value[0]" /> 
                                <BooleanItemComponent v-else-if="items.line_item_type==='bool'" :itemNumber="items.line_item_no" :itemText="items.line_text" :itemValue="items.value[0]" />
                                <DropdownItemComponent v-else-if="items.line_item_type==='dropdown'" :itemNumber="items.line_item_no" :itemText="items.line_text" :itemValue="items.value[0]" :options="items.options"/>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import BooleanItemComponent from './subcomponent/BooleanItemComponent.vue';
import InputItemComponent from './subcomponent/InputItemComponent.vue';
import DropdownItemComponent from './subcomponent/DropdownItemComponent.vue';
import response from '@/assets/Sample_data/responsedata';
import { useEditableStore } from '@/stores/responseStore';
const props=defineProps({
    fundName:{
        type:String,
        required:true
    },
    seriesName:{
        type:String,
        required:true
    }
})
console.log(response)
const responseStore=useEditableStore()

responseStore.setResponse(response)
const data=responseStore.getfundSeriesdata('1','A')  
console.log('funds:->',responseStore.getFunds())
console.log('series:->',responseStore.getSeries(1))


console.log(data)


</script>

<style scoped>

</style>