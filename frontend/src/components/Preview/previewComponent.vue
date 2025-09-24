<template>
  <div class="w-100 p-2">
    <!-- Buttons -->
    <div class="button-options mb-3">
      <button class="btn btn-primary m-2 border-0" @click="downloadPDF">
        <font-awesome-icon class="icon" icon="download" /> Pdf Preview
      </button>
      <button class="btn btn-primary m-2 border-0">
        <font-awesome-icon class="icon" icon="download" /> Input File
      </button>
      <button class="btn btn-primary m-2 border-0" @click="createCopyPopUp">
        <font-awesome-icon class="icon" icon="check-double" /> Duplicate
      </button>
      <button class="btn btn-primary m-2 border-0" @click="approvePopUp">
        <font-awesome-icon class="icon" icon="check-double" /> Approve
      </button>
      <button class="btn btn-primary m-2 border-0">
        <font-awesome-icon class="icon" icon="pen" /> Edit
      </button>
      <button class="btn btn-primary m-2 border-0">
        <font-awesome-icon class="icon" icon="arrow-left" /> Back
      </button>
    </div>

    <!-- PDF Viewer -->
    <div class="pdf-viewer">
      <div class="pdf-page" ref="pdfContent">
        <div
          v-for="(seriesData, fundKey, idx) in data"
          :key="fundKey"
          :class="['pdf-series', idx > 0 ? 'page-break' : '']"
        >
          <!-- Fund Header -->
          <div class="d-flex w-100 mb-4" style="border: 1px solid;">
            <div style="border: 1px solid;" class="w-25 p-2">
              <h4>{{ fundKey }}</h4>
            </div>
            <div style="border: 1px solid;" class="w-75 p-2">
              <h4>Information about the private funds you advise</h4>
            </div>
          </div>

          <!-- Group by Heading -->
          <div v-for="(fieldsGroup, heading) in groupByHeading(seriesData)" :key="heading">
            <h4><b>{{ heading }}</b></h4>
            <b><hr /></b>

            <!-- Fields Loop -->
            <div
              v-for="(fields, fieldIndex) in fieldsGroup"
              :key="fieldIndex"
              class="pdf-field"
              :style="{ marginLeft: getIndent(fields.field_no) + 'px' }"
            >
              <p class="field-number">
                {{ getDisplayFieldNo(fields.field_no) }})
                <span v-if="fields.has_field_item_text">
                  <span class="line-text">{{ fields.field_text }}:</span>
                  <span class="line-value"><b>{{ fields.value }}</b></span>
                </span>
              </p>

              <!-- Table Data -->
              <div v-if="fields.has_table_data && fields.table_data?.length" class="table-responsive my-2">
                <table class="table table-bordered table-sm thick-border">
                  <thead>
                    <tr class="thick-border">
                      <th
                        v-for="(val, key, colIndex) in fields.table_data?.[0] || {}"
                        :key="colIndex"
                        class="thick-border"
                      >
                        <b>{{ key.toUpperCase() }}</b>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, rowIndex) in fields.table_data || []" :key="rowIndex" class="thick-border">
                      <td v-for="(val, key, colIndex) in row" :key="colIndex" class="thick-border">
                        <span v-if="key === 's.name'">{{ getDisplayFieldNo(val) }}</span>
                        <span v-else>{{ val }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Field Sub Items -->
              <div v-if="fields.field_data?.length" class="field-content">
                <span v-for="(items, itemIndex) in fields.field_data" :key="itemIndex" class="line-item">
                  <p :style="{ marginLeft: getIndent(items.line_item_no) + 'px' }">
                    <span class="line-number field-number">{{ getDisplayFieldNo(items.line_item_no) }}).</span>
                    <span class="line-text">{{ items.line_text }}:</span>

                    <!-- Normal value -->
                    <span v-if="items.line_item_type !== 'table'" class="line-value">
                      <b>{{ items.value }}</b>
                    </span>
                  </p>

                  <!-- Nested Table -->
                  <div v-if="items.line_item_type === 'table' && items.table_data?.length" class="table-responsive my-2">
                    <table class="table table-bordered table-sm thick-border">
                      <thead>
                        <tr class="thick-border">
                          <th
                            v-for="(val, key, colIndex) in items.table_data?.[0] || {}"
                            :key="colIndex"
                            class="thick-border"
                          >
                            <b>{{ key.toUpperCase() }}</b>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, rowIndex) in items.table_data || []" :key="rowIndex" class="thick-border">
                          <td v-for="(val, key, colIndex) in row" :key="colIndex" class="thick-border">
                            <span v-if="key === 's.name'">{{ getDisplayFieldNo(val) }}</span>
                            <span v-else>{{ val }}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEditableStore } from '@/stores/responseStore';
import { ref, nextTick } from 'vue';
import html2pdf from 'html2pdf.js';

const responseStore = useEditableStore();
const data = responseStore.getAllData();
console.log("data==============", data);

const pdfContent = ref(null);
const emit = defineEmits(['create-copy', 'approve']);

// Group fields safely
function groupByHeading(seriesData) {
  return seriesData.reduce((acc, item) => {
    const heading = item.field_heading || "Other";
    if (!acc[heading]) acc[heading] = [];
    acc[heading].push(item);
    return acc;
  }, {});
}

// PDF download
async function downloadPDF() {
  await nextTick(); 
  const element = pdfContent.value;
  if (!element) return;

  const options = {
    margin: 10,
    filename: 'preview.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 1.5, useCORS: true, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] }
  };

  html2pdf().set(options).from(element).save();
}

function getDisplayFieldNo(fieldNo) {
  const parts = fieldNo.split('_');
  return parts[parts.length - 1];
}

function getIndent(fieldNo) {
  const depth = (fieldNo.match(/_/g) || []).length;
  return depth * 30;
}

function createCopyPopUp() {
  emit('create-copy');
}

function approvePopUp() {
  emit('approve');
}
</script>

<style scoped>
.thick-border { border: 2px solid black; }
.pdf-viewer { border: 1px solid #ccc; background: #f2f2f2; padding: 20px; }
.pdf-page {
  width: 1122px; max-width: 100%; box-sizing: border-box; padding: 40px;
  background: white; margin: auto; box-shadow: 0 0 8px rgba(0,0,0,0.15);
  font-family: 'Times New Roman', serif; line-height: 1.4;
}
.pdf-field { margin-bottom: 25px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
.field-number { font-weight: bold; font-size: 16px; }
.field-content { margin-left: 20px; }
.line-item p { margin: 4px 0; }
.line-number { font-weight: bold; margin-right: 5px; }
.line-text { font-style: italic; margin-right: 5px; }
.page-break { page-break-before: always; }
</style>
