import {apiShortDate} from "../../utils/utils";
import {MobilityEntry} from "../../employees/employee-reducer";
import moment, {Moment} from "moment";

export type GroupByProperty<T> = (item: T) => string

export function groupBy<T> (array: T[], groupBy: GroupByProperty<T>) {
    return array.reduce((groups, item): GroupedByLines<T> => {
        console.log(item);
        const val = groupBy(item);
        groups[val] = groups[val] || [];
        groups[val].push(item);
        return groups
    }, {})
}

export interface GroupedByLines<T> {
    [key: string]: T[];
}

export const mobilitiesBeforeDate = (mobilities: MobilityEntry[], date: Moment) => mobilities.filter((m) => moment(m.from_date, apiShortDate).isBefore(date));
