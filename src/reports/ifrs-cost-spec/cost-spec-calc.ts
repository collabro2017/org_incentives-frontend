import {Moment} from "moment";
import {ExcelSheetAwardLine} from "../../awards/award-reducer";
import {NO_VALUE, printNumber, ReportInputParams, TransactionType} from "../reports";
import {ReportLine} from "./types";
import {toReportLines} from "./cost-spec-mappers";
import {earnedRateAtDate, EarningDates} from "../common/earned-calc";
import moment from "moment";

export const calcCostSpecForTerminationTransactions = (reportInput: ReportInputParams) => (line: ReportLine): ReportLine => {
    if (line.transactionType === TransactionType.TERMINATION) {
        console.log(line.transactions_to_terminate);
        const cost = calcTerminationCostSpec(reportInput)(line);
        return {...line, ...cost}
    }
    return line;
};

export const calcTerminationCostSpec = (reportInput: ReportInputParams) => (line: ReportLine) => {
    const transactionsToTerminate = line.transactions_to_terminate.map(toReportLines(reportInput));
    console.log(transactionsToTerminate);
    const reverseCost = (param: string) => (accu, current) => accu + ((typeof current[param] === 'number' ? current[param] : 0) * -1);

    if (line.transactionDate.isBetween(reportInput.openingBalanceDate, reportInput.closingBalanceDate, null, "[]")) {
        return {
            openingBalance: 0,
            periodCost: transactionsToTerminate.reduce(reverseCost('periodCost'), 0) + transactionsToTerminate.reduce(reverseCost('openingBalance'), 0),
            closingBalance: transactionsToTerminate.reduce(reverseCost('closingBalance'), 0),
            unamortized: transactionsToTerminate.reduce(reverseCost('unamortized'), 0),
            costOBIncTurnover: 0,
            periodCostIncTurnover: transactionsToTerminate.reduce(reverseCost('periodCostIncTurnover'), 0) + transactionsToTerminate.reduce(reverseCost('costOBIncTurnover'), 0),
            costCBIncTurnover: transactionsToTerminate.reduce(reverseCost('costCBIncTurnover'), 0),
            costUnamortizedIncTurnover: transactionsToTerminate.reduce(reverseCost('costUnamortizedIncTurnover'), 0),
            totalCost: transactionsToTerminate.reduce(reverseCost('totalCost'), 0),
        }
    }

    return {
        openingBalance: transactionsToTerminate.reduce(reverseCost('openingBalance'), 0),
        periodCost: transactionsToTerminate.reduce(reverseCost('periodCost'), 0),
        closingBalance: transactionsToTerminate.reduce(reverseCost('closingBalance'), 0),
        unamortized: transactionsToTerminate.reduce(reverseCost('unamortized'), 0),
        costOBIncTurnover: transactionsToTerminate.reduce(reverseCost('costOBIncTurnover'), 0),
        periodCostIncTurnover: transactionsToTerminate.reduce(reverseCost('periodCostIncTurnover'), 0),
        costCBIncTurnover: transactionsToTerminate.reduce(reverseCost('costCBIncTurnover'), 0),
        costUnamortizedIncTurnover: transactionsToTerminate.reduce(reverseCost('costUnamortizedIncTurnover'), 0),
        totalCost: transactionsToTerminate.reduce(reverseCost('totalCost'), 0),
    }
};

export const calcTotalCost = (line: ExcelSheetAwardLine): number => line.transaction_type === TransactionType.TERMINATION ? parseFloat(line.fair_value) * line.termination_quantity * -1 : parseFloat(line.fair_value) * line.quantity;

export const calcCostOfDays = (line: ExcelSheetAwardLine, days: number) => {
    const totalCostDays = line.vestedDate.diff(line.grantDate, 'days');
    const totalCost = calcTotalCost(line);
    return totalCost * days / Math.max(totalCostDays, 1)
};

const earningsDatesFromExcelSheetAwardLine = (line: ExcelSheetAwardLine) => ({
    startDate: line.grantDate,
    endDate: line.vestedDate,
    expiryDate: line.expiryDate
});

export const calcOpeningBalance = (line: ExcelSheetAwardLine, reportStart: Moment, reportEnd: Moment): number | null => {
    if (!line.fair_value) {
        return null;
    }

    if (line.grantDate.isBetween(reportStart, reportEnd, null, "[]")) {
        // We have no ingoing balance if it's granted within the reporting period.
        return 0;
    }

    // const daysFromGrantToReportStart = reportStart.diff(line.startDate, 'days'); // Not inclusive, since we want the closing balance of the day before
    // const daysFromGrantToVesting = line.vestedDate.diff(line.startDate, 'days');
    // const obDays = Math.min(daysFromGrantToReportStart, daysFromGrantToVesting);
    // const ob = calcCostOfDays(line, Math.max(obDays, 1));
    const dates = earningsDatesFromExcelSheetAwardLine(line);
    const earned = earnedRateAtDate(dates, moment(reportStart).subtract(1, 'days'));
    return earned.rate * calcTotalCost(line)
};

export const calcOpeningBalance2 = (line: ExcelSheetAwardLine, earnedRate: number): number | null => {
    if (!line.fair_value) {
        return null;
    }

    return earnedRate * calcTotalCost(line)
};


export const calcPeriodCost = (line: ExcelSheetAwardLine, reportStart: Moment, reportEnd: Moment): number => {
    if (!line.fair_value) {
        return null;
    }

    if (line.vestedDate.isBefore(reportStart)) {
        // All cost is already accounted for
        return 0;
    }

    const startDate = reportStart.isSameOrBefore(line.grantDate) ? line.grantDate : reportStart;

    if (line.vestedDate.isBetween(startDate, reportEnd, null, "[]")) {
        // Vested within period -> return remaining cost
        return calcTotalCost(line) - calcOpeningBalance(line, reportStart, reportEnd);
    } else {
        // const endDate = reportEnd.isSameOrBefore(line.vestedDate) ? reportEnd : line.vestedDate;
        // const daysOfPeriod = endDate.diff(startDate, 'days') + 1; // Dates should be inclusive
        // const periodCost = calcCostOfDays(line, daysOfPeriod);

        const dates = { startDate: line.grantDate, endDate: line.vestedDate, expiryDate: line.expiryDate};
        const earnedOB = earnedRateAtDate(dates, moment(reportStart).subtract(1, 'days'));
        const earnedCB = earnedRateAtDate(dates, reportEnd);
        const earnedRatePeriod = earnedCB.rate - earnedOB.rate;
        return earnedRatePeriod * calcTotalCost(line);
    }
};

export interface TurnoverCalculation {
    totalTurnoverRate: number,
    turnoverEffectOB: number,
    costOBIncTurnover: number,
    periodCostIncTurnover: number,
    turnoverEffectCB: number,
    costCBIncTurnover: number,
    costUnamortizedIncTurnover: number,
}

export const calcTurnover = (line: ExcelSheetAwardLine, obDate: Moment, cbDate: Moment, turnoverRate: number): TurnoverCalculation => {
    const yearsFromGrantToVesting = line.vestedDate.diff(line.grantDate, 'years', true);
    const totalTurnoverRate = Math.pow((1 + turnoverRate), yearsFromGrantToVesting) -1;
    if (!line.fair_value) {
        return {
            turnoverEffectOB: 0,
            totalTurnoverRate,
            costOBIncTurnover: 0,
            periodCostIncTurnover: 0,
            turnoverEffectCB: 0,
            costCBIncTurnover: 0,
            costUnamortizedIncTurnover: 0,
        };
    }


    const dates = earningsDatesFromExcelSheetAwardLine(line);
    const earnedOB = earnedRateAtDate(dates, moment(obDate).subtract(1, 'days'));
    const earnedRateOB = earnedOB.rate;
    const earnedCB = earnedRateAtDate(dates, cbDate);
    const earnedRateCB = earnedCB.rate;

    const turnoverEffectOB = totalTurnoverRate - (totalTurnoverRate * earnedRateOB);
    let costOBIncTurnover = (1-turnoverEffectOB) * calcOpeningBalance(line, obDate, cbDate);

    const turnoverEffectCB = totalTurnoverRate - (totalTurnoverRate * earnedRateCB);
    let costCBIncTurnover = (1-turnoverEffectCB) * calcClosingBalance(line, obDate, cbDate);

    let periodCostIncTurnover = costCBIncTurnover - costOBIncTurnover;

    let costUnamortizedIncTurnover = calcTotalCost(line) - costCBIncTurnover;

    if (line.grantDate.isAfter(obDate)) {
        // We have no ingoing balance if it's granted after the reporting period start.
        costOBIncTurnover = 0;
    }

    if (line.grantDate.isAfter(cbDate)) {
        // We have no outgoing balance if it's granted after the reporting period.
        costCBIncTurnover = 0;
        periodCostIncTurnover = 0;
        costUnamortizedIncTurnover = 0;
    }

    return {
        totalTurnoverRate,
        turnoverEffectOB,
        costOBIncTurnover,
        periodCostIncTurnover,
        turnoverEffectCB,
        costCBIncTurnover,
        costUnamortizedIncTurnover,
    }
};

export function turnoverEffectFromEarnedRate(totalTurnoverRate: number, earnedRate: number) {
    return totalTurnoverRate - (totalTurnoverRate * earnedRate);
}

export function calcTotalTurnoverRate(line: ExcelSheetAwardLine, turnoverRate: number) {
    const yearsFromGrantToVesting = line.vestedDate.diff(line.grantDate, 'years', true);
    return Math.pow((1 + turnoverRate), yearsFromGrantToVesting) - 1;
}

export function calcCostIncTurnover(turnoverEffect: number, cost: number) {
    return (1 - turnoverEffect) * cost;
}

export const printOpeningBalance = (ob: number | null): string => {
    if (typeof ob !== "number") {
        return NO_VALUE
    }

    return printNumber(ob)
};

export const printPeriodCost = (cost: number | null): string => {
    if (typeof cost !== "number") {
        return NO_VALUE
    }

    return printNumber(cost);
};

export const calcClosingBalance = (line: ExcelSheetAwardLine, reportStart: Moment, reportEnd: Moment): number => {
    if (!line.fair_value) {
        return null;
    }

    return calcOpeningBalance(line, reportStart, reportEnd) + calcPeriodCost(line, reportStart, reportEnd);
};

export const calcCost = (line: ExcelSheetAwardLine, earnedRate: number): number => {
    if (!line.fair_value) {
        return null;
    }

    return earnedRate * calcTotalCost(line);
};


export const printClosingBalance = (cb: number | null): string => {
    if (typeof cb !== "number") {
        return NO_VALUE
    }

    return printNumber(cb);
};

export const calcUnamortized = (line: ExcelSheetAwardLine, reportStart: Moment, reportEnd: Moment): number => {
    if (!line.fair_value) {
        return null;
    }

    return calcTotalCost(line) - calcClosingBalance(line, reportStart, reportEnd);
};


export const printUnamortized = (unamortized: number | null): string => {
    if (typeof unamortized !== "number") {
        return NO_VALUE
    }

    return printNumber(unamortized);
};