
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
        !/Quarter\d+/.test(name) &&
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

    [1, 2, 3, 4].forEach(q => {
      const lastDate = fundTags.find(t => t.xmltags === `LastFiscalDateQuarter${q}`);
      const gross = fundTags.find(t => t.xmltags === `GrossValueQuarter${q}`);
      const net = fundTags.find(t => t.xmltags === `NetValueQuarter${q}`);

      if (lastDate) perfElem.ele(`LastFiscalDateQuarter${q}`).ele('Value').txt(lastDate.value || '');
      if (gross) perfElem.ele(`GrossValueQuarter${q}`).ele('Value').txt(gross.value || '');
      if (net) perfElem.ele(`NetValueQuarter${q}`).ele('Value').txt(net.value || '');
    });
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
    fundElem.ele("StrategyHighFrequencyTradingPercent").txt(get("StrategyHighFrequencyTradingPercent") || "0");

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
      wrapper.ele("Value").txt(get(field) || "0");
    });

    // OtherTransactionPercent
    fundElem.ele("OtherTransactionPercent").txt(get("OtherTransactionPercent") || "0");

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
        if (temp.length === 3) {
          cpGroups.push(temp);
          temp = [];
        }
      });

    // Build structured groups
    cpGroups.forEach(g => {
      const entry = {
        type: g.find(t => t.xmltags === "CounterpartyType")?.value || "Dollar",
        legal: g.find(t => t.xmltags === "CounterpartyLegalName")?.value || "NA",
        code: g.find(t => t.xmltags === "CounterpartyAffiliatedInstitutionCode")?.value || "32",
        other: g.find(t => t.xmltags === "CounterpartyAffiliatedInstitutionOtherName")?.value || "NA",
        exposure: g.find(t => t.xmltags === "CounterpartyExposure")?.value || "NA"
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