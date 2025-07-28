<template>
    <div class="d-flex flex-direction-col">
        <button class="btn btn-primary m-4" @click="emit_add_User_event()"><font-awesome-icon class="icon me-2" icon="user-plus" style="font-size: 1em;" />Add New User</button>
        <div class="dropdown m-4">
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

const emit=defineEmits(
    ['add-user']
)

function emit_add_User_event(){
    emit('add-user')
}

</script>