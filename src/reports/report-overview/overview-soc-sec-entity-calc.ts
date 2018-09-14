import {PrintableSocSecLine, SocSecLine} from "../social-security/types";
import {printNumber} from "../reports";
import {Moment} from "moment";
import {norwegianShortDate} from "../../utils/utils";
import {groupBy, GroupByProperty, GroupedByLines} from "../common/utils";
import {ExcelSheetInput, generateOverviewSection, OverviewSectionParams} from "../common/generate-overview-section";

export const entitySocSecOverviewHeaders = (configParams: OverviewSectionParams): string[] => ([
    "ENTITY VIEW",
    "Opening Balance",
    "Period Provision",
    "Closing Balance",
]);

export const entitySocSecOverviewSubHeaders = (configParams: OverviewSectionParams): string[] => ([
    "",
    configParams.openingBalanceDate.format(norwegianShortDate),
    configParams.periodName,
    configParams.closingBalanceDate.format(norwegianShortDate),
]);

export const socSecEntityOverview = (socSecLines: SocSecLine[], configParams: OverviewSectionParams): ExcelSheetInput => {
    return generateOverviewSection<SocSecLine>(
        configParams,
        entitySocSecOverviewHeaders,
        entitySocSecOverviewSubHeaders,
        (lines: SocSecLine[]) => entitySummaryToArray(transformToEntitySummary(lines)),
        socSecLines,
        (line: SocSecLine) => line.entityId
    );
};

export interface EntitySummarySocSecLine {
    entityName: string,
    openingBalance: number,
    periodProvision: number,
    closingBalance: number,
}

const transformToEntitySummary = (lines: SocSecLine[]): EntitySummarySocSecLine => ({
    entityName: lines[0].entityName,
    openingBalance: sum(lines, 'costOBIncTurnover'),
    periodProvision: sum(lines, 'periodCostIncTurnover'),
    closingBalance: sum(lines, 'costCBIncTurnover'),
});

const sum = (lines: any[], property: string): number => lines.reduce((accu, current) => {
    const number = current[property] || 0;
    return number + accu;
}, 0);

const entitySummaryToArray = (line: EntitySummarySocSecLine) => ([
    line.entityName,
    line.openingBalance,
    line.periodProvision,
    line.closingBalance,
]);
