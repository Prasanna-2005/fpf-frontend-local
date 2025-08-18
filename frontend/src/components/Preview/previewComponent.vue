<template>
  <div class="w-100 p-2">
    <div class="button-options mb-3">
      <button class="btn btn-primary m-2 border-0" @click="downloadPDF">
        <font-awesome-icon class="icon" icon="download" /> Pdf Preview
      </button>
      <button class="btn btn-primary m-2 border-0">
        <font-awesome-icon class="icon" icon="download" /> Input File
      </button>
      <button class="btn btn-primary m-2 border-0">
        <font-awesome-icon class="icon" icon="check-double" /> Save
      </button>
      <button class="btn btn-primary m-2 border-0">
        <font-awesome-icon class="icon" icon="arrow-left" /> Back
      </button>
    </div>

   
    <div class="pdf-viewer">
  <div class="pdf-page" ref="pdfContent">

   
    <div class="d-flex w-100 mb-4" style="border: 1px solid;">
      <div style="border: 1px solid;" class="w-25 p-2">
        <h4>Form PF Section 1b</h4>
      </div>
      <div style="border: 1px solid;" class="w-75 p-2">
        <h4>Information about the private funds you advise</h4>
      </div>
    </div>

  
    <div v-for="(fieldsGroup, heading) in groupedData" :key="heading">
      <h4><b>{{ heading }}</b></h4>
      <b><hr /></b>

      <div
        v-for="(fields, fieldIndex) in fieldsGroup"
        :key="fieldIndex"
        class="pdf-field"
        :style="{ marginLeft: getIndent(fields.field_no) + 'px' }"
      >
        <p class="field-number">
          {{ getDisplayFieldNo(fields.field_no) }})

          <!-- if has_field_item_text -->
          <span v-if="fields.has_field_item_text">
            <span class="line-text">{{ fields.field_text }}:</span>
            <span class="line-value"><b>{{ fields.value[0] }}</b></span>
          </span>
          <!-- if has_table_data -->
        <div v-if="fields.has_table_data" class="table-responsive my-2">
          <table class="table table-bordered table-sm">
            <thead>
              <tr>
                <th v-for="(val, key, colIndex) in fields.table_data[0]" :key="colIndex">
                  <b>{{ key.toUpperCase()}}</b>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in fields.table_data" :key="rowIndex">
                <td v-for="(val, key, colIndex) in row" :key="colIndex">
                  {{ val }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </p>

        <div class="field-content" v-if="fields.field_data.length">
          <span
            v-for="(items, itemIndex) in fields.field_data"
            :key="itemIndex"
            class="line-item"
          >
            <p :style="{ marginLeft: getIndent(items.line_item_no) + 'px' }">
              <span class="line-number field-number">
                {{ getDisplayFieldNo(items.line_item_no) }}).
              </span>
              <span class="line-text">{{ items.line_text }} :</span>
              <span class="line-value"><b> {{ items.value[0] }}</b></span>
            </p>
          </span>
        </div>
      </div>
    </div>
  </div>
</div>

  </div>
</template>

<script setup>
import response from '@/assets/Sample_data/responsedata';
import { useEditableStore } from '@/stores/responseStore';
import { ref, computed} from 'vue';
import html2pdf from 'html2pdf.js';

const responseStore = useEditableStore();
responseStore.setResponse(response);
const data = responseStore.getfundSeriesdata('1', 'A');
const pdfContent = ref(null);

const groupedData = computed(() => {
  return data.reduce((acc, item) => {
    if (!acc[item.field_heading]) {
      acc[item.field_heading] = [];
    }
    acc[item.field_heading].push(item);
    return acc;
  }, {});
});


const downloadPDF = () => {
  const element = pdfContent.value;
  const options = {
    margin: 10,
    filename: 'preview.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };
  html2pdf().set(options).from(element).save();
};


const getDisplayFieldNo = (fieldNo) => {
  const parts = fieldNo.split('_');
  return parts[parts.length - 1]; 
};

//for indentation
const getIndent = (fieldNo) => {
  const depth = (fieldNo.match(/_/g) || []).length;
  return depth * 30; 
};

</script>

<style scoped>

.pdf-viewer {
  border: 1px solid #ccc;
  height: 730px;
  overflow-y: auto;
  background: #f2f2f2;
  padding: 20px;
}

.pdf-page {
  background: white;
  padding: 40px;
  
  margin: auto;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);
  font-family: 'Times New Roman', serif;
  line-height: 1.6;
   page-break-after: always;
}
.pdf-page:last-child {
  page-break-after: auto;
}

.pdf-field {
  margin-bottom: 25px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

.field-number {
  font-weight: bold;
  font-size: 16px;
}

.field-content {
  margin-left: 20px;
}

.line-item p {
  margin: 4px 0;
}

.line-number {
  font-weight: bold;
  margin-right: 5px;
}

.line-text {
  font-style: italic;
  margin-right: 5px;
}
</style>
