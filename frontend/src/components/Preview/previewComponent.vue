<template>
  <div class="preview-shell">
    <header class="preview-topbar">
      <div class="title-row">
        <button type="button" class="back-btn" aria-label="Back to dashboard" @click="goToHome">
          <font-awesome-icon icon="arrow-left" />
        </button>
        <h1 class="filing-title">{{ filingName }}</h1>
      </div>

      <div class="actions">
        <button
          type="button"
          class="btn-outline"
          :disabled="downloadPDFPreview"
          @click="downloadPDF"
        >
          <span
            v-if="downloadPDFPreview"
            class="ui-spinner"
            role="status"
            aria-hidden="true"
          ></span>
          <template v-else>
            <font-awesome-icon icon="download" />
            PDF Preview Download
          </template>
        </button>

        <button
          type="button"
          class="btn-outline"
          :disabled="downloadInputFiles"
          @click="downloadInput"
        >
          <span
            v-if="downloadInputFiles"
            class="ui-spinner"
            role="status"
            aria-hidden="true"
          ></span>
          <template v-else>
            <font-awesome-icon icon="download" />
            Input Files
          </template>
        </button>

        <button type="button" class="btn-outline" @click="openMappedFiles">
          <font-awesome-icon icon="file" />
          Mapped Files
        </button>

        <button type="button" class="btn-outline" @click="openCompareSelector">
          <font-awesome-icon icon="code-compare" />
          Compare
        </button>

        <button
          v-if="status !== 'Approved'"
          type="button"
          class="btn-outline"
          @click="goBackToEdit"
        >
          <font-awesome-icon icon="pen" />
          Edit
        </button>

        <button
          v-if="role === 'approver' && status !== 'Approved'"
          type="button"
          class="btn-primary"
          @click="approvePopUp"
        >
          <font-awesome-icon icon="check-double" />
          Approve
        </button>

        <button
          v-if="status === 'Approved'"
          type="button"
          class="btn-primary"
          @click="downloadXML"
        >
          <font-awesome-icon icon="download" />
          XML
        </button>

        <button
          v-if="role === 'contributor' && status !== 'Approved' && status !== 'Review'"
          type="button"
          class="btn-primary"
          @click="sendForApprovalPopUp"
        >
          <font-awesome-icon icon="paper-plane" />
          Send For Approval
        </button>
      </div>
    </header>

    <compareSelectorPopUp
      v-if="openComparePopUp"
      :filingId="filingId"
      @close-click="openComparePopUp = false"
      @compare-selected="onCompareSelected"
    />

    <section class="viewer-shell">
      <div class="viewer-toolbar">
        <div class="viewer-label">PDF Preview</div>
        <div class="pager" aria-label="Page navigation">
          <button type="button" aria-label="First section" :disabled="currentPage <= 1" @click="goToPage(1)">
            <font-awesome-icon icon="angles-left" />
          </button>
          <button
            type="button"
            aria-label="Previous section"
            :disabled="currentPage <= 1"
            @click="goToPage(currentPage - 1)"
          >
            <font-awesome-icon icon="angle-left" />
          </button>
          <span>
            Section <strong>{{ currentPage }}</strong> of <strong>{{ totalPages }}</strong>
          </span>
          <button
            type="button"
            aria-label="Next section"
            :disabled="currentPage >= totalPages"
            @click="goToPage(currentPage + 1)"
          >
            <font-awesome-icon icon="angle-right" />
          </button>
          <button
            type="button"
            aria-label="Last section"
            :disabled="currentPage >= totalPages"
            @click="goToPage(totalPages)"
          >
            <font-awesome-icon icon="angles-right" />
          </button>
        </div>
      </div>

      <div class="viewer-body">
        <div class="pdf-page" ref="pdfContent" id="pdf-preview">
          <div
            v-for="(seriesData, fundKey, idx) in data"
            :key="fundKey"
            :class="['pdf-series', idx > 0 ? 'page-break' : '']"
            v-show="showAllPages || fundKey === currentFundKey"
          >
            <div class="pdf-tabs">
              <div class="tab">{{ fundKey }}</div>
              <div class="tab">{{ seriesSubtitle(seriesData) }}</div>
            </div>

            <div v-for="(fieldsGroup, heading) in groupByHeading(seriesData)" :key="heading">
              <h2 class="pdf-heading">{{ formatHeading(heading) }}</h2>
              <hr class="pdf-rule" />

              <div
                v-for="(fields, fieldIndex) in fieldsGroup"
                :key="fieldIndex"
                class="pdf-field"
                :style="{ marginLeft: getIndent(fields.field_no) + 'px' }"
              >
                <p class="field-number">
                  {{ getDisplayFieldNo(fields.field_no) }})
                  <span v-if="fields.has_field_item_text">
                    <pre v-if="fields.field_no == '14'" class="formatted-text">{{ defaultText }}</pre>
                    <span v-else class="line-text">{{ fields.field_text }}:</span>
                    <span class="line-value"><b>{{ formatValue(fields.value, fields.display_affix) }}</b></span>
                  </span>
                </p>

                <div
                  v-if="fields.has_table_data && fields.table_data?.length"
                  class="table-responsive my-2"
                >
                  <table class="table table-bordered table-sm thick-border fixed-table">
                    <thead>
                      <tr class="thick-border">
                        <template
                          v-for="(val, key, colIndex) in fields.table_data?.[0] || {}"
                          :key="colIndex"
                        >
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
                            :class="
                              !isNaN(
                                formatValue(val, fields.table_metadata?.[key]?.display_affix, key)
                                  .replace('$', '')[0]
                              )
                                ? 'number'
                                : ''
                            "
                          >
                            <span>{{ formatValue(val, fields.table_metadata?.[key]?.display_affix, key) }}</span>
                          </td>
                        </template>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <expandingTableComponent
                  v-if="fields.field_item_type == 'exp_table'"
                  :tableHeaders="fields.table_headers"
                  :value="fields.value"
                />

                <div v-if="fields.field_data?.length" class="field-content">
                  <span
                    v-for="(items, itemIndex) in fields.field_data"
                    :key="itemIndex"
                    class="line-item"
                  >
                    <p :style="{ marginLeft: getIndent(items.line_item_no) + 'px' }">
                      <span class="line-number field-number">{{ getDisplayFieldNo(items.line_item_no) }})</span>
                      <span class="line-text">{{ items.line_text }}:</span>
                      <span v-if="items.line_item_type !== 'table'" class="line-value">
                        <b>{{ formatValue(items.value, items.display_affix) }}</b>
                      </span>
                    </p>

                    <expandingTableComponent
                      v-if="items.line_item_type == 'exp_table'"
                      :tableHeaders="items.table_headers"
                      :value="items.value"
                    />
                  </span>
                </div>

                <div v-if="getDisplayFieldNo(fields.field_no) === '17' && hasField(seriesData, '18')">
                  <hr class="pdf-rule" />
                  <div class="pdf-tabs hedge-tabs">
                    <div class="tab">{{ fundKey }}</div>
                    <div class="tab">Information about the hedge funds you advise</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useEditableStore } from '@/stores/responseStore';
import { ref, nextTick, watch, computed } from 'vue';
import { useFileStore } from '@/stores/fileStore';
import { useRouter } from 'vue-router';
import jsPDF from 'jspdf';
import { defaultText } from '@/assets/text/text';
import html2canvas from 'html2canvas';
import { useToast } from 'vue-toast-notification';
import { useUserStore } from '@/stores/userStore';
import expandingTableComponent from './subComponent/expandingTableComponent.vue';
import compareSelectorPopUp from '@/components/popUps/compareSelectorPopUp.vue';
import { validateSectionA } from '@/assets/utils/sectionAValidation';
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
const downloadPDFPreview=ref(false)
const downloadInputFiles=ref(false)
const openComparePopUp=ref(false)

watch(() => responseStore.status, (v) =>{
 console.log('store.status changed ->', v)
 status.value=responseStore.getStatus()
}
)


const user_id=userStore.userID
const data = responseStore.getAllData();
const fileStore = useFileStore()
const filingName =
  fileStore.getfilingName() || localStorage.getItem('filingName') || 'Filing Preview'

const fundKeys = computed(() => Object.keys(data || {}))
const totalPages = computed(() => Math.max(1, fundKeys.value.length))
const currentPage = ref(1)
const showAllPages = ref(false)
const currentFundKey = computed(() => fundKeys.value[currentPage.value - 1] || fundKeys.value[0] || '')

function goToPage(page) {
  currentPage.value = Math.min(totalPages.value, Math.max(1, page))
}

function formatHeading(heading) {
  if (!heading) return ''
  const parts = String(heading).split(':')
  return (parts[1] || parts[0] || '').trim()
}

function seriesSubtitle(seriesData) {
  const firstNo = seriesData?.[0]?.field_no
  if (firstNo && getDisplayFieldNo(firstNo) === '18') {
    return 'Information about the hedge funds you advise'
  }
  return 'Information about the private fund you advise'
}

const pdfContent = ref(null);
const emit = defineEmits(['create-copy', 'approve','send-for-approval','download-xml','open-mapped-files']);
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
  try{
      toast.info("Generating Pdf....")
      downloadPDFPreview.value=true
      showAllPages.value = true
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
    catch (error) {
    // PDF generation can fail for non-API reasons (canvas/render)
    if (!error?.__toastShown) {
      toast.error('Failed to download pdf preview')
    }
  }
  finally{
    downloadPDFPreview.value=false
    showAllPages.value = false
  }
}

async function downloadInput(){
  try{
      downloadInputFiles.value=true 
      toast.info("Downloading Input files....")
      const filing_name=localStorage.getItem('filingName')
      const response=await api_call_methods.download_input(user_id,filing_name)
      utils.downloadInputZip(response, filing_name)
      toast.success("Input files downloaded successfully")
    }
  catch (error) {
      console.error(error)
    }
  finally{
      downloadInputFiles.value=false
    }
  

}



function hasField(seriesData, fieldNo) {
  return seriesData.some(
    f => getDisplayFieldNo(f.field_no) === fieldNo
  );
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
function getSectionAErrors() {
  return validateSectionA(data)
}

function showSectionAErrors(errors) {
  if (!errors.length) return false
  toast.error(errors[0])
  return true
}

function approvePopUp() {
  if (showSectionAErrors(getSectionAErrors())) return
  emit('approve');
}
function sendForApprovalPopUp(){
  if (showSectionAErrors(getSectionAErrors())) return
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
  else if (header=='costbased'){
    return "cost-based"
  }
  else if (/^level\d+$/.test(header)) {
    return header.replace(/level(\d+)/, 'level $1')
  }
  else{
    return header.replaceAll("_", " ");

  }

}

function formatValue(value,symbol,field='') {
  const num = Number(value);
  if(field=='Institution code')return value;
  // Not a number → return raw
  if (isNaN(num)) return value;
  if (num == 0) return value;

  if (symbol === 'Dollar') {
    const absolute_num=Math.abs(num)
    const formatted = absolute_num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
    return `$ ${formatted}`
  }

  if (symbol === 'Percentage') {
    return `${num} %`
  }
  return `${num}`
}
function openMappedFiles(){
  emit('open-mapped-files')
}
function openCompareSelector(){
  openComparePopUp.value=true
}
function onCompareSelected(relatedFiling){
  openComparePopUp.value=false
  router.push({
    name: 'compare',
    query: {
      filing_id_a: props.filingId,
      filing_id_b: relatedFiling.id,
      name_a: localStorage.getItem('filingName') || '',
      name_b: relatedFiling.filing_name || '',
    }
  })
}

</script>

<style scoped>
.preview-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  width: 100%;
  background: #eef1f6;
}

.preview-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 28px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.back-btn {
  background: none;
  border: none;
  color: #1f2937;
  cursor: pointer;
  display: inline-flex;
  padding: 4px;
  border-radius: 8px;
}

.back-btn:hover { background: #f3f4f6; }

.filing-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-outline,
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  padding: 9px 14px;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
}

.btn-outline {
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #1f2937;
}

.btn-outline:hover:not(:disabled) { background: #f9fafb; }
.btn-outline:disabled,
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ui-spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(30, 58, 138, 0.2);
  border-top-color: #1e3a8a;
  animation: ui-spin 0.7s linear infinite;
  display: inline-block;
  flex-shrink: 0;
}

@keyframes ui-spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-primary {
  background: #1e3a8a;
  border: 1px solid #1e3a8a;
  color: #fff;
}

.btn-primary:hover:not(:disabled) { background: #1e40af; }

.viewer-shell {
  flex: 1;
  min-height: 0;
  margin: 0 28px 24px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.viewer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.viewer-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
}

.pager {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.pager strong { color: #1f2937; }

.pager button {
  width: 30px;
  height: 30px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  color: #6b7280;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.pager button:hover:not(:disabled) {
  background: #f9fafb;
  color: #1f2937;
}

.pager button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.viewer-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: #e8ecf2;
  padding: 28px 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.pdf-page {
  width: min(900px, 100%);
  background: #fff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  padding: 36px 40px 48px;
  font-family: 'Times New Roman', Times, serif;
  color: #111;
  line-height: 1.45;
}

.pdf-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid #111;
  margin-bottom: 28px;
}

.pdf-tabs .tab {
  padding: 14px 16px;
  border-right: 1px solid #111;
  font-size: 1rem;
  font-weight: 700;
}

.pdf-tabs .tab:last-child { border-right: none; }

.pdf-heading {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 8px;
}

.pdf-rule {
  border: none;
  border-top: 2px solid #111;
  margin: 0 0 22px;
}

.pdf-field {
  margin-bottom: 18px;
  padding-bottom: 8px;
}

.field-number { font-size: 16px; margin-bottom: 6px; }
.line-item p { margin: 4px 0; }
.line-number { font-weight: bold; margin-right: 5px; }
.line-text { margin-right: 5px; }
.line-value { font-weight: 700; }
.page-break { page-break-before: always; }

.formatted-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Times New Roman', Times, serif !important;
  line-height: 1.4;
  font-size: 16px;
  font-style: italic;
}

.thick-border { border: 2px solid black; }
.fixed-table {
  table-layout: fixed;
  width: 100%;
}
.fixed-col {
  width: 150px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

.hedge-tabs { margin-top: 12px; }

@media (max-width: 900px) {
  .preview-topbar { padding: 14px 16px; }
  .viewer-shell { margin: 0 12px 16px; }
  .pdf-page { padding: 24px 18px 32px; }
  .pdf-tabs { grid-template-columns: 1fr; }
  .pdf-tabs .tab {
    border-right: none;
    border-bottom: 1px solid #111;
  }
  .pdf-tabs .tab:last-child { border-bottom: none; }
}
</style>
