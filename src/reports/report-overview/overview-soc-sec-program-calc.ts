import {PrintableSocSecLine, SocSecLine} from "../social-security/types";
import {printNumber} from "../reports";
import {Moment} from "moment";
import {norwegianShortDate} from "../../utils/utils";
import {groupBy, GroupByProperty, GroupedByLines} from "../common/utils";
import {ExcelSheetInput, generateOverviewSection, OverviewSectionParams} from "../common/generate-overview-section";

export const programSocSecOverviewHeaders = (configParams: OverviewSectionParams): string[] => ([
    "PROGRAM VIEW",
    "Opening Balance",
    "Period Provision",
    "Closing Balance",
]);

export const programSocSecOverviewSubHeaders = (configParams: OverviewSectionParams): string[] => ([
    "",
    configParams.openingBalanceDate.format(norwegianShortDate),
    configParams.periodName,
    configParams.closingBalanceDate.format(norwegianShortDate),
]);

export const socSecProgramOverview = (socSecLines: SocSecLine[], configParams: OverviewSectionParams): ExcelSheetInput => {
    return generateOverviewSection<SocSecLine>(
        configParams,
        programSocSecOverviewHeaders,
        programSocSecOverviewSubHeaders,
        (lines: SocSecLine[]) => programSummaryToArray(transformToProgramSummary(lines)),
        socSecLines,
        (line: SocSecLine) => line.programId
    );
};

export interface ProgramSummarySocSecLine {
    programName: string,
    openingBalance: number,
    periodProvision: number,
    closingBalance: number,
}

const transformToProgramSummary = (lines: SocSecLine[]): ProgramSummarySocSecLine => ({
    programName: lines[0].programName,
    openingBalance: sum(lines, 'costOBIncTurnover'),
    periodProvision: sum(lines, 'periodCostIncTurnover'),
    closingBalance: sum(lines, 'costCBIncTurnover'),
});

const sum = (lines: any[], property: string): number => lines.reduce((accu, current) => {
    const number = current[property] || 0;
    return number + accu;
}, 0);

const programSummaryToArray = (line: ProgramSummarySocSecLine) => ([
    line.programName,
    line.openingBalance,
    line.periodProvision,
    line.closingBalance,
]);
