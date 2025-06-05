<template>
    <div class="d-flex top-bar justify-content-between align-items-center" >
        <div class="d-flex flex-row align-items-center gap-2">
            <font-awesome-icon class="icon me-2" icon="file-lines" style="font-size: 2em;" />
            <span class="fw-bolder" style="font-size: 1.5em;"> Contributor Dashboard</span>
        </div>
        <div class="d-flex justify-content-end align-items-center gap-2">
            <button class="btn btn-primary">Dropdown Button</button>
            <button class="btn btn-primary">Upload new filing</button>
             
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
</script>