
import { create } from 'xmlbuilder2';


function downloadXMLFile(xmlData) {
  const data = xmlData;
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


function downloadInputZip(zip_data,filing_name){
  const blob = new Blob([zip_data.data], { type: "application/zip" });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filing_name}.zip`;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export default {
  downloadXMLFile,
  downloadInputZip
}