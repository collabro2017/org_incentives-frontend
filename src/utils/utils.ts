import numeral from "numeral";
import moment, { Moment } from "moment";
import { Employee } from "../employees/employee-reducer";

export const formatNumber = (number: number, decimal?: number) => decimal ? `${numeral(number).format('0,0')} ${decimal}` : numeral(number).format();
export const formatPercentage = (number: number | string) => numeral(number).format('0 %');
export const formatCurrency = (number: number, currency?: string) => currency ? `${numeral(number).format('0,0.000')} ${currency}` : numeral(number).format('0,0.000 $');
export const formatCurrency2Decimals = (number: number, currency?: string) => currency ? `${numeral(number).format('0,0.00')} ${currency}` : numeral(number).format('0,0.00 $');
export const formatSharePrice = (number: number, currency?: string) => currency ? `${numeral(number).format('0,0.000')} ${currency}` : numeral(number).format('0,0.000 $');

export const formatShortDate = (date: string | Moment) => moment(date).format(norwegianShortDate);
export const formatLongDate = (date: string | Moment) => moment(date).format("ll");

// For use in reduce functions to sum the value of a property
export const sum = (propertyKey) => (accumulator, previous) => previous[propertyKey] + accumulator;
export const sumNumbers = (accumulator, previous) => previous + accumulator;

export const flatten = (list: Array<any>) => list.reduce(
    (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
);

export const norwegianShortDate = "DD.MM.YY";
export const norwegianShortDateLongYear = "DD.MM.YYYY";
export const norwegianLongDate = "DD.MM.YY HH:mm";
export const apiShortDate = "YYYY-MM-DD";

export const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export const removeDuplicates = (array, property) => array.filter(
    (obj, pos, arr) => arr.map(
        mapObj => mapObj[property]).indexOf(obj[property]) === pos
    );

export const changePunctuationForComma = (string: string) => string.replace('.', ',');
export const changeCommaForPunctuation = (string: string) => string.replace(',', '.');

export const prepareDateForBackend = (date: string | Moment) => moment(date).format(apiShortDate);


export const employeeName = (employee: Employee) => `${employee.firstName} ${employee.lastName}`;

export const sortAlphabetically = (property: string) => (objectA: any, objectB: any) => {
    const a = objectA[property];
    const b = objectB[property];

    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
};

export const replaceAll = (string, search, replacement) => string.split(search).join(replacement);

export const yesOrNo = (value: boolean): string => value ? "Yes" : "No";
