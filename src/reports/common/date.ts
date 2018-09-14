import {Moment} from "moment";

export interface Interval {
    start: Moment,
    end: Moment,
}

export const overlappingDays = (a: Interval, b: Interval) => {
    if (a.start.isAfter(a.end) || b.start.isAfter(b.end)) {
        // One or both intervals are invalid
        return 0;
    }

    const startOverlap = a.start.isSameOrAfter(b.start) ? a.start : b.start;
    const endOverlap = a.end.isSameOrBefore(b.end) ? a.end : b.end;
    const overlappingDays = endOverlap.diff(startOverlap, "days", null) + 1; // Inclusive
    return Math.max(0, overlappingDays);
};