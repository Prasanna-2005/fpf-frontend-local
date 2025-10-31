<template>
    <div class="content-box p-4">
        <span class="close-icon d-flex justify-content-end mt-1  " @click="deletePopUp"><font-awesome-icon class="icon me-2" icon="xmark" style="font-size: 1em;" /></span>


        <!-- delete user popup -->
        <div v-if="type=='deleteUser'" class="d-flex justify-content-center  align-item-center max-dimensions flex-column">
            <h4>Are you sure you want to delete  <strong>{{ userNameToBeDeleted }}</strong>?</h4>
            <button class="btn btn-danger me-2 mt-2 mb-2 w-100" @click="deleteUser(userIdToBeDeleted)">DELETE</button>
            
        </div>

        <!-- create copy popup  -->
        <div v-if="type=='createCopy'" class="p-4 max-dimensions ">
            <div class="d-flex justify-content-center  align-item-center max-dimensions flex-column">
                <h4><b>Create Copy</b></h4>
                
                
                <div class="mt-3">
                    <label for="copyName" class="form-label">Filing Name</label>
                    <input type="text" class="form-control border border-info" id="copyName" v-model="nameOfCopyfiling">
                </div>

                <div class="mt-3 d-flex justify-content-center max-dimension">
                    <button class="btn btn-primary me-2 mt-2 mb-2 w-100"  @click="createCopy">CREATE COPY</button>  
                </div>
            </div>

        </div>

        <!-- sign off popup-->
        <div v-if="type=='signOff'">
            <div class="d-flex justify-content-center  align-item-center max-dimensions flex-column">
                <h4><b>Filing sent for sign-off</b></h4>
                <button class="btn btn-primary me-2 mt-2 mb-2" @click="downloadPdf">DOWNLOAD PDF REPORT</button>
            </div>
        </div>

        <!-- approve filing popup  -->
        <div v-if="type=='approveFiling'" class="max-dimensions">
            <div class="d-flex justify-content-center  align-item-center max-dimensions flex-column">
                <div class="mb-4">
                <h4  >
                    <b v-if="!downloadXMl">Are you sure you want to approve this filing?</b>
                    <b v-else>Your Filing Has Been Approved. Download XML Below:</b>
                </h4>
                </div>
                 <button v-if="!downloadXMl" class="btn btn-primary " @click="approveFiling" :disabled="approving">
                    <span v-if="approving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <span v-if="!approving ">Approve filing</span>
                    <span v-else>Approving...</span>
                    
                </button>
                <button v-else  class="btn btn-primary" @click="downloadXMLFile">
                    <span>Download XML</span>
                </button>
            </div>
        </div>
        
    </div>
</template>
<script setup>
import {ref} from 'vue'
import api_call_methods from '@/assets/api_calls/api_calls'
import { useUserStore } from '@/stores/userStore'
import { create } from 'xmlbuilder2';

const emit=defineEmits(['removePopUp','filingName','downloadPdf','createCopy'])

const userStore=useUserStore()
const user_id=userStore.userID
const props=defineProps({
    type:{
        type:String,
        required:true,
    },
    userNameToBeDeleted:{
        type:String,
        required:true,
    },
    userIdToBeDeleted:{
        type:String,
        required:true,
    },
    defaultCopyName:{
        type:String,
        default:''
    },
    filingId:{
        type:String,
        required:true
    },

})
const approving=ref(false)
const downloadXMl=ref(false)
const dataForXML=ref({})
const nameOfCopyfiling=ref(props.defaultCopyName)
function deletePopUp(){
    emit('removePopUp')
}
function createCopy(){
    emit('createCopy',nameOfCopyfiling)
}
function downloadPdf(){
    emit('downloadPdf')
}
async function approveFiling(){
    try{
        approving.value=true
        const result=await api_call_methods.get_xml_data(user_id,props.filingId) 
        approving.value=false
        downloadXMl.value=true
        dataForXML.value=result.data
        // downloadXMLFile(result.data)    
    }
    catch(error){
        console.log(error)
        
    }
    

}
 
async function deleteUser(){
    console.log(props.userIdToBeDeleted)
    try{
        const result=await api_call_methods.delete_user(props.userIdToBeDeleted,
            user_id) 
        console.log(result)
    }
    catch(error) {
        console.log(error)
    }
}
function downloadXMLFile() {
  const data = dataForXML.value;
  const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('PFXMLFiling');

  // ---------- Section PFFund--------
  const section = root.ele('PFFunds');
  data.fund_info.forEach(fund => {
    const fundElem = section.ele('PFFunds');
    fundElem.ele('FundID').txt(fund.fund_id || '');
    fundElem.ele('FundName').txt(fund.fund_name || '');
    fundElem.ele('FundType').txt(fund.fund_type || '');
    fundElem.ele('CFTCFund').txt('N' || '');

  });
  // ---------- Section A----------
  const sectionA = root.ele('PFSection1bItemAFundsIdentInfo');
  data.tags_info.forEach(fundTags => {
    const fundElem = sectionA.ele('PFSection1bItemAFundIdentInfo');
    const fundId = fundTags.find(t => t.xmltags === 'FundID')?.value || fundTags.find(t => t.fund_id)?.fund_id || '';

    fundElem.ele('FundID').txt(fundId);

    const nfaFundID = fundTags.find(t => t.xmltags === 'NFAFundID')?.value
    const nfaFlag = fundTags.find(t => t.xmltags === 'NFAFundCFTCComplianceFlag')?.value || 'N';
    const isMaster = fundTags.find(t => t.xmltags === 'IsMasterFund')?.value || 'false';
    const isParallel = fundTags.find(t => t.xmltags === 'IsParallelFundsAggregated')?.value || 'false';
    
    if (nfaFundID) {
    fundElem.ele('NFAFundID').txt(nfaFundID);
    }
    fundElem.ele('NFAFundCFTCComplianceFlag').txt(nfaFlag);
    fundElem.ele('IsMasterFund').txt(isMaster);
    fundElem.ele('IsParallelFundsAggregated').txt(isParallel);
  });


  // ---------- Section B ----------
  const sectionB = root.ele('PFSection1bItemBFundsAssetsFinancingInvestors');
  data.tags_info.forEach(fundTags => {
    const fundElem = sectionB.ele('PFSection1bItemBFundAssetsFinancingInvestors');
    const fundId = fundTags.find(t => t.fund_id)?.fund_id || '';

    fundElem.ele('FundID').txt(fundId);

    // Add all tags that are NOT quarterly (i.e., not part of Section C)
    fundTags.forEach(tag => {
      const tagName = tag.xmltags;
      if (
        !/Quarter\d+/.test(tagName) && // exclude Quarter fields
        tagName !== 'FundID' &&
        tagName !== 'FundName' &&
        tagName !== 'NFAFundID' &&
        tagName !== 'NFAFundCFTCComplianceFlag' &&
        tagName !== 'IsMasterFund' &&
        tagName !== 'IsParallelFundsAggregated'


      ) {
        fundElem.ele(tagName).txt(tag.value ?? '');
      }
    });
  });

  // ---------- Section C: Fund Performance ----------
  const sectionC = root.ele('PFSection1bItemCFundsPerformance');
  data.tags_info.forEach(fundTags => {
    const perfElem = sectionC.ele('PFSection1bItemCFundPerformance');
    const fundId = fundTags.find(t => t.fund_id)?.fund_id || '';
    if (fundId) perfElem.ele('FundID').txt(fundId);

    // Group by quarter
    const quarters = [1, 2, 3, 4];
    quarters.forEach(q => {
      const lastDate = fundTags.find(t => t.xmltags === `LastFiscalDateQuarter${q}`);
      const gross = fundTags.find(t => t.xmltags === `GrossValueQuarter${q}`);
      const net = fundTags.find(t => t.xmltags === `NetValueQuarter${q}`);

      if (lastDate) {
        const el = perfElem.ele(`LastFiscalDateQuarter${q}`);
        el.ele('Value').txt(lastDate.value || '');
      }
      if (gross) {
        const el = perfElem.ele(`GrossValueQuarter${q}`);
        el.ele('Value').txt(gross.value || '');
      }
      if (net) {
        const el = perfElem.ele(`NetValueQuarter${q}`);
        el.ele('Value').txt(net.value || '');
      }
    });
  });

  // ---------- Finalize and Download ----------
  const xmlString = root.end({ prettyPrint: true });
  const blob = new Blob([xmlString], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fund_data.xml';
  a.click();
  URL.revokeObjectURL(url);
}




</script>

<style >
.content-box {
  background: white;
  border-radius: 8px;
  border: 2px solid greenyellow;
  width:350px ;
  height: 250px;
  max-width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}
</style>