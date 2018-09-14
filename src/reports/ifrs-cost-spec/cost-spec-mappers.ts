import {PrintableReportLine, ReportLine} from "./types";
import {
    calcClosingBalance, calcCost, calcCostIncTurnover,
    calcOpeningBalance, calcOpeningBalance2, calcPeriodCost, calcTotalTurnoverRate, calcTurnover, calcUnamortized,
    printClosingBalance,
    printOpeningBalance,
    printPeriodCost,
    printUnamortized, turnoverEffectFromEarnedRate
} from "./cost-spec-calc";
import {apiShortDate, formatNumber, norwegianShortDate} from "../../utils/utils";
import {NO_VALUE, printDecimalNumber, printNumber, ReportInputParams, TransactionType} from "../reports";
import {ExcelSheetAwardLine} from "../../awards/award-reducer";
import moment, {Moment} from "moment";
import {calcEarnedRate, earnedRateAtDate, EarningDates} from "../common/earned-calc";
import {MobilityEntry} from "../../employees/employee-reducer";
import {Interval, overlappingDays} from "../common/date";
import {calcPeriodLengths} from "../common/period-length-calc";
import {mobilitiesBeforeDate} from "../common/utils";
import {findSocSecRateForExcelSheetAwardLine} from "../social-security/soc-sec-calc";

export const toReportLines = (reportInput: ReportInputParams) => (award: ExcelSheetAwardLine): ReportLine[] => {
    const transactionType = TransactionType[award.transaction_type];
    const mappedValues = {
        id: award.id,
        internal_employee_id: award.employee.internal_identification,
        vesting_event_id: award.vesting_event_id,
        programId: award.programId,
        entityName: award.entityName,
        entity: award.entity,
        employee: award.employee,
        planName: award.programName,
        subplanName: award.subProgramName,
        employeeName: award.employeeName,
        transactionType: transactionType,
        grantDate: award.grantDate,
        transactionDate: award.transaction_date,
        vestingDate: award.vestedDate,
        expiryDate: award.expiryDate,
        strikePrice: award.strike,
        instrumentType: award.instrumentName,
        transactions_to_terminate: award.transactions_to_terminate || [],
        fairValue: award.fair_value && parseFloat(award.fair_value),
        integerId: award.integerId,
        mobility: award.mobility,
    };

    // if (transactionType === TransactionType.TERMINATION) {
    //     return [{
    //         ...mappedValues,
    //         quantity: award.termination_quantity,
    //     }]
    // }

    if (transactionType === TransactionType.EXERCISE) {
        return [{
            ...mappedValues,
            quantity: award.quantity,
        }]
    }

    if (transactionType === TransactionType.ADJUSTMENT_VESTING_DATE || transactionType === TransactionType.ADJUSTMENT_STRIKE) {
        return [{
            ...mappedValues,
            quantity: award.quantity,
        }]
    }

    if (transactionType === TransactionType.ADJUSTMENT_DIVIDEND || award.is_dividend) {
        return [{
            ...mappedValues,
            quantity: award.quantity,
            fairValue: null,
        }]
    }

    console.log(award.mobility);
    const mobilitiesBeforeClosingDate = mobilitiesBeforeDate(award.mobility, reportInput.closingBalanceDate);

    return mobilitiesBeforeClosingDate.map((mobility: MobilityEntry, index, array): ReportLine => {
        const obDate = reportInput.openingBalanceDate;
        const cbDate = reportInput.closingBalanceDate;
        const shouldHandleOBAsPeriodCost = award.transaction_type === TransactionType.TERMINATION && award.transaction_date.isBetween(obDate, cbDate, null, "[]");

        const dayBeforeOB = moment(obDate).subtract(1, 'days');

        const mobilityInterval: Interval = { start: moment(mobility.from_date, apiShortDate), end: moment(mobility.to_date, apiShortDate)};
        const {
            obDays,
            cbDays,
            periodDays,
            unamortizedDays
        } = calcPeriodLengths(award.grantDate, award.vestedDate, dayBeforeOB, cbDate, mobilityInterval);

        // const obDate = reportInput.openingBalanceDate.isBefore(mobility.from_date) ? reportInput.openingBalanceDate : mobility.from_date;
        const totalCostDays = award.vestedDate.diff(award.grantDate, "days") + 1;
        const earnedRateOB = calcEarnedRate(award.grantDate, award.vestedDate, obDays);
        const earnedRatePeriod = calcEarnedRate(award.grantDate, award.vestedDate, periodDays);
        const earnedRateCB = calcEarnedRate(award.grantDate, award.vestedDate, cbDays);
        const earnedRateUnamortized = calcEarnedRate(award.grantDate, award.vestedDate, unamortizedDays);

        // const {
        //     totalTurnoverRate,
        //     turnoverEffectOB,
        //     costOBIncTurnover,
        //     periodCostIncTurnover,
        //     turnoverEffectCB,
        //     costCBIncTurnover,
        //     costUnamortizedIncTurnover,
        // } = calcTurnover(award, obDate, reportInput.closingBalanceDate, reportInput.annualTurnover);


        // const openingBalance = calcOpeningBalance(award, obDate, reportInput.closingBalanceDate);

        const openingBalance = shouldHandleOBAsPeriodCost ? 0 : calcCost(award, earnedRateOB);

        // const closingBalance = calcClosingBalance(award, obDate, reportInput.closingBalanceDate);
        const closingBalance = calcCost(award, earnedRateCB);

        // const periodCost = calcPeriodCost(award, obDate, reportInput.closingBalanceDate);
        const periodCost = closingBalance - openingBalance;

        // const unamortized = calcUnamortized(award, obDate, reportInput.closingBalanceDate);
        const unamortized = calcCost(award, earnedRateUnamortized);
        const totalCost = unamortized + closingBalance;

        const totalTurnoverRate = calcTotalTurnoverRate(award, reportInput.annualTurnover);
        const turnoverEffectOB = turnoverEffectFromEarnedRate(totalTurnoverRate, earnedRateOB);
        const turnoverEffectCB = turnoverEffectFromEarnedRate(totalTurnoverRate, earnedRateCB);
        const costOBIncTurnover = calcCostIncTurnover(turnoverEffectOB, openingBalance);
        const costCBIncTurnover = calcCostIncTurnover(turnoverEffectCB, closingBalance);
        const periodCostIncTurnover = costCBIncTurnover - costOBIncTurnover;
        const costUnamortizedIncTurnover = totalCost - costCBIncTurnover;

        // if (array.length === 1 && (openingBalance !== openingBalance || closingBalance !== closingBalance || periodCost !== periodCost || unamortized !== unamortized)) {
        //     debugger;
        // }
        //
        // if (array.length === 1 && (turnoverEffectOB !== turnoverEffectOB || turnoverEffectCB !== turnoverEffectCB || costOBIncTurnover !== costOBIncTurnover || costCBIncTurnover !== costCBIncTurnover || periodCostIncTurnover !== periodCostIncTurnover || costUnamortizedIncTurnover !== costUnamortizedIncTurnover)) {
        //     debugger;
        // }

        return {
            ...mappedValues,
            quantity: award.transaction_type === TransactionType.TERMINATION ? award.termination_quantity : award.quantity,
            entity: mobility.entity,
            entityName: mobility.entity && mobility.entity.name,
            earnedOB: earnedRateOB,
            earnedDaysOB: obDays,
            earnedPeriod: earnedRatePeriod,
            earnedDaysCB: cbDays,
            earnedCB: earnedRateCB,
            openingBalance: openingBalance,
            periodCost: periodCost,
            closingBalance: closingBalance,
            unamortized: unamortized,
            annualTurnoverRate: reportInput.annualTurnover,
            totalTurnoverRate,
            turnoverEffectOB,
            costOBIncTurnover,
            periodCostIncTurnover,
            turnoverEffectCB,
            costCBIncTurnover,
            costUnamortizedIncTurnover,
            socSecRate: findSocSecRateForExcelSheetAwardLine(award, mobility),
            totalCost,
        };
    });

    // const dates: EarningDates = { startDate: award.grantDate, endDate: award.vestedDate, expiryDate: award.expiryDate};
    // const earnedOB = earnedRateAtDate(dates, moment(reportInput.openingBalanceDate).subtract(1, 'days'));
    // const earnedRateOB = earnedOB.rate;
    // const earnedCB = earnedRateAtDate(dates, reportInput.closingBalanceDate);
    // const earnedRateCB = earnedCB.rate;
    //
    // const {
    //     totalTurnoverRate,
    //     turnoverEffectOB,
    //     costOBIncTurnover,
    //     periodCostIncTurnover,
    //     turnoverEffectCB,
    //     costCBIncTurnover,
    //     costUnamortizedIncTurnover,
    // } = calcTurnover(award, reportInput.openingBalanceDate, reportInput.closingBalanceDate, reportInput.annualTurnover);
    // return [{
    //     ...mappedValues,
    //     quantity: award.quantity,
    //     earnedOB: earnedRateOB,
    //     earnedDaysOB: earnedOB.days,
    //     earnedPeriod: earnedRateCB - earnedRateOB,
    //     earnedDaysCB: earnedCB.days,
    //     earnedCB: earnedRateCB,
    //     openingBalance: calcOpeningBalance(award, reportInput.openingBalanceDate, reportInput.closingBalanceDate),
    //     periodCost: calcPeriodCost(award, reportInput.openingBalanceDate, reportInput.closingBalanceDate),
    //     closingBalance: calcClosingBalance(award, reportInput.openingBalanceDate, reportInput.closingBalanceDate),
    //     unamortized: calcUnamortized(award, reportInput.openingBalanceDate, reportInput.closingBalanceDate),
    //     annualTurnoverRate: reportInput.annualTurnover,
    //     totalTurnoverRate,
    //     turnoverEffectOB,
    //     costOBIncTurnover,
    //     periodCostIncTurnover,
    //     turnoverEffectCB,
    //     costCBIncTurnover,
    //     costUnamortizedIncTurnover
    // }];
};

export const toPrintableReportLine = (sharePriceOB: number, sharePriceCB: number) => (line: ReportLine): PrintableReportLine => ({
    id: line.id,
    integerId: line.integerId.toString(),
    internal_employee_id: line.internal_employee_id,
    vesting_event_id: line.vesting_event_id,
    entityName: line.entityName,
    planName: line.planName,
    subplanName: line.subplanName,
    employeeName: line.employeeName,
    transactionType: line.transactionType.toString(),
    grantDate: line.grantDate ? line.grantDate.format(norwegianShortDate) : NO_VALUE,
    transactionDate: line.transactionDate.format(norwegianShortDate),
    vestingDate: line.vestingDate ? line.vestingDate.format(norwegianShortDate) : NO_VALUE,
    expiryDate: line.expiryDate ? line.expiryDate.format(norwegianShortDate) : NO_VALUE,
    strikePrice: printNumber(line.strikePrice),
    quantity: formatNumber(line.quantity),
    sharePriceOB: printDecimalNumber(sharePriceOB),
    earnedOB: printDecimalNumber(line.earnedOB),
    earnedDaysOB: formatNumber(line.earnedDaysOB),
    openingBalance: printOpeningBalance(line.openingBalance),
    periodCost: printPeriodCost(line.periodCost),
    earnedPeriod: printDecimalNumber(line.earnedPeriod),
    closingBalance: printClosingBalance(line.closingBalance),
    sharePriceCB: printDecimalNumber(sharePriceCB),
    earnedCB: printDecimalNumber(line.earnedCB),
    earnedDaysCB: formatNumber(line.earnedDaysCB),
    unamortized: printUnamortized(line.unamortized),
    fairValue: printNumber(line.fairValue),
    totalCost: printNumber(line.totalCost),
    annualTurnoverRate: printDecimalNumber(line.annualTurnoverRate),
    totalTurnoverRate: printDecimalNumber(line.totalTurnoverRate),
    turnoverEffectOB: printDecimalNumber(line.turnoverEffectOB),
    costOBIncTurnover: printDecimalNumber(line.costOBIncTurnover),
    periodCostIncTurnover: printDecimalNumber(line.periodCostIncTurnover),
    turnoverEffectCB: printDecimalNumber(line.turnoverEffectCB),
    costCBIncTurnover: printDecimalNumber(line.costCBIncTurnover),
    costUnamortizedIncTurnover: printDecimalNumber(line.costUnamortizedIncTurnover),
});
