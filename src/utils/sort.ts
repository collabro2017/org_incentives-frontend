import { isMoment } from "moment";

export function sortBy<T> (propertyName: string, data: Array<T>): Array<T> {
    return data.sort((a, b) => {
        const aElement = a[propertyName];
        const bElement = b[propertyName];
        return compare(aElement, bElement);
    })
}

export const sortMultipleLevels = <T>(data: Array<T>) =>
    (propertyName: string, ...restProperties): Array<T> =>
        data.sort((a, b) => compareDeep(a, b, propertyName, ...restProperties));

const compareDeep = (a: any, b: any, propertyName: string, ...restProperties): number => {
    const result = compare(a[propertyName], b[propertyName]);

    if (result === 0 && restProperties.length > 0) {
        const [next, ...rest] = restProperties;
        return compareDeep(a, b, next, ...rest);
    }

    return result;
};

export const compare = (a: any, b: any): number => {
    if (typeof a === 'string') {
        return a.localeCompare(b);
    } else if (typeof a === 'number') {
        return a - b;
    } else if (isMoment(a || isMoment(b))){
        if (isMoment(a) && isMoment(b)) {
            return a.diff(b);
        } else if (isMoment(a)) {
            return 1;
        } else {
            return -1;
        }
    } else if (typeof a === 'boolean'){
        if (a && a !== b) {
            return 1;
        } else if (b && b !== a) {
            return -1;
        } else {
            return 0;
        }
    } else {
        console.log(`Comparing/sorting not possible for type ${typeof a}`);
        return 0;
    }
}

export interface SortState {
    column?: string,
    data: any[],
    direction: 'ascending' | 'descending',
}

export const handleSortFunction = (clickedColumn: string, sortState: SortState) => (): SortState => {
    const { column, data, direction } = sortState;

    if (column !== clickedColumn) {
        return {
            column: clickedColumn,
            data: sortBy(clickedColumn, data),
            direction: 'ascending',
        };
    } else {
        return {
            data: data.reverse(),
            direction: direction === 'ascending' ? 'descending' : 'ascending',
        }
    }
};