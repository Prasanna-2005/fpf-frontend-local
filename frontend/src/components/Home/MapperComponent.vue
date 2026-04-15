<template>
  <div
    class="mapper-component custom-view d-flex flex-column justify-content-center align-items-center"
    v-if="!uploaderFlag"
  >
    <div class="d-flex justify-content-between align-items-center w-100 ">
      <h3>Mapped Files</h3>
      <button class="btn btn-primary" @click="open_uploader()">
        <font-awesome-icon class="icon me-2" icon="upload" style="font-size:1em;" />
        Upload More files
      </button>
    </div>

    <div class="table-div max-dimensions pt-0">
      <table class="table table-bordered">
        <thead class="table-light">
          <tr>
            <th scope="col">Fund Name</th>
            <th scope="col" v-if="series=='Private Investors'">Quarter</th>
            <th scope="col" v-else >File Type</th>
            <th scope="col" v-if="series=='Curio'">Period</th>
            <th scope="col">Mapped File</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(fund, index) in localData.fund_details" :key="index">
            <td>{{ fund.fundname }}</td>
            <td >
              {{ fund.quarter }}
            </td>
            <td  v-if="series=='Curio'">{{ fund.period }}</td>
            <td>
              <!-- Show mapped file -->
              <span v-if="getMappedFile(fund)">
                {{ getMappedFile(fund) }}
                <font-awesome-icon
                  class="icon ms-2"
                  icon="xmark"
                  style="font-size: 0.7em; cursor: pointer;"
                  @click="remove_file_from_fund(fund, getMappedFile(fund))"
                />
              </span>

              <!-- Show dropdown if no file mapped -->
              <div v-else class="dropdown">
                <button
                  class="btn btn-primary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Select file 

                </button>
                <ul class="dropdown-menu">
                  <li
                    v-for="(item, idx) in localData.unmapped_files"
                    :key="idx"
                  >
                    <a
                      class="dropdown-item"
                      href="#"
                      @click="update_unmapped_files(fund, item.filename)"
                      >{{ item.filename }}</a
                    >
                  </li>
                </ul>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="w-100 d-flex justify-content-end align-items-center pt-2 gap-2">
      <button class="btn btn-outline-secondary" @click="handleCancel">
        Cancel
      </button>
      <button type="submit" class="btn btn-primary " @click="proceed" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          <span v-if="!isLoading">Submit</span>
          <span v-else>Submitting...</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import api_call_methods from "@/assets/api_calls/api_calls";
import { ref } from "vue";
import { useFileStore} from '@/stores/fileStore'
import { useUserStore } from '@/stores/userStore'
import { useToast } from 'vue-toast-notification';
const toast = useToast();
const emit=defineEmits(['open-uploader'])
const isLoading=ref(false)
const fileStore = useFileStore()
const filingName = fileStore.getfilingName()

const userStore=useUserStore()
const user_id=userStore.userID
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});


const localData = ref({
  ...JSON.parse(JSON.stringify(props.data)),
  unmapped_files: (props.data.unmapped_files || []).map(file =>
    typeof file === "string" ? { filename: file } : file
  )
});

const series=localData.value.series

const uploaderFlag = ref(false);

function isSameMapping(fm, fund) {
  return (
    fm.shortcode === fund.shortcode &&
    fm.quarter === fund.quarter &&
    (
      // if period exists 
      (fm.period || fund.period)
        ? fm.period === fund.period
        : true 
    )
  );
}

// function getPeriod(fund) {
//   const mapping = localData.value.file_mappings.find(fm =>
//     isSameMapping(fm, fund)
//   );
  
//   return mapping ? mapping.period : "";
// }

function getMappedFile(fund) {
  const mapping = localData.value.file_mappings.find(fm =>
    isSameMapping(fm, fund)
  );
  
  return mapping ? mapping.filename : "";
}

function update_unmapped_files(fund, filename) {
  if (!localData.value.unmapped_files) {
    localData.value.unmapped_files = [];
  }

  const idx = localData.value.unmapped_files.findIndex(
    (f) => f.filename === filename
  );

  let fileObj = null;
  if (idx !== -1) {
    fileObj = localData.value.unmapped_files[idx];
    localData.value.unmapped_files.splice(idx, 1);
  }


  localData.value.file_mappings.push({
    filename,
    filepath: fileObj?.filepath || "", 
    shortcode: fund.shortcode,
    quarter: fund.quarter,
    fundname: fund.fundname,
    period: fileObj?.period || ""
  });

}


function remove_file_from_fund(fund, filename) {
  if (!localData.value.unmapped_files) {
    localData.value.unmapped_files = [];
  }

  const idx = localData.value.file_mappings.findIndex(fm =>
    isSameMapping(fm, fund) && fm.filename === filename
  );

  if (idx !== -1) {
    const fileObj = localData.value.file_mappings[idx];

    localData.value.file_mappings.splice(idx, 1);

    const exists = localData.value.unmapped_files.some(
      (f) => f.filename === filename
    );
    if (!exists) {
      localData.value.unmapped_files.push({
        filename: fileObj.filename,
        filepath: fileObj.filepath, 
      });
    }
  }
}


async function proceed() {
  try {
    isLoading.value=true
    const new_filing=fileStore.getNewFilingField()
    const current_time = new Date();
    const data={
        "user_id": user_id,
        "filing_name": filingName,
        "file_mappings":localData.value.file_mappings,
        "new_filing":new_filing,
        "timestamp": current_time,
        "series":localData.value.series
        }

    await api_call_methods.submit_files(data,user_id)
    toast.success("Mappings updated successfully!")
    location.reload();
  } catch (error) {
    console.error("Error updating mappings:", error);
    toast.error(error.response.data.message)
  }
  finally{
    isLoading.value=false
  }
}

async function handleCancel(){
  try{
    const data={
      "filing_name":filingName,
    }
    if (fileStore.getNewFilingField()){
      await api_call_methods.discard_filing(data,user_id)
      toast.success("Filing cancelled!")
      fileStore.clearAllData()
    }
    emit('close-click')
  }catch{

  }
}

function open_uploader() {
  fileStore.upload_more()
  emit('open-uploader')
  uploaderFlag.value = true;
}
</script>

<style scoped>
.table-div {
  max-height: 450px !important;
  overflow-y: auto;
}
.mapper-component {
  width: 70%;
  height: 70%;
  padding: 20px;
  background-color: white;
  border-radius: 15px;
}
</style>
