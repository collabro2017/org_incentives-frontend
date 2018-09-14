import {norwegianShortDate} from "../../../utils/utils";
import {ExcelSheetInput, generateOverviewSection, OverviewSectionParams} from "../../common/generate-overview-section";
import {ReportLine} from "../../ifrs-cost-spec/types";
import {
    getClosingBalance, getClosingBalance2,
    getExpired, getExpired2,
    getNewGrants, getNewGrants2,
    getOpeningBalance, getOpeningBalance2, getTerminated, getTerminated2,
} from "./common";
import {ExcelSheetAwardLine} from "../../../awards/award-reducer";
import {mobilitiesBeforeDate} from "../../common/utils";
import {entityAtDate} from "../../common/mobility-utils";

export const entitySocSecOverviewHeaders = (configParams: OverviewSectionParams): string[] => ([
    "ENTITY VIEW",
    "Opening Balance",
    "New Grants",
    "Expired",
    "Terminated",
    "Closing Balance",
]);

export const entitySocSecOverviewSubHeaders = (configParams: OverviewSectionParams): string[] => ([
    "",
    configParams.openingBalanceDate.format(norwegianShortDate),
    configParams.periodName,
    configParams.periodName,
    configParams.periodName,
    configParams.closingBalanceDate.format(norwegianShortDate),
]);

export const entityQuantityOverview = (lines: ExcelSheetAwardLine[], configParams: OverviewSectionParams): ExcelSheetInput => {
    const linesWithUpdatedEntity = lines.map(line => {
        const entity = entityAtDate(line.mobility, line.transaction_date);
        return { ...line, entity, entityName: entity.name };
    });

    return generateOverviewSection<ExcelSheetAwardLine>(
        configParams,
        entitySocSecOverviewHeaders,
        entitySocSecOverviewSubHeaders,
        (lines: ExcelSheetAwardLine[]) => entitySummaryToArray(transformToEntitySummary(configParams)(lines)),
        linesWithUpdatedEntity,
        (line: ExcelSheetAwardLine) => line.entity.id
    );
};

export interface EntitySummaryQuantityLine {
    entityName: string,
    openingBalance: number,
    newGrants: number,
    expired: number,
    terminated: number,
    closingBalance: number,
}

const transformToEntitySummary = (config: OverviewSectionParams) => (lines: ExcelSheetAwardLine[]): EntitySummaryQuantityLine => ({
    entityName: lines[0].entityName,
    openingBalance: getOpeningBalance2(lines, config),
    newGrants: getNewGrants2(lines, config),
    expired: getExpired2(lines, config),
    terminated: getTerminated2(lines, config),
    closingBalance: getClosingBalance2(lines, config),
});

const entitySummaryToArray = (line: EntitySummaryQuantityLine) => ([
    line.entityName,
    line.openingBalance,
    line.newGrants,
    line.expired,
    line.terminated,
    line.closingBalance,
]);
