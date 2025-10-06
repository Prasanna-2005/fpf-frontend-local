// stores/fileStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFileStore = defineStore('file', () => {
  const files = ref([]);
  const filing = ref('');
  const filing_name=ref('')
  const new_filing=ref(true)
  function addFiles(filingName, newFiles) {
    filing.value = filingName;
    filing_name.value=filingName
    for (const file of newFiles) {
      if (!files.value.find(f => f.name === file.name)) {
        files.value.push(file);
      }
    }
  }

  function removeFile(filename) {
    files.value = files.value.filter(file => file.name !== filename);
  }

  function clearFiles() {
    files.value = [];
    filing.value = '';
  }

  function getFiles() {
    return [...files.value];
  }

  function getfilingName() {
    return filing_name.value
  }
  function updateNewFiling(){
    new_filing.value=false
  }
  function getNewFilingField(){
    return new_filing.value
  }
  function getFormData() {
    const fd = new FormData();
    files.value.forEach(file => fd.append('files', file));
    fd.append('new_filing', new_filing.value)
    // fd.append('filing_name', filing.value);
    return fd;
  }
  function clearAllData(){
    files.value = [];
    filing.value = '';
    filing_name.value=''
    new_filing.value=true
  } 

  return {
    files,
    getNewFilingField,
    addFiles,
    removeFile,
    clearFiles,
    getFiles,
    getfilingName,
    getFormData,
    updateNewFiling,
    clearAllData
  };
});
