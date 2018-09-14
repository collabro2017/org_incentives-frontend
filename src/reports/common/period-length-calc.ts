import {Moment} from "moment";
import {Interval, overlappingDays} from "./date";
import {apiShortDate} from "../../utils/utils";


interface PeriodLengths {
    obDays: number,
    periodDays: number,
    cbDays: number,
    unamortizedDays: number,
}

export const calcPeriodLengths = (grantDate: Moment, vestingDate: Moment, dayBeforeOB: Moment, cbDate: Moment, mobilityInterval: Interval): PeriodLengths => {
    const obEndDate = dayBeforeOB.isBefore(vestingDate) ? dayBeforeOB : vestingDate;
    const grantToOBInterval: Interval = { start: grantDate, end: obEndDate};
    const obDays = overlappingDays(grantToOBInterval, mobilityInterval);

    const endOfCostForThisPeriod = cbDate.isBefore(vestingDate) ? cbDate : vestingDate;
    const grantToEnd: Interval = { start: grantDate, end: endOfCostForThisPeriod};
    const cbDays = overlappingDays(grantToEnd, mobilityInterval);
    const periodDays = cbDays - obDays;

    const grantToVesting: Interval = { start: grantDate, end: vestingDate};
    const totalDaysForThisMobility = overlappingDays(grantToVesting, mobilityInterval);

    const unamortizedDays = totalDaysForThisMobility - cbDays;

    return {
        obDays,
        periodDays,
        cbDays,
        unamortizedDays,
    }
};
