import {PrintableSocSecLine, SocSecLine} from "./types";
import {NO_VALUE, printDecimalNumber, printNumber, ReportInputParams, TransactionType} from "../reports";
import {apiShortDate, formatNumber, norwegianShortDate} from "../../utils/utils";
import {ReportLine} from "../ifrs-cost-spec/types";
import {
    calcSocSecTurnover,
    findSocSecRateForMobility,
    intrinsicValueAtSharePrice, quantityAtDate,
    socSecProvisionOfEarnedRate,
    socSecTerminationDate
} from "./soc-sec-calc";
import moment from "moment";
import {calcEarnedRate, earnedRateAtDate} from "../common/earned-calc";
import {Tranche} from "../../awards/award-reducer";
import {MobilityEntry} from "../../employees/employee-reducer";
import {calcPeriodLengths} from "../common/period-length-calc";
import {Interval} from "../common/date";
import {optioIncentivesBeginningOfTime, optioIncentivesEndOfTime} from "../../awards/award-saga";

export const toSocSecLines = (reportInput: ReportInputParams) => (line: Tranche): SocSecLine[] => {
    return line.mobility.map((mobility: MobilityEntry) => {
        const mappedData = {
            entityName: mobility.entity.name,
            internal_employee_id: line.internal_employee_id,
            entityId: mobility.entity_id,
            programId: line.programId,
            programName: line.programName,
            employeeName: line.employeeName,
            planName: line.programName,
            subplanName: line.subProgramName,
            grantDate: line.grantDate,
            vestedDate: line.vestedDate,
            expiryDate: line.expiryDate,
            strike: line.strike,
            quantity: line.quantity,
            mobilityFrom: mobility.from_date === optioIncentivesBeginningOfTime ? null : moment(mobility.from_date, apiShortDate),
            mobilityTo: mobility.to_date === optioIncentivesEndOfTime ? null : moment(mobility.to_date, apiShortDate),
        };

        const {
            openingBalanceDate, closingBalanceDate,
            openingBalanceSharePrice, closingBalanceSharePrice,
            annualTurnover
        } = reportInput;

        const socSecRate = findSocSecRateForMobility(mobility);
        const socSecPercent = socSecRate * 100;
        const obDate = reportInput.openingBalanceDate;
        const cbDate = reportInput.closingBalanceDate;
        const dayBeforeOB = moment(obDate).subtract(1, 'days');

        const mobilityInterval: Interval = {
            start: moment(mobility.from_date, apiShortDate),
            end: moment(mobility.to_date, apiShortDate)
        };
        const {
            obDays,
            cbDays,
            periodDays,
        } = calcPeriodLengths(line.grantDate, line.vestedDate, dayBeforeOB, cbDate, mobilityInterval);
        const earnedRateOB = calcEarnedRate(line.grantDate, line.vestedDate, obDays);
        const earnedRateCB = calcEarnedRate(line.grantDate, line.vestedDate, cbDays);

        const quantityOB = quantityAtDate(line.transactions, dayBeforeOB);
        const quantityCB = quantityAtDate(line.transactions, cbDate);

        const terminationDate = socSecTerminationDate(line);
        const intrinsicValueLastClosingDate = intrinsicValueAtSharePrice(line.strike, openingBalanceSharePrice);
        const intrinsicValueAtEndOfPeriod = intrinsicValueAtSharePrice(line.strike, closingBalanceSharePrice);
        const costLastClosingDate = line.instrumentName === "warrant" ? 0 : socSecProvisionOfEarnedRate(earnedRateOB, socSecRate, quantityOB, intrinsicValueLastClosingDate);
        const costPerEndOfPeriod = line.instrumentName === "warrant" ? 0 : socSecProvisionOfEarnedRate(earnedRateCB, socSecRate, quantityCB, intrinsicValueAtEndOfPeriod);
        const costOfPeriod = costPerEndOfPeriod - costLastClosingDate;

        const {
            totalTurnoverRate,
            turnoverEffectOB,
            costOBIncTurnover,
            periodCostIncTurnover,
            turnoverEffectCB,
            costCBIncTurnover,
        } = calcSocSecTurnover(line, reportInput, earnedRateOB, earnedRateCB, costLastClosingDate, costPerEndOfPeriod);


        if (terminationDate && terminationDate.isBetween(openingBalanceDate, closingBalanceDate, null, "[]")) {
            return {
                ...mappedData,
                socSecPercent: socSecPercent,
                socSecRate: socSecRate,
                intrinsicValueLastClosingDate,
                earnedRateOB,
                quantityOB,
                quantityCB,
                intrinsicValueAtEndOfPeriod: intrinsicValueAtEndOfPeriod,
                earnedRatePeriod: 1 - earnedRateOB,
                earnedRateCB: 0,
                costLastClosingDate: costLastClosingDate,
                costPerEndOfPeriod: 0,
                costOfPeriod: -1 * costLastClosingDate,
                totalTurnoverRate,
                annualTurnoverRate: annualTurnover,
                turnoverEffectOB,
                costOBIncTurnover,
                periodCostIncTurnover: -1 * costOBIncTurnover,
                turnoverEffectCB,
                costCBIncTurnover: 0,
            }
        } else if (terminationDate && terminationDate.isBefore(openingBalanceDate)) {
            return {
                ...mappedData,
                socSecPercent,
                socSecRate,
                intrinsicValueLastClosingDate: intrinsicValueLastClosingDate,
                earnedRateOB: 0,
                intrinsicValueAtEndOfPeriod,
                earnedRatePeriod: 0,
                earnedRateCB: 0,
                costLastClosingDate: 0,
                costPerEndOfPeriod: 0,
                costOfPeriod: 0,
                totalTurnoverRate,
                annualTurnoverRate: annualTurnover,
                turnoverEffectOB,
                costOBIncTurnover: 0,
                periodCostIncTurnover: 0,
                turnoverEffectCB,
                costCBIncTurnover: 0,
                quantityOB,
                quantityCB,
            }
        }


        return {
            ...mappedData,
            socSecPercent: socSecPercent,
            socSecRate: socSecRate,
            intrinsicValueLastClosingDate: intrinsicValueLastClosingDate,
            earnedRateOB,
            intrinsicValueAtEndOfPeriod: intrinsicValueAtEndOfPeriod,
            earnedRatePeriod: earnedRateCB - earnedRateOB,
            earnedRateCB,
            costLastClosingDate,
            costPerEndOfPeriod,
            costOfPeriod,
            totalTurnoverRate,
            annualTurnoverRate: annualTurnover,
            turnoverEffectOB,
            costOBIncTurnover,
            periodCostIncTurnover,
            turnoverEffectCB,
            costCBIncTurnover,
            quantityOB,
            quantityCB,
        }
    });
};

export const toPrintableSocSecLines = (sharePriceOB: number, sharePriceCB: number) => (line: SocSecLine): PrintableSocSecLine => ({
    entityName: line.entityName,
    internal_employee_id: line.internal_employee_id,
    employeeName: line.employeeName,
    planName: line.planName,
    subplanName: line.subplanName,
    grantDate: line.grantDate ? line.grantDate.format(norwegianShortDate) : NO_VALUE,
    vestedDate: line.vestedDate ? line.vestedDate.format(norwegianShortDate) : NO_VALUE,
    expiryDate: line.expiryDate ? line.expiryDate.format(norwegianShortDate) : NO_VALUE,
    strike: printNumber(line.strike),
    quantity: formatNumber(line.quantity),
    socSecRate: printDecimalNumber(line.socSecRate),
    sharePriceOB: printDecimalNumber(sharePriceOB),
    sharePriceCB: printDecimalNumber(sharePriceCB),
    intrinsicValueLastClosingDate: printDecimalNumber(line.intrinsicValueLastClosingDate),
    earnedRateOB: printDecimalNumber(line.earnedRateOB),
    intrinsicValueAtEndOfPeriod: printDecimalNumber(line.intrinsicValueAtEndOfPeriod),
    earnedRatePeriod: printDecimalNumber(line.earnedRatePeriod),
    earnedRateCB: printDecimalNumber(line.earnedRateCB),
    costLastClosingDate: printDecimalNumber(line.costLastClosingDate),
    costPerEndOfPeriod: printDecimalNumber(line.costPerEndOfPeriod),
    costOfPeriod: printDecimalNumber(line.costOfPeriod),
    totalTurnoverRate: printDecimalNumber(line.totalTurnoverRate),
    annualTurnoverRate: printDecimalNumber(line.annualTurnoverRate),
    turnoverEffectOB: printDecimalNumber(line.turnoverEffectOB),
    costOBIncTurnover: printDecimalNumber(line.costOBIncTurnover),
    periodCostIncTurnover: printDecimalNumber(line.periodCostIncTurnover),
    turnoverEffectCB: printDecimalNumber(line.turnoverEffectCB),
    costCBIncTurnover: printDecimalNumber(line.costCBIncTurnover),
    mobilityFrom: line.mobilityFrom ? line.mobilityFrom.format(norwegianShortDate) : NO_VALUE,
    mobilityTo: line.mobilityTo ? line.mobilityTo.format(norwegianShortDate) : NO_VALUE,
    quantityOB: formatNumber(line.quantityOB),
    quantityCB: formatNumber(line.quantityCB),
});