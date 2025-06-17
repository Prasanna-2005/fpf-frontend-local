<template>
    <div class=" custom-view gap-4" style=" padding: 20px; width: 300px; height: 60px; box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1); border-radius: 5px;" >
        
        <div class="d-flex justify-content-between align-items-center max-dimensions">
            <font-awesome-icon class="icon me-2" icon="file" style="font-size: 2em;" />
            <p>{{ filename }}</p>
            <div class="d-flex justify-content-end align-items-start " height="100%">
                <button class="btn">
                    <font-awesome-icon class="icon me-2" icon="xmark" style="font-size: 0.7em;" @click="remove_file(filename)" />
                </button>
                
            </div>
        </div>
    </div>  
    

</template>

<script setup>
import { useFileStore } from '@/stores/fileStore'

const fileStore = useFileStore()
const props=defineProps({
    filename: String,
})
const emit=defineEmits(['remove-file'])

function remove_file(filename){
    emit('remove-file',filename)
}
</script>  