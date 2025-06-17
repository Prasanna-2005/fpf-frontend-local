// stores/fileStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFileStore = defineStore('file', () => {
  const formData = ref(new FormData())
  const files = ref([])

  function addFiles(newFiles) {
    for (const file of newFiles) {
      if (!files.value.find(f => f.name === file.name)) {
        formData.value.append('files', file)
        files.value.push(file)
      }
    }
  }

  function removeFile(filename) {
    files.value = files.value.filter(file => file.name !== filename)

    const newForm = new FormData()
    for (const file of files.value) {
      newForm.append('files', file)
    }
    formData.value = newForm
  }

  function clearFiles() {
    formData.value = new FormData()
    files.value = []
  }
  function getFiles() {
    return [...files.value] 
  }

  return {
    formData,
    files,
    addFiles,
    removeFile,
    clearFiles,
    getFiles
  }

})
