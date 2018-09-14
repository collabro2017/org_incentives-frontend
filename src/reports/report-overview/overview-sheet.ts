import {Moment} from "moment";
import XLSX, {SheetAOAOpts} from "xlsx";
import {costHeaders, toCostSpecDataLine} from "../ifrs-cost-spec/cost-spec-report-table";
import {PrintableSocSecLine, SocSecLine} from "../social-security/types";
import {PrintableReportLine, ReportLine} from "../ifrs-cost-spec/types";
import {changePunctuationForComma, formatCurrency, norwegianShortDate} from "../../utils/utils";
import {costSpecEntityOverview} from "./overview-entity-cost-calc";
import {costSpecProgramOverview} from "./overview-program-cost-calc";
import {socSecProgramOverview} from "./overview-soc-sec-program-calc";
import {socSecEntityOverview} from "./overview-soc-sec-entity-calc";
import {programQuantityOverview} from "./quantity/overview-quantity-program-calc";
import {entityQuantityOverview} from "./quantity/overview-quantity-entity-calc";
import {ExcelSheetAwardLine} from "../../awards/award-reducer";

const mainHeader = (obDate: Moment, periodName: string, cbDate: Moment, sharePriceOB: number, sharePriceCB: number, companyName: string): string[][] => ([
    ["Optio Report"],
    ["Company", companyName],
    ["Period", periodName],
    [`Share Price OB (${obDate.format(norwegianShortDate)})`, changePunctuationForComma(sharePriceOB.toString())],
    [`Share Price CB (${cbDate.format(norwegianShortDate)})`, changePunctuationForComma(sharePriceCB.toString())]
]);

const overviewSheet = (awards: ExcelSheetAwardLine[], costLines: ReportLine[], socSecLines: SocSecLine[], openingBalanceDate: Moment, closingBalanceDate: Moment, periodName: string, sharePriceOB: number, sharePriceCB: number, companyName: string) => {
    const configParams = {
        openingBalanceDate,
        closingBalanceDate,
        periodName,
    };

    const entityCostData = costSpecEntityOverview(costLines, configParams);
    const programCostData = costSpecProgramOverview(costLines, configParams);
    const entitySocSecData = socSecEntityOverview(socSecLines, configParams);
    const programSocSecData = socSecProgramOverview(socSecLines, configParams);
    const programQuantityData = programQuantityOverview(awards, configParams);
    const entityQuantityData = entityQuantityOverview(awards, configParams);

    const data: Array<Array<string | number>> = [
        ...mainHeader(openingBalanceDate, periodName, closingBalanceDate, sharePriceOB, sharePriceCB, companyName),
        ["IFRS Cost"],
        ...divider(1),
        ...entityCostData,
        ...divider(3),
        ...programCostData,
        ...divider(3),
        ["Soc-Sec Provision"],
        ...divider(1),
        ...entitySocSecData,
        ...divider(3),
        ...programSocSecData,
        ...divider(3),
        ["Instrument Overview"],
        ...divider(1),
        ...entityQuantityData,
        ...divider(3),
        ...programQuantityData,
    ];

    const workSheet = XLSX.utils.aoa_to_sheet(data);
    // XLSX.utils.sheet_add_aoa(workSheet, entityQuantityData, { origin: "Q8" });
    // XLSX.utils.sheet_add_aoa(workSheet, programQuantityData, { origin: "Q8" });
    return workSheet;
};

const divider = (numberOfRows: number): string[][] => Array(numberOfRows).fill([]);

export default overviewSheet;
