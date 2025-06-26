<template>
    <div class="mapper-component custom-view d-flex flex-column justify-content-center align-items-center">
        <div class="d-flex justify-content-between align-items-center w-100 ">
            <h3>Mapped Files</h3>
            <button class="btn btn-primary"><font-awesome-icon class="icon me-2" icon="upload" style="font-size:1em;" />Upload More files</button>
        </div>
        <div class="table-div max-dimensions pt-0">
            <table class="table table-bordered">
            <thead class="table-light">
                <tr>
                <th class="tr-padding fix" scope="col">S.no.</th>
                <th class="fix" scope="col">Fund Name</th>
                <th class="fix" scope="col">Mapped File</th>
                </tr>
            </thead>
            <tbody >   
                <tr v-for="(data, index) in Data" :key="index">
                <th scope="row">{{ data['s.no'] }}</th>
                <td>{{ data['fund Name'] }}</td>
                <td v-if="data['Mapped file']!=''">{{ data['Mapped file'] }}  <font-awesome-icon class="icon me-2" icon="xmark" style="font-size: 0.7em;" @click="remove_file_from_fund(data['fund Name'],data['Mapped file'])" /></td>
                <td v-else> 
                    <div class="dropdown">
                        <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Select file
                        </button>
                        <ul class="dropdown-menu">
                            <li  v-for="(items, index) in unmapped_data" :key="index"><a class="dropdown-item" href="#" @click="update_unmapped_files(data['fund Name'],items['filename'])">{{items['filename']}}</a></li>
                        </ul>
                    </div>
                </td>
                </tr>
            </tbody>
            </table>
        </div>
        <div class="w-100 d-flex justify-content-end align-items-center pt-2">
           <button class="btn btn-primary">Proceed</button>
        </div>
    </div>
    
</template>
<script setup>
import { ref} from 'vue'

import mapped_sample_json from '@/assets/Sample_data/mappedsample';
const Data=ref(mapped_sample_json['data'])
const unmapped_data=ref([{'filename':'file7'},{'filename':'file9'},{'filename':'file11'}]);

function update_unmapped_files(fundname,filename){
    unmapped_data.value = unmapped_data.value.filter(item => item.filename !== filename);
    const fund = Data.value.find(item => item["fund Name"] === fundname);
    if (fund) {
        fund["Mapped file"] = filename;
    }
}

function remove_file_from_fund(fundname,filename){
    const fund = Data.value.find(item => item["fund Name"] === fundname);
    if (fund) {
        fund["Mapped file"] = "";
    }
    unmapped_data.value.push({ filename: filename });

}
</script>x

<style scoped>

.table-div {
    max-height: 450px !important;
    overflow-y: scroll;
}
.mapper-component{
    width: 70%; 
    height: 70%; 
    padding: 20px; 
    background-color: white;
    border-radius: 15px;
}
.fix{
    position: sticky; top: 0; background: white; z-index: 1;
}
</style>