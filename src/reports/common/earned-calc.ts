import {Moment} from "moment";

export interface EarningDates {
    startDate: Moment,
    endDate: Moment,
    expiryDate: Moment,
}

export const earnedRateAtDate = (line: EarningDates, date: Moment): {rate: number, days: number } => {
    const fromStartToEnd = Math.max(0, line.endDate.diff(line.startDate, 'days')) + 1;
    const fromGrantToDate = Math.max(0, date.diff(line.startDate, 'days') + 1);
    const days = Math.min(fromStartToEnd, fromGrantToDate);
    return {
        rate: days / fromStartToEnd,
        days: days,
    };
};

export const calcEarnedRate = (grantDate: Moment, vestingDate: Moment, daysOfPeriod: number): number => {
    const fromStartToEnd = Math.max(0, vestingDate.diff(grantDate, 'days')) + 1;
    return daysOfPeriod / fromStartToEnd;
};
