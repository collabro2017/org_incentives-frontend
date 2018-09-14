import {NO_VALUE, TransactionType} from "../reports/reports";
import {ExcelSheetAwardLine, Tranche, TrancheTransaction} from "./award-reducer";
import {RootState} from "../reducers/all-reducers";
import moment from "moment";
import {flatten, formatNumber, norwegianShortDate, sumNumbers} from "../utils/utils";
import {countryEntry} from "../data/common";
import {sortMultipleLevels} from "../utils/sort";

export const token = (state) => state.user.token;
export const isSysadmin = (state) => state.user.isSysadmin;
export const tenantId = (state) => state.tenant.selectedTenant.id;

export const grantsMissingFairValue = (state: RootState) => state.award.allTenantAwards.filter((tranche) => !tranche.transactions[0].fair_value);
export const uniqueGrantsMissingFairValue = (state: RootState) => grantsMissingFairValue(state).reduce<Tranche[]>((accu, current) => {
    const exists = accu.some((tranche) =>
        moment(tranche.transactions[0].grant_date).isSame(current.grantDate) &&
        moment(tranche.transactions[0].vested_date).isSame(current.vestedDate) &&
        moment(tranche.transactions[0].expiry_date).isSame(current.expiryDate)
    );
    if (exists) {
        return accu;
    } else {
        return accu.concat(current);
    }
}, []);

export const sortedExcelSheetAwardLines = (state: RootState): ExcelSheetAwardLine[] => sortMultipleLevels(toExcelSheetAwardLine(state))("employeeName", "grantDate", "vestedDate")

export const toExcelSheetAwardLine = (state: RootState): ExcelSheetAwardLine[] => {
    const tranches = sortedTranches(state);
    let lines: ExcelSheetAwardLine[] = flatten(tranches.map((tranche, trancheIndex) => tranche.transactions.map((transaction, transactionIndex) => {
        const trancheIntegerId = (trancheIndex + 1) * 1000;
        const integerId = trancheIntegerId + transactionIndex + 1;
        return {
            id: transaction.id,
            vesting_event_id: tranche.id,
            programId: tranche.programId,
            programName: tranche.programName,
            subProgramName: tranche.subProgramName,
            employeeName: tranche.employeeName,
            employee: tranche.employee,
            entity: tranche.entity,
            country: tranche.country,
            entityName: tranche.entityName,
            instrumentName: tranche.instrumentName,
            settlementName: tranche.settlementName,
            performance: tranche.performance,
            grantDate: transaction.grant_date && moment(transaction.grant_date),
            vestedDate: transaction.vested_date && moment(transaction.vested_date),
            expiryDate: transaction.expiry_date && moment(transaction.expiry_date),
            quantity: transaction.quantity,
            strike: isNaN(parseFloat(transaction.strike)) ? null : parseFloat(transaction.strike),
            exercisedQuantity: tranche.exercisedQuantity,
            purchase_price: transaction.purchase_price,
            fair_value: transaction.fair_value,
            transaction_type: transaction.transaction_type,
            transaction_date: moment(transaction.transaction_date),
            termination_quantity: typeof transaction.termination_quantity === "number" ? transaction.termination_quantity : null,
            is_dividend: tranche.is_dividend,
            integerId,
            mobility: tranche.mobility
        };
    })));

    return lines.map(line => {
        if (TransactionType[line.transaction_type] === TransactionType.TERMINATION) {
            return { ...line, transactions_to_terminate: transactionsToTerminate(lines, line)}
        }
        return line;
    });
};

const transactionsToTerminate = (lines: ExcelSheetAwardLine[], line: ExcelSheetAwardLine) =>
    lines.filter(l => l.vesting_event_id === line.vesting_event_id && line.id !== l.id);

export const trancheDataArray = (state: RootState): Array<Array<string | number>> => {
    const headers = [
        "Name",
        "Entity",
        "Country",
        "Program",
        "Subprogram",
        "Instrument",
        "Settlement",
        "Performance",
        "Purchase price",
        "Strike",
        "Quantity",
        "Exercised",
        "Terminated",
        "Grant Date",
        "Vested Date",
        "Expiry Date",
        "Is dividend?",
        "Fair value"
    ];

    const rows = state.award.allTenantAwards.map((tranche) => ([
        tranche.employeeName,
        tranche.entityName,
        countryEntry(tranche.country).text,
        tranche.programName,
        tranche.subProgramName,
        tranche.instrumentName,
        tranche.settlementName,
        tranche.performance ? "Yes" : "No",
        tranche.purchase_price ? parseFloat(tranche.purchase_price) : NO_VALUE,
        tranche.strike ? tranche.strike : NO_VALUE,
        tranche.quantity,
        -1 * tranche.exercisedQuantity,
        -1 * tranche.transactions.map(x => x.termination_quantity || 0).reduce(sumNumbers, 0),
        tranche.grantDate ? tranche.grantDate.format(norwegianShortDate) : NO_VALUE,
        tranche.vestedDate ? tranche.vestedDate.format(norwegianShortDate) : NO_VALUE,
        tranche.expiryDate ? tranche.expiryDate.format(norwegianShortDate) : NO_VALUE,
        tranche.is_dividend ? "Yes" : "No",
        tranche.fair_value ? parseFloat(tranche.fair_value) : NO_VALUE
    ]));

    return [headers, ...rows]
};

export const sortedTranches = (state: RootState): Tranche[] => sortMultipleLevels(state.award.allTenantAwards)("employeeName", "grantDate", "vestedDate");
