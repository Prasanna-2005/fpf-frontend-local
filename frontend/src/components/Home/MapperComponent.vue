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
            <th scope="col">Quarter</th>
            <th scope="col">Mapped File</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(fund, index) in localData.fund_details" :key="index">
            <td>{{ fund.fundname }}</td>
            <td>{{ fund.quarter }}</td>
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

    <div class="w-100 d-flex justify-content-end align-items-center pt-2">
      <button class="btn btn-primary" @click="proceed">Proceed</button>
    </div>
  </div>
</template>

<script setup>
import api_call_methods from "@/assets/api_calls/api_calls";
import { ref } from "vue";
import { useFileStore} from '@/stores/fileStore'
import { useUserStore } from '@/stores/userStore'

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
  unmapped_files: props.data.unmapped_files || []   
});


const uploaderFlag = ref(false);

function getMappedFile(fund) {
  const mapping = localData.value.file_mappings.find(
    (fm) => fm.shortcode === fund.shortcode && fm.quarter === fund.quarter
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
  });

  console.log(localData.value);
}


function remove_file_from_fund(fund, filename) {
  if (!localData.value.unmapped_files) {
    localData.value.unmapped_files = [];
  }

  const idx = localData.value.file_mappings.findIndex(
    (fm) =>
      fm.shortcode === fund.shortcode &&
      fm.quarter === fund.quarter &&
      fm.filename === filename
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
    const current_time = new Date();
    const data={
        "user_id": user_id,
        "filing_name": filingName,
        "file_mappings":localData.value.file_mappings,
        "new_filing":true,
        "timestamp": current_time
        }

    print("data for submit::::::",data)
    await api_call_methods.submit_files(data,user_id)
    location.reload();
    alert("Mappings updated successfully!");
  } catch (err) {
    console.error("Error updating mappings:", err);
    alert("Failed to update mappings.");
  }
}

function open_uploader() {
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
