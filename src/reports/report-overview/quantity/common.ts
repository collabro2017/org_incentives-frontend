import {TransactionType} from "../../reports";
import {OverviewSectionParams} from "../../common/generate-overview-section";
import {ReportLine} from "../../ifrs-cost-spec/types";
import {ExcelSheetAwardLine} from "../../../awards/award-reducer";

export const keepGrantsInPeriod = (config: OverviewSectionParams) =>
    (line: ReportLine) =>
        line.transactionType === TransactionType.GRANT &&
        line.grantDate &&
        line.grantDate.isBetween(config.openingBalanceDate, config.closingBalanceDate, null, "[]");

export const keepGrantsInPeriod2 = (config: OverviewSectionParams) =>
    (line: ExcelSheetAwardLine) =>
        line.transaction_type === TransactionType.GRANT &&
        line.grantDate &&
        line.grantDate.isBetween(config.openingBalanceDate, config.closingBalanceDate, null, "[]");

export const keepTerminationsInPeriod = (config: OverviewSectionParams) =>
    (line: ReportLine) =>
        line.transactionType === TransactionType.TERMINATION &&
        line.transactionDate &&
        line.transactionDate.isBetween(config.openingBalanceDate, config.closingBalanceDate, null, "[]") &&
        line.transactionDate.isSameOrBefore(line.transactions_to_terminate[0].expiryDate);

export const keepTerminationsInPeriod2 = (config: OverviewSectionParams) =>
    (line: ExcelSheetAwardLine) =>
        line.transaction_type === TransactionType.TERMINATION &&
        line.transaction_date &&
        line.transaction_date.isBetween(config.openingBalanceDate, config.closingBalanceDate, null, "[]") &&
        line.transaction_date.isSameOrBefore(line.expiryDate);

export const keepExpiredInPeriod = (config: OverviewSectionParams) =>
    (line: ReportLine) =>
        line.transactionType === TransactionType.GRANT &&
        line.expiryDate &&
        line.expiryDate.isBetween(config.openingBalanceDate, config.closingBalanceDate, null, "[]");

export const keepExpiredInPeriod2 = (config: OverviewSectionParams) =>
    (line: ExcelSheetAwardLine) =>
        line.transaction_type === TransactionType.GRANT &&
        line.expiryDate &&
        line.expiryDate.isBetween(config.openingBalanceDate, config.closingBalanceDate, null, "[]");

export const keepGrantedBeforePeriod = (config: OverviewSectionParams) =>
    (line: ReportLine) =>
        line.transactionType === TransactionType.GRANT &&
        line.grantDate &&
        line.grantDate.isBefore(config.openingBalanceDate) &&
        line.expiryDate.isAfter(config.openingBalanceDate);

export const keepGrantedBeforePeriod2 = (config: OverviewSectionParams) =>
    (line: ExcelSheetAwardLine) =>
        line.transaction_type === TransactionType.GRANT &&
        line.grantDate &&
        line.grantDate.isBefore(config.openingBalanceDate) &&
        line.expiryDate.isAfter(config.openingBalanceDate);

export const keepTerminationsBeforePeriod = (config: OverviewSectionParams) =>
    (line: ReportLine) =>
        line.transactionType === TransactionType.TERMINATION &&
        line.transactionDate.isBefore(config.openingBalanceDate);

export const keepTerminationsBeforePeriod2 = (config: OverviewSectionParams) =>
    (line: ExcelSheetAwardLine) =>
        line.transaction_type === TransactionType.TERMINATION &&
        line.transaction_date.isBefore(config.openingBalanceDate);

export const keepTerminationsAndGrantsBeforePeriod = (config: OverviewSectionParams) =>
    (line: ReportLine) => keepTerminationsBeforePeriod(config)(line) || keepGrantedBeforePeriod(config)(line);

export const keepTerminationsAndGrantsBeforePeriod2 = (config: OverviewSectionParams) =>
    (line: ExcelSheetAwardLine) => keepTerminationsBeforePeriod2(config)(line) || keepGrantedBeforePeriod2(config)(line);

export function getExpired(lines: ReportLine[], config: OverviewSectionParams) {
    return -1 * sum(lines.filter(keepExpiredInPeriod(config)), 'quantity');
}

export function getExpired2(lines: ExcelSheetAwardLine[], config: OverviewSectionParams) {
    return -1 * sum(lines.filter(keepExpiredInPeriod2(config)), 'quantity');
}

export function getNewGrants(lines: ReportLine[], config: OverviewSectionParams) {
    return sum(lines.filter(keepGrantsInPeriod(config)), 'quantity');
}

export function getNewGrants2(lines: ExcelSheetAwardLine[], config: OverviewSectionParams) {
    return sum(lines.filter(keepGrantsInPeriod2(config)), 'quantity');
}

export function getOpeningBalance(lines: ReportLine[], config: OverviewSectionParams) {
    return sum(lines.filter(keepTerminationsAndGrantsBeforePeriod(config)), 'quantity');
}

export function getOpeningBalance2(lines: ExcelSheetAwardLine[], config: OverviewSectionParams) {
    return sum(lines.filter(keepTerminationsAndGrantsBeforePeriod2(config)), 'quantity');
}

export function getTerminated(lines: ReportLine[], config: OverviewSectionParams) {
    return sum(lines.filter(keepTerminationsInPeriod(config)), 'quantity');
}
export function getTerminated2(lines: ExcelSheetAwardLine[], config: OverviewSectionParams) {
    return sum(lines.filter(keepTerminationsInPeriod2(config)), 'termination_quantity');
}

export function getClosingBalance(lines: ReportLine[], config: OverviewSectionParams) {
    return getOpeningBalance(lines, config) + getExpired(lines, config) + getTerminated(lines, config) + getNewGrants(lines, config);
}

export function getClosingBalance2(lines: ExcelSheetAwardLine[], config: OverviewSectionParams) {
    return getOpeningBalance2(lines, config) + getExpired2(lines, config) + getTerminated2(lines, config) + getNewGrants2(lines, config);
}

const sum = (lines: any[], property: string): number => lines.reduce((accu, current) => {
    const number = current[property] || 0;
    return number + accu;
}, 0);

