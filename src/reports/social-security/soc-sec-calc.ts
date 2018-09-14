import {Moment} from "moment";
import {earnedRateAtDate, EarningDates} from "../common/earned-calc";
import {ReportLine} from "../ifrs-cost-spec/types";
import {SocSecLine} from "./types";
import {ReportInputParams, TransactionType} from "../reports";
import {toSocSecLines} from "./soc-sec-mappers";
import moment from "moment";
import {ExcelSheetAwardLine, Tranche, TrancheTransaction} from "../../awards/award-reducer";
import {MobilityEntry} from "../../employees/employee-reducer";
import {apiShortDate, flatten, sumNumbers} from "../../utils/utils";
import {Entity} from "../../entity/entity-reducer";

export const findSocSecRateForExcelSheetAwardLine = (line: ExcelSheetAwardLine, mobility: MobilityEntry): number =>
    mobility.override_entity_soc_sec ? parseFloat(mobility.override_entity_soc_sec) : parseFloat(line.entity.soc_sec);

export const findSocSecRateForMobility = (mobility: MobilityEntry): number =>
    mobility.override_entity_soc_sec ? parseFloat(mobility.override_entity_soc_sec) : parseFloat(mobility.entity.soc_sec);
export const getOrZero = (value: number | null | undefined): number => value || 0;
export const intrinsicValueAtSharePrice = (strike: number | null | undefined, sharePrice: number): number => Math.max(0, sharePrice - getOrZero(strike));

export const socSecProvisionOfEarnedRate = (earnedRate: number, socSecRate: number, quantity: number, intrinsicValue: number): number => {
    return Math.max(0, intrinsicValue * quantity * earnedRate * socSecRate)
};

export const socSecTerminationDate = (tranche: Tranche): Moment | null => {
    const termination = tranche.transactions.filter(t => t.transaction_type === TransactionType.TERMINATION)[0];
    if (termination) {
        return moment(termination.transaction_date, apiShortDate);
    }

    return null
};

export const generateSocSecLines = (lines: Tranche[], reportInput: ReportInputParams): SocSecLine[] => {
    const eligable = lines.filter(l =>
        reportInput.openingBalanceDate.isBefore(l.expiryDate) // If expired before reporting period -> remove. (This will probably change in the future. We may want to display more "history")
    );
    return flatten(eligable.map(toSocSecLines(reportInput)));
};

export interface SocSecTurnoverCalculation {
    totalTurnoverRate: number,
    turnoverEffectOB: number,
    costOBIncTurnover: number,
    periodCostIncTurnover: number,
    turnoverEffectCB: number,
    costCBIncTurnover: number,
}

export const quantityAtDate = (transactions: TrancheTransaction[], date: Moment): number =>
    transactions
        .filter(t => moment(t.transaction_date, apiShortDate).isSameOrBefore(date))
        .map(t => (t.quantity || 0) + (t.termination_quantity || 0))
        .reduce(sumNumbers, 0);

export const calcSocSecTurnover = (line: Tranche, reportInput: ReportInputParams, earnedRateOB: number, earnedRateCB: number, provisionOB: number, provisionCB: number): SocSecTurnoverCalculation => {
    const turnoverRate = reportInput.annualTurnover;
    const { openingBalanceDate, closingBalanceDate } = reportInput;
    const yearsFromGrantToVesting = line.vestedDate.diff(line.grantDate, 'years', true);
    const totalTurnoverRate = Math.pow((1 + turnoverRate), yearsFromGrantToVesting) -1;

    const turnoverEffectOB = totalTurnoverRate - (totalTurnoverRate * earnedRateOB);
    let costOBIncTurnover = (1-turnoverEffectOB) * provisionOB;

    const turnoverEffectCB = totalTurnoverRate - (totalTurnoverRate * earnedRateCB);
    let costCBIncTurnover = (1-turnoverEffectCB) * provisionCB;

    let periodCostIncTurnover = costCBIncTurnover - costOBIncTurnover;


    if (line.grantDate.isAfter(openingBalanceDate)) {
        // We have no ingoing balance if it's granted after the reporting period start.
        costOBIncTurnover = 0;
    }

    if (line.grantDate.isAfter(closingBalanceDate)) {
        // We have no outgoing balance if it's granted after the reporting period.
        costCBIncTurnover = 0;
        periodCostIncTurnover = 0;
    }

    if (line.instrumentName === "warrant") {
        // Warrants should not generate soc sec provision
        costOBIncTurnover = 0;
        costCBIncTurnover = 0;
        periodCostIncTurnover = 0;
    }

    return {
        totalTurnoverRate,
        turnoverEffectOB,
        costOBIncTurnover,
        periodCostIncTurnover,
        turnoverEffectCB,
        costCBIncTurnover,
    }
};

