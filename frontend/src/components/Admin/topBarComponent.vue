<template>
    <div class="d-flex flex-direction-col">
        <button class="btn btn-primary m-3">Add New User</button>
        <div class="dropdown m-3">
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
    </div>

</template>

<script setup>
import {ref} from 'vue'
const years = ['YEAR 2024-25', 'YEAR 2023-24', 'YEAR 2022-23']
const selectedYear = ref(years[0])
function selectYear(year) {
  selectedYear.value = year
}


</script>