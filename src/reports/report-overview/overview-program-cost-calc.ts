import {ReportLine} from "../ifrs-cost-spec/types";
import {ExcelSheetInput, generateOverviewSection, OverviewSectionParams} from "../common/generate-overview-section";
import {norwegianShortDate} from "../../utils/utils";

export const costSpecProgramOverview = (reportLines: ReportLine[], configParams: OverviewSectionParams): ExcelSheetInput => {
    return generateOverviewSection<ReportLine>(
        configParams,
        programOverviewHeaders,
        programOverviewSubHeaders,
        (lines: ReportLine[]) => toArray(transformToSummary(configParams)(lines)),
        reportLines,
        (line: ReportLine) => line.programId
    );
};

const programOverviewHeaders = () => ([
    "PROGRAM VIEW",
    "Opening Balance",
    "Period Cost",
    "Closing Balance",
    "Unamortized"
]);

const programOverviewSubHeaders = (config: OverviewSectionParams) => ([
    "",
    config.openingBalanceDate.format(norwegianShortDate),
    config.periodName,
    config.closingBalanceDate.format(norwegianShortDate),
    "Rest of lifetime"
]);

const transformToSummary = (config: OverviewSectionParams) => (lines: ReportLine[]): ProgramSummaryCostLine => ({
    programName: lines[0].planName,
    openingBalance: sum(lines, 'costOBIncTurnover'),
    periodCost: sum(lines, 'periodCostIncTurnover'),
    closingBalance: sum(lines, 'costCBIncTurnover'),
    unamortized: sum(lines, 'costUnamortizedIncTurnover'),
});


interface ProgramSummaryCostLine {
    programName: string,
    openingBalance: number,
    periodCost: number,
    closingBalance: number,
    unamortized: number,
}

const toArray = (line: ProgramSummaryCostLine) => ([
    line.programName,
    line.openingBalance,
    line.periodCost,
    line.closingBalance,
    line.unamortized
]);

const sum = (lines: ReportLine[], property: string): number => lines.reduce((accu, current) => {
    const number = current[property] || 0;
    return number + accu;
}, 0);
