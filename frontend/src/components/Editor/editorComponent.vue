<template>
    <div class="w-100 p-2">
        <div class="button-options">
            <button class="btn btn-primary m-2 border-0"><font-awesome-icon class="icon" icon="download" /> Pdf Preview</button>
            <button class="btn btn-primary m-2 border-0"><font-awesome-icon class="icon" icon="download" /> Input File</button>
            <button class="btn btn-primary m-2 border-0"><font-awesome-icon class="icon" icon="check-double" /> Save</button>
            <button class="btn btn-primary m-2 border-0"><font-awesome-icon class="icon" icon="arrow-left" />Back</button>
        </div>
        <div class="max-dimensions" style="border: 1px solid; height: 730px;">
            <div> 
                <InputItemComponent :itemNumber="5" itemText="this is a question"  /> 
            </div>
        </div>
    </div>

</template>
<script setup>
import InputItemComponent from './subcomponent/InputItemComponent.vue';


</script>

<style scoped>

</style>