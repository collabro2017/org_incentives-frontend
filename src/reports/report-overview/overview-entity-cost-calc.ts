import {ReportLine} from "../ifrs-cost-spec/types";
import {ExcelSheetInput, generateOverviewSection, OverviewSectionParams} from "../common/generate-overview-section";
import {norwegianShortDate} from "../../utils/utils";

export const costSpecEntityOverview = (reportLines: ReportLine[], configParams: OverviewSectionParams): ExcelSheetInput => {
    return generateOverviewSection<ReportLine>(
        configParams,
        entityOverviewHeaders,
        entityOverviewSubHeaders,
        (lines: ReportLine[]) => toArray(transformToSummary(configParams)(lines)),
        reportLines,
        (line: ReportLine) => line.entity.id
    );
};

const entityOverviewHeaders = () => ([
    "ENTITY VIEW",
    "Opening Balance",
    "Period Cost",
    "Closing Balance",
    "Unamortized"
]);

const entityOverviewSubHeaders = (configParams: OverviewSectionParams) => ([
    "",
    configParams.openingBalanceDate.format(norwegianShortDate),
    configParams.periodName,
    configParams.closingBalanceDate.format(norwegianShortDate),
    "Rest of lifetime"
]);

const transformToSummary = (config: OverviewSectionParams) => (lines: ReportLine[]): SummaryCostLine => ({
    entityName: lines[0].entityName,
    openingBalance: sum(lines, 'costOBIncTurnover'),
    periodCost: sum(lines, 'periodCostIncTurnover'),
    closingBalance: sum(lines, 'costCBIncTurnover'),
    unamortized: sum(lines, 'costUnamortizedIncTurnover'),
});

export interface SummaryCostLine {
    entityName: string,
    openingBalance: number,
    periodCost: number,
    closingBalance: number,
    unamortized: number,
}

const toArray = (line: SummaryCostLine) => ([
    line.entityName,
    line.openingBalance,
    line.periodCost,
    line.closingBalance,
    line.unamortized
]);

const sum = (lines: ReportLine[], property: string): number => lines.reduce((accu, current) => {
    const number = current[property] || 0;
    return number + accu;
}, 0);
