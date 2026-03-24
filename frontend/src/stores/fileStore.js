// stores/fileStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFileStore = defineStore('file', () => {
  const files = ref([]);
  const filing = ref('');
  const filing_name=ref('')
  const new_filing=ref(true)
  const existingNames = ref([])
  const upload_more_mapper=ref(false)
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
  function add_filing_name(name){
    filing_name.value=name
  }

  function getFiles() {
    return [...files.value];
  }

  function getfilingName() {
    return filing_name.value
  }
  function updateNewFiling(){
    new_filing.value=false
    console.log('updateNewFiling()')
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
    upload_more_mapper.value=false
  } 

  function upload_more(){
    upload_more_mapper.value=true
  }
  function getUploadMore(){
    return upload_more_mapper.value
  }

  function setExistingNames(names) {
    existingNames.value = names
  }

  function isNameTaken(name) {
    return existingNames.value.includes(name.toLowerCase())
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
    clearAllData,
    existingNames,
    setExistingNames,
    isNameTaken,
    add_filing_name,
    upload_more,
    getUploadMore
  };
});
