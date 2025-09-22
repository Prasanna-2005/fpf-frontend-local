// stores/fileStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFileStore = defineStore('file', () => {
  const files = ref([]);
  const filing = ref('');
  let filing_name=''
  function addFiles(filingName, newFiles) {
    filing.value = filingName;
    filing_name=filingName
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
    return filing_name


  }

  function getFormData() {
    const fd = new FormData();
    files.value.forEach(file => fd.append('files', file));
    // fd.append('filing_name', filing.value);
    return fd;
  }

  return {
    files,
    addFiles,
    removeFile,
    clearFiles,
    getFiles,
    getfilingName,
    getFormData
  };
});
