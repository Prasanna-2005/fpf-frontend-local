<template>
    <div class="mapper-component custom-view d-flex flex-column justify-content-center align-items-center">
        <div class="d-flex justify-content-between align-items-center w-100">
            <h3>Mapped Files</h3>
            <button class="btn btn-primary"><font-awesome-icon class="icon me-2" icon="upload" style="font-size:1em;" />Upload More files</button>
        </div>
        <div class="table-div max-dimensions">
            <table class="table table-bordered">
            <thead class="table-light">
                <tr>
                <th class="tr-padding" scope="col">S.no.</th>
                <th scope="col">Fund Name</th>
                <th scope="col">Mapped File</th>
                </tr>
            </thead>
            <tbody >
                <tr v-for="(data, index) in Data" :key="index">
                <th scope="row">{{ data['s.no'] }}</th>
                <td>{{ data['fund Name'] }}</td>
                <td>{{ data['Mapped file'] }}</td>
                </tr>
            </tbody>
            </table>
        </div>
        <div>
            <button class="btn btn-primary">Proceed</button>
        </div>
    </div>
    
</template>
<script setup>

import mapped_sample_json from '@/assets/Sample_data/mappedsample'

const Data=mapped_sample_json['data']


</script>

<style>

.mapper-component{
    width: 70%; 
    height: 70%; 
    padding: 20px; 
    background-color: white;
    border-radius: 15px;
}
</style>