
import { create } from 'xmlbuilder2';


function downloadXMLFile(xmlData) {
  const data = xmlData;
  const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('PFXMLFiling');



  // -------------------------------------------------------------
  // ---------------- SECTION 1A item A --------
  // -------------------------------------------------------------

  if (data.tags_info_sec1a && data.tags_info_sec1a.length) {

  const sec1aTags = data.tags_info_sec1a[0]; // 👈 important

  const get1a = tag =>
    sec1aTags.find(t => t.xmltags === tag)?.value || "";

  // ---------------- Identification Info ----------------
  const section1aIdent = root.ele("PFSection1aItemAIdentInfo");

  section1aIdent.ele("NFAFirmID").txt(get1a("NFAFirmID"));
  section1aIdent.ele("LargeTraderID").txt(get1a("LargeTraderID"));
  section1aIdent.ele("LargeTraderIDSuffix").txt(get1a("LargeTraderIDSuffix"));

  // ---------------- Signature Section ----------------
  const section1aSignature = root.ele("PFSection1aItemASignatureFirmAndRelatedPersons");

  section1aSignature.ele("IndividualName").txt(get1a("IndividualName"));
  section1aSignature.ele("Signature").txt(get1a("Signature"));
  section1aSignature.ele("Title").txt(get1a("Title"));
  section1aSignature.ele("EmailAddress").txt(get1a("EmailAddress"));
  section1aSignature.ele("TelephoneNumber").txt(get1a("TelephoneNumber"));
  section1aSignature.ele("SignatureDate").txt(get1a("SignatureDate"));
  }

  //--------------------------Section 1A item B---------------


  if (data.tags_info_sec1a && data.tags_info_sec1a.length) {

    const sec1aTags = data.tags_info_sec1a[0];

    
    const itemBTags = sec1aTags.filter(t => t.qno === "3");

    if (itemBTags.length) {

      const section1aItemB = root.ele("PFSection1aItemBFilersAssetsByFundType");
      const assetsFunds = section1aItemB.ele("AssetsFunds");

      
      const getBaseKey = (qSubno) => {
       
        const match = qSubno?.match(/^3_\([a-z]\)/i);
        return match ? match[0] : qSubno;
      };

      const grouped = {};

      itemBTags.forEach(tag => {

        if (!tag.qSubno || !tag.xmltags) return;

        const baseKey = getBaseKey(tag.qSubno);

        if (!grouped[baseKey]) {
          grouped[baseKey] = [];
        }

        grouped[baseKey].push(tag);
      });


      const getVal = (group, tagName) =>
        group
          .find(t => t.xmltags?.trim() === tagName)
          ?.value
          ?.replace(/^"+|"+$/g, "") || "";

      Object.values(grouped).forEach(group => {

        const fundData = assetsFunds.ele("FilersAssetsFundData");

        const fundType = getVal(group, "FundType");
        const regAssets = getVal(group, "RegulatoryAssetsFunds");
        const netAssets = getVal(group, "NetAssetsFunds");

        fundData.ele("FundType").txt(fundType);
        fundData.ele("RegulatoryAssetsFunds").txt(regAssets);
        fundData.ele("NetAssetsFunds").txt(netAssets);
      });
    }
  }



//----------------Section 1a item C--------------

  if (data.tags_info_sec1a && data.tags_info_sec1a.length) {

    const sec1aTags = data.tags_info_sec1a[0];

    // Filter qno 4 
    const itemCTags = sec1aTags.filter(t => t.qno === "4");

    if (itemCTags.length) {

      const section1aItemC = root.ele("PFSection1aItemCMiscellaneousItems");

     
      const grouped = {};

      itemCTags.forEach(tag => {
        if (!grouped[tag.qSubno]) {
          grouped[tag.qSubno] = [];
        }
        grouped[tag.qSubno].push(tag);
      });

      Object.values(grouped).forEach(group => {

        const miscElem = section1aItemC.ele("PFSection1aItemCMiscellaneous");

        
        const cleanTag = (tagName) =>
          tagName?.replace(/[()]/g, "").trim();

        const questionNumber = group.find(t =>
          cleanTag(t.xmltags) === "QuestionNumber"
        )?.value || "";

        const description = group.find(t =>
          cleanTag(t.xmltags) === "Description"
        )?.value || "";

        
        const sanitize = (val) =>
          val?.replace(/^"+|"+$/g, "") || "";

        miscElem.ele("QuestionNumber").txt(sanitize(questionNumber));
        miscElem.ele("Description").txt(sanitize(description));
      });
    }
  }

  // ---------- Section PFFund--------
  const section = root.ele('PFFunds');
  data.fund_info.forEach(fund => {
    const fundElem = section.ele('PFFunds');
    fundElem.ele('FundID').txt(fund.fund_id || '');
    fundElem.ele('FundName').txt(fund.fund_name || '');
    fundElem.ele('FundType').txt(fund.fund_type || '');
    fundElem.ele('CFTCFund').txt('N');
  });


  //------------Section 1b---------
  // ---------- Item A----------
  const sectionA = root.ele('PFSection1bItemAFundsIdentInfo');
  data.tags_info_sec1b.forEach(fundTags => {
    const fundElem = sectionA.ele('PFSection1bItemAFundIdentInfo');
    const fundId = fundTags.find(t => t.xmltags === 'FundID')?.value 
                || fundTags.find(t => t.fund_id)?.fund_id 
                || '';

    fundElem.ele('FundID').txt(fundId);

    const nfaFundID = fundTags.find(t => t.xmltags === 'NFAFundID')?.value;
    const nfaFlag = fundTags.find(t => t.xmltags === 'NFAFundCFTCComplianceFlag')?.value || 'N';
    const isMaster = fundTags.find(t => t.xmltags === 'IsMasterFund')?.value || 'false';
    const isParallel = fundTags.find(t => t.xmltags === 'IsParallelFundsAggregated')?.value || 'false';

    if (nfaFundID) fundElem.ele('NFAFundID').txt(nfaFundID);
    fundElem.ele('NFAFundCFTCComplianceFlag').txt(nfaFlag);
    fundElem.ele('IsMasterFund').txt(isMaster);
    fundElem.ele('IsParallelFundsAggregated').txt(isParallel);
  });

  // ---------- Item B ----------
  const sectionB = root.ele('PFSection1bItemBFundsAssetsFinancingInvestors');
  data.tags_info_sec1b.forEach(fundTags => {
    const fundElem = sectionB.ele('PFSection1bItemBFundAssetsFinancingInvestors');
    const fundId = fundTags.find(t => t.fund_id)?.fund_id || '';

    fundElem.ele('FundID').txt(fundId);

    fundTags.forEach(tag => {
      const name = tag.xmltags;

      if (
        !/Quarter\d+/.test(name) && !/Month\d+/.test(name) && ! /Year$/.test(name) &&
        !['FundID', 'FundName', 'NFAFundID', 'NFAFundCFTCComplianceFlag', 'IsMasterFund', 'IsParallelFundsAggregated']
          .includes(name)
      ) {
        fundElem.ele(name).txt(tag.value ?? '');
      }
    });
  });

  // ---------- Item C ----------
  const sectionC = root.ele('PFSection1bItemCFundsPerformance');
  data.tags_info_sec1b.forEach(fundTags => {
    const perfElem = sectionC.ele('PFSection1bItemCFundPerformance');
    const fundId = fundTags.find(t => t.fund_id)?.fund_id || '';
    if (fundId) perfElem.ele('FundID').txt(fundId);
    //Quarter
    [1, 2, 3, 4].forEach(q => {
      const lastDate = fundTags.find(t => t.xmltags === `LastFiscalDateQuarter${q}`);
      const gross = fundTags.find(t => t.xmltags === `GrossValueQuarter${q}`);
      const net = fundTags.find(t => t.xmltags === `NetValueQuarter${q}`);

      if (lastDate) perfElem.ele(`LastFiscalDateQuarter${q}`).ele('Value').txt(lastDate.value || '');
      if (gross) perfElem.ele(`GrossValueQuarter${q}`).ele('Value').txt(gross.value || '');
      if (net) perfElem.ele(`NetValueQuarter${q}`).ele('Value').txt(net.value || '');
    });

    //Month
    for (let m = 1; m <= 12; m++) {
    const lastDateM = fundTags.find(t => t.xmltags === `LastFiscalDateMonth${m}`);
    const grossM = fundTags.find(t => t.xmltags === `GrossValueMonth${m}`);
    const netM = fundTags.find(t => t.xmltags === `NetValueMonth${m}`);

    if (lastDateM) perfElem.ele(`LastFiscalDateMonth${m}`).ele('Value').txt(lastDateM.value || '');
    if (grossM) perfElem.ele(`GrossValueMonth${m}`).ele('Value').txt(grossM.value || '');
    if (netM) perfElem.ele(`NetValueMonth${m}`).ele('Value').txt(netM.value || '');
  }

    //Year
    const lastDateY = fundTags.find(t => t.xmltags === 'LastFiscalDateYear');
    const grossY    = fundTags.find(t => t.xmltags === 'GrossValueYear');
    const netY      = fundTags.find(t => t.xmltags === 'NetValueYear');

    if (lastDateY) perfElem.ele('LastFiscalDateYear').ele('Value').txt(lastDateY.value || '');
    if (grossY)    perfElem.ele('GrossValueYear').ele('Value').txt(grossY.value || '');
    if (netY)      perfElem.ele('NetValueYear').ele('Value').txt(netY.value || '');   

    
  });

  // -------------------------------------------------------------
  // ---------------- SECTION 1C (NEW) ----------------------------
  // -------------------------------------------------------------
  const section1C = root.ele("PFSection1cItemBHedgeFundsInfo");

  data.tag_info_sec1c.forEach(fundTags => {
    const fundElem = section1C.ele("PFSection1cItemBHedgeFundInfo");

    const get = tag => fundTags.find(t => t.xmltags === tag)?.value || "";

    // Basic fields
    fundElem.ele("FundID").txt(get("FundID"));
    fundElem.ele("StrategyTypeSM").txt(get("StrategyTypeSM"));
    fundElem.ele("StrategyHighFrequencyTradingPercent").txt(get("StrategyHighFrequencyTradingPercent") || "");

    // Percent wrapper fields
    const percentFields = [
      "SecuritiesTradedOTCPercent",
      "SecuritiesTradedExchangePercent",
      "DerivativesTradedOTCPercent",
      "DerivativesTradedExchangePercent",
      "DerivativesTradedCCPClearedPercent",
      "DerivativesTradedNotCCPClearedPercent",
      "RepoTradedCCPClearedPercent",
      "RepoTradedNotCCPClearedPercent",
      "RepoTradedTriPartyRepoPercent"
    ];

    percentFields.forEach(field => {
      const wrapper = fundElem.ele(field);
      wrapper.ele("Value").txt(get(field) || '');
    });

    // OtherTransactionPercent
    fundElem.ele("OtherTransactionPercent").txt(get("OtherTransactionPercent") || '');

    // ------------------- Strategies -------------------
    const strategiesElem = fundElem.ele("Strategies");

    const strategyType = get("StrategyType");
    const strategyChecked = get("StrategyChecked");
    const strategyNAV = get("StrategyNAVPercent");

    const strategyEntry = strategiesElem.ele("PFSection1cItemBHedgeFundInfoStrategy");
    strategyEntry.ele("StrategyType").txt(strategyType);
    strategyEntry.ele("StrategyChecked").txt(strategyChecked);
    strategyEntry.ele("StrategyNAVPercent").txt(strategyNAV);

    // ------------------- Counterparties (Dollar + Percent) -------------------
    function addCounterpartyBlock(type, items) {
      const container = fundElem.ele(type);

      items.forEach(cp => {
        const cpElem = container.ele("PFSection1cItemBHedgeFundInfoCounterParty");

        cpElem.ele("CounterpartyType").txt(cp.type);
        cpElem.ele("CounterpartyLegalName").txt(cp.legal);
        cpElem.ele("CounterpartyAffiliatedInstitutionCode").txt(cp.code);
        cpElem.ele("CounterpartyAffiliatedInstitutionOtherName").txt(cp.other);

        const exp = cpElem.ele("CounterpartyExposure");
        exp.ele("Value").txt(cp.exposure);
      });
    }

    // Build Dollar CounterParties list
    const dollarItems = [];
    const percentItems = [];

    // Grouping CounterParty records
    const cpGroups = [];
    let temp = [];
    fundTags
      .filter(t => t.xmltags.startsWith("Counterparty"))
      .forEach(t => {
        temp.push(t);
        if (temp.length === 4) {
          cpGroups.push(temp);
          temp = [];
        }
      });

    // Build structured groups
    cpGroups.forEach(g => {
      const qno = g[0]?.qno;    

      const cpType = qno === "23" ? "Dollar" : "Percent";

      const entry = {
        type: g.find(t => t.xmltags === "CounterpartyType")?.value || cpType,
        legal: g.find(t => t.xmltags === "CounterpartyLegalName")?.value || '',
        code: g.find(t => t.xmltags === "CounterpartyAffiliatedInstitutionCode")?.value || '',
        other: g.find(t => t.xmltags === "CounterpartyAffiliatedInstitutionOtherName")?.value || '',
        exposure: g.find(t => t.xmltags === "CounterpartyExposure")?.value || ''
      };

      if (entry.type === "Dollar") dollarItems.push(entry);
      else percentItems.push(entry);
    });

    addCounterpartyBlock("CounterPartiesDollar", dollarItems);
    addCounterpartyBlock("CounterPartiesPercent", percentItems);
  });

  // ---------- Finalize ----------
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