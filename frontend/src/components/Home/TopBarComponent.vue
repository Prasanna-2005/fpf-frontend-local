<template>
    <div class="d-flex top-bar justify-content-between align-items-center" >
        <div class="d-flex flex-row align-items-center gap-2">
            <font-awesome-icon class="icon me-2" icon="file-lines" style="font-size: 2em;" />
            <span class="fw-bolder" style="font-size: 1.5em;"> Contributor Dashboard</span>
        </div>
        <div class="d-flex justify-content-end align-items-center gap-2">
            <div class="dropdown">
                <button
                type="button"
                class="btn btn-outline-secondary dropdown-toggle"
                data-bs-toggle="dropdown"
                >
                {{ selectedYear }}
                </button>
                <ul class="dropdown-menu">
                <li v-for="(year, index) in years" :key="index">
                    <a class="dropdown-item" href="#" @click.prevent="selectYear(year)">
                    {{ year }}
                    </a>
                </li>
                </ul>
            </div>

            <button class="btn btn-primary" @click="$emit('upload-click')">Upload new filing</button>
             
            <div class="input-group " style="width: 150px;">
                <span class="input-group-text"><font-awesome-icon class="icon me-2" icon="search" /></span>
                <input type="text"  placeholder="Search" class="form-control" aria-label="Search" v-model="search" @input="emitSearch">
            </div>
        </div>
             
        </div>
</template>
<script setup>
import {ref} from 'vue';
const emit = defineEmits(['update:search'])
const search = ref('')
function emitSearch() {
  emit('update:search', search.value)
}


const years = ['YEAR 2024-25', 'YEAR 2023-24', 'YEAR 2022-23']
const selectedYear = ref(years[0])
function selectYear(year) {
  selectedYear.value = year
}
</script>