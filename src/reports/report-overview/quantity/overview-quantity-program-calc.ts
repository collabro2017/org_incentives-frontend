import {norwegianShortDate} from "../../../utils/utils";
import {ExcelSheetInput, generateOverviewSection, OverviewSectionParams} from "../../common/generate-overview-section";
import {ReportLine} from "../../ifrs-cost-spec/types";
import {
    getClosingBalance, getClosingBalance2, getExpired, getExpired2,
    getNewGrants, getNewGrants2,
    getOpeningBalance, getOpeningBalance2,
    getTerminated, getTerminated2,
} from "./common";
import {ExcelSheetAwardLine} from "../../../awards/award-reducer";

export const programSocSecOverviewHeaders = (configParams: OverviewSectionParams): string[] => ([
    "PROGRAM VIEW",
    "Opening Balance",
    "New Grants",
    "Expired",
    "Terminated",
    "Closing Balance",
]);

export const programSocSecOverviewSubHeaders = (configParams: OverviewSectionParams): string[] => ([
    "",
    configParams.openingBalanceDate.format(norwegianShortDate),
    configParams.periodName,
    configParams.periodName,
    configParams.periodName,
    configParams.closingBalanceDate.format(norwegianShortDate),
]);

export const programQuantityOverview = (ReportLines: ExcelSheetAwardLine[], configParams: OverviewSectionParams): ExcelSheetInput => {
    return generateOverviewSection<ExcelSheetAwardLine>(
        configParams,
        programSocSecOverviewHeaders,
        programSocSecOverviewSubHeaders,
        (lines: ExcelSheetAwardLine[]) => programSummaryToArray(transformToProgramSummary(configParams)(lines)),
        ReportLines,
        (line: ExcelSheetAwardLine) => line.programId
    );
};

export interface ProgramSummaryQuantityLine {
    programName: string,
    openingBalance: number,
    newGrants: number,
    expired: number,
    terminated: number,
    closingBalance: number,
}

const transformToProgramSummary = (config: OverviewSectionParams) => (lines: ExcelSheetAwardLine[]): ProgramSummaryQuantityLine => ({
    programName: lines[0].programName,
    openingBalance: getOpeningBalance2(lines, config),
    newGrants: getNewGrants2(lines, config),
    expired: getExpired2(lines, config),
    terminated: getTerminated2(lines, config),
    closingBalance: getClosingBalance2(lines, config),
});

const sum = (lines: any[], property: string): number => lines.reduce((accu, current) => {
    const number = current[property] || 0;
    return number + accu;
}, 0);

const programSummaryToArray = (line: ProgramSummaryQuantityLine) => ([
    line.programName,
    line.openingBalance,
    line.newGrants,
    line.expired,
    line.terminated,
    line.closingBalance,
]);
