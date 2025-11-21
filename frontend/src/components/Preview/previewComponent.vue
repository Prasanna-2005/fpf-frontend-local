<template>
  <div class="w-100 p-2">
    <!-- Buttons -->
    <div class="button-options mb-3">
      <button class="btn btn-primary m-2 border-0" @click="goToHome">
        <font-awesome-icon class="icon" icon="arrow-left" /> Dashboard
      </button>
      <button class="btn btn-primary m-2 border-0" @click="downloadPDF">
        <font-awesome-icon class="icon" icon="download" /> Pdf Preview
      </button>
      <button class="btn btn-primary m-2 border-0" @click="downloadInput">
        <font-awesome-icon class="icon" icon="download" /> Input File
      </button>
      <!-- <button class="btn btn-primary m-2 border-0" @click="createCopyPopUp">
        <font-awesome-icon class="icon" icon="check-double" /> Duplicate
      </button> -->
      <button class="btn btn-primary m-2 border-0" v-if="role=='approver' && status!='Approved'" @click="approvePopUp">
        <font-awesome-icon class="icon" icon="check-double" /> Approve
      </button>
      <button class="btn btn-primary m-2 border-0" v-if="status==='Approved'" @click="downloadXML">
        <font-awesome-icon class="icon" icon="download" /> XML
      </button>

      <button class="btn btn-primary m-2 border-0" v-if="role=='contributor' && status!='Approved' && status!='Review'"  @click="sendForApprovalPopUp">
        <font-awesome-icon class="icon" icon="check-double" /> Send For Approval
      </button>

      <button class="btn btn-primary m-2 border-0" v-if="status!='Approved'" @click="goBackToEdit">
        <font-awesome-icon class="icon" icon="pen" /> Edit
      </button>
      
    </div>

    <!-- PDF Viewer -->
    <div class="pdf-viewer">
      <div class="pdf-page" ref="pdfContent" id="pdf-preview">
        <div
          v-for="(seriesData, fundKey, idx) in data"
          :key="fundKey"
          :class="['pdf-series', idx > 0 ? 'page-break' : '']"
        >
          <!-- Fund Header -->
          <div class="d-flex w-100 mb-4" style="border: 1px solid;">
            <div style="border: 1px solid;" class="w-50 p-2">
              <h4>{{ fundKey }}</h4>
            </div>
            <div style="border: 1px solid;" class="w-50 p-2">
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
                  
                  <pre  v-if="fields.field_no=='14'" class="formatted-text">{{ defaultText }}</pre>
                   <!-- <span v-if="fields.field_no=='14'" class="formatted-text">{{ defaultText }}</span> -->
                  <span v-else class="line-text">{{ fields.field_text }}:</span>
                  
                  <span class="line-value"><b>{{ fields.value }}</b></span>
                </span>
              </p>

              <!-- Table Data -->
              <div v-if="fields.has_table_data && fields.table_data?.length" class="table-responsive my-2 ">
                <table class="table table-bordered table-sm thick-border fixed-table">
                  <thead>
                    <tr class="thick-border">
                      <template v-for="(val, key, colIndex) in fields.table_data?.[0] || {}" :key="colIndex">
                        <th
                          v-if="key !== 's.name'"
                          class="thick-border fixed-col text-center align-middle"
                        >
                          <b>{{ get_table_header_name(key).toUpperCase() }}</b>
                        </th>
                      </template>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, rowIndex) in fields.table_data || []"
                      :key="rowIndex"
                      class="thick-border"
                    >
                      <template v-for="(val, key, colIndex) in row" :key="colIndex">
                        <td
                          v-if="key !== 's.name'"
                          class="thick-border fixed-col"
                          :class="!isNaN(val[0]) ? 'number' : ''"
                        >
                          <span>{{ val }}</span>
                        </td>
                      </template>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Field Sub Items -->
              <div v-if="fields.field_data?.length" class="field-content">
                <span v-for="(items, itemIndex) in fields.field_data" :key="itemIndex" class="line-item">
                  <p :style="{ marginLeft: getIndent(items.line_item_no) + 'px' }">
                    <span class="line-number field-number">{{ getDisplayFieldNo(items.line_item_no) }})</span>
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
                            <b>{{ get_table_header_name(key).toUpperCase() }}</b>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, rowIndex) in items.table_data || []" :key="rowIndex" class="thick-border">
                          <td v-for="(val, key, colIndex) in row" :key="colIndex" class="thick-border">
                            <span v-if="key === 's.text'">{{ getDisplayFieldNo(val) }}</span>
                            <span v-else class="mono">{{ val }}</span>
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
import { ref, nextTick ,watch} from 'vue';
import { useRouter } from 'vue-router';
import jsPDF from 'jspdf';
import { defaultText } from '@/assets/text/text';
import html2canvas from 'html2canvas';
import { useToast } from 'vue-toast-notification';
import { useUserStore } from '@/stores/userStore';
const userStore=useUserStore()
const role=userStore.role
import api_call_methods from '@/assets/api_calls/api_calls';
import utils from '@/assets/utils/utils'

const router = useRouter();
const props = defineProps({
  filingId:{
        type:String,
        required:true
    },
  
  

})
const responseStore = useEditableStore();
const status=ref(responseStore.getStatus())
console.log('status',status.value)
watch(() => responseStore.status, (v) =>{
 console.log('store.status changed ->', v)
 status.value=responseStore.getStatus()
}
)


const user_id=userStore.userID
const data = responseStore.getAllData();
console.log(data)
const pdfContent = ref(null);
const emit = defineEmits(['create-copy', 'approve','send-for-approval','download-xml']);
const toast=useToast()
function groupByHeading(seriesData) {
  return seriesData.reduce((acc, item) => {
    const heading = item.field_heading || "Other";
    if (!acc[heading]) acc[heading] = [];
    acc[heading].push(item);
    return acc;
  }, {});
}


async function downloadPDF() {
  toast.info("Generating Pdf....")
  await nextTick();
  await document.fonts.ready;

  const element = document.getElementById("pdf-preview");
  if (!element) return;

  const pdf = new jsPDF("p", "pt", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const marginX = 30; // left/right padding in pts
  const marginY = 40; // top/bottom padding in pts
  const contentWidthPts = pageWidth - marginX * 2; // width in pts available for content
  const seriesBlocks = element.querySelectorAll(".pdf-series");

  
  let isFirstPageUsed = false;

  const shouldForcePageBefore = (block) => {
    const fieldNumberEl = block.querySelector(".field-number");
    const questionText = fieldNumberEl?.innerText?.trim() || "";
    const questionNumMatch = questionText.match(/^(\d+)/);
    const questionNum = questionNumMatch ? questionNumMatch[1] : "";
    return questionNum === "14" || questionNum === "17";
  };

  for (let i = 0; i < seriesBlocks.length; i++) {
    const block = seriesBlocks[i];
    block.style.backgroundColor = "#ffffff";


    if (shouldForcePageBefore(block) && isFirstPageUsed) {
      pdf.addPage();
      isFirstPageUsed = false; // new page is empty until we draw
    }

    await new Promise((r) => setTimeout(r, 120));


    const canvas = await html2canvas(block, {
      scale: 1.5, 
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollY: -window.scrollY,
      logging: false,
      windowWidth: block.scrollWidth,
    });

    const canvasWidthPx = canvas.width;
    const canvasHeightPx = canvas.height;

    const pxPerPt = canvasWidthPx / contentWidthPts;

    const pageContentHeightPts = pageHeight - marginY * 2; 
    const sliceHeightPx = Math.floor(pageContentHeightPts * pxPerPt);

    let sliceY = 0;
    let firstSliceForBlock = true;

    while (sliceY < canvasHeightPx) {
      const thisSliceHeight = Math.min(sliceHeightPx, canvasHeightPx - sliceY);

      // create temp canvas for the slice
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvasWidthPx;
      sliceCanvas.height = thisSliceHeight;
      const ctx = sliceCanvas.getContext("2d");

      // draw slice from original canvas
      ctx.drawImage(
        canvas,
        0,
        sliceY,
        canvasWidthPx,
        thisSliceHeight,
        0,
        0,
        canvasWidthPx,
        thisSliceHeight
      );

      const imgData = sliceCanvas.toDataURL("image/jpeg", 0.95);


      if (isFirstPageUsed === false && pdf.internal.getNumberOfPages() > 1) {
        // The page is fresh (we just added it), nothing to do before drawing
      }

      const dispHeightPts = (thisSliceHeight * contentWidthPts) / canvasWidthPx;

      // draw the slice at marginX, marginY (top)
      pdf.addImage(imgData, "JPEG", marginX, marginY, contentWidthPts, dispHeightPts);

      // mark that current page now has content
      isFirstPageUsed = true;
      firstSliceForBlock = false;

      sliceY += thisSliceHeight;

      
      if (sliceY < canvasHeightPx) {
        pdf.addPage();
        isFirstPageUsed = false; // new page is empty
      }
    } 
    if (i < seriesBlocks.length - 1) {
      pdf.addPage();
      isFirstPageUsed = false;
    }
  } 
  toast.success("Pdf generated successfully...")
  pdf.save("preview.pdf");
}

async function downloadInput(){
  toast.info("Downloading Input files....")
  const filing_name=localStorage.getItem('filingName')
  const response=await api_call_methods.download_input(user_id,filing_name)
  utils.downloadInputZip(response, filing_name)
  toast.success("Input files downloaded successfully")
  

}





function getDisplayFieldNo(fieldNo) {
  if (!fieldNo || typeof fieldNo !== 'string') return '';
  const parts = fieldNo.split('_');
  return parts[parts.length - 1];
}

function getIndent(fieldNo) {
  if (!fieldNo || typeof fieldNo !== 'string') return 0;
  const depth = (fieldNo.match(/_/g) || []).length;
  return depth * 30;
}

function createCopyPopUp() {
  emit('create-copy');
}

function approvePopUp() {
  emit('approve');
}
function sendForApprovalPopUp(){
  emit('send-for-approval')
}

function downloadXML(){
  emit('download-xml')
}
function goBackToEdit(){
  router.push({ name: 'editing', query: { filing_id: props.filingId } });
}
function goToHome(){
  window.location='/home'
}

function get_table_header_name(header){
  if(header==='s.name'){
    return ''
  }
  else if(header==='s.text'){
    return ''
  }
  else{
    return header.replaceAll("_", " ");

  }

}
</script>

<style scoped>
.thick-border { border: 2px solid black; }
.pdf-viewer { height: 90vh; border: 1px solid #ccc; background: #f2f2f2; padding: 20px; overflow-y: scroll;}
.pdf-page {
  width: 1122px; max-width: 100%; box-sizing: border-box; padding: 40px;
  background: white; margin: auto; box-shadow: 0 0 8px rgba(0,0,0,0.15);
  font-family: 'Times New Roman', serif; line-height: 1.4;
}
.pdf-field { margin-bottom: 25px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
.field-number { font-weight: bold; font-size: 16px; }
.field-content {}
.line-item p { margin: 4px 0; }
.line-number { font-weight: bold; margin-right: 5px; }
.line-text { font-style: italic; margin-right: 5px; }
.page-break { page-break-before: always; }

.formatted-text {
  white-space: pre-wrap; /* preserves line breaks and wraps text */
  word-wrap: break-word; /* wraps long words instead of cutting off */
  font-family: 'Times New Roman', Times, serif !important;
  line-height: 1.4;
  font-size: 16px; 
  font-style: italic;

}
.fixed-table {
  table-layout: fixed; /* ensures equal width distribution or fixed widths */
  width: 100%;
}

.fixed-col {
  width: 150px; /* set your preferred width */
  word-wrap: break-word; /* wraps long text */
  text-overflow: ellipsis;
  overflow: break-word;
  white-space: normal; /* prevents wrapping if you prefer truncation */
}

</style>
