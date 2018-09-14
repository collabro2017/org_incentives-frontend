import {Moment} from "moment";
import {InterestRates} from "../data/interest-rates";
import blackScholes from "../data/black-scholes";
import {ExternalParameters} from "../data/data";
import moment from "moment";

const lengthInYears = 4; // Må kalkuleres fra lengden på opsjonen
//const lengthInYears = 4.12594113621; // Må kalkuleres fra lengden på opsjonen

const volatilityRate = 0.88;
const getExternalParameters = (): ExternalParameters => {
    return {
        volatilityRate: 0.88, // Bestemt av dato og aksjehistorikk
        stockPrice: 1.55, // Dato

        // http://www.norges-bank.no/Statistikk/apne-data/tilgjengelige-data/
        interestRate: 0.0074, //125, // Startdato (16.02), og historikk
    };
};

const getPreviousWeekday = (date: Moment) => {
    const weekday = moment(date);
    if (weekday.isoWeekday() === 6 || weekday.isoWeekday() === 7) {
        weekday.subtract(weekday.isoWeekday() - 5, 'days');
    }
    return weekday;
};


const calcInterestRate = (interestRates: InterestRates[], txDate: Moment, numberOfYears: number): number => {
    const txDateCopy = moment(txDate);
    const interestDate = interestRates.filter((ir) => moment(ir.date).diff(txDateCopy, 'days') === 0)[0];
    const {
        rate3Year, rate5Year, rate10Year,
        rate12Months, rate9Months, rate6Months, rate3Months
    } = interestDate;

    if (numberOfYears >= 5 && numberOfYears < 10) {
        return ((((rate10Year - rate5Year) / 5) * (numberOfYears - 5)) + rate5Year) / 100;
    }

    if (numberOfYears >= 3 && numberOfYears < 5) {
        return ((((rate5Year - rate3Year) / 2) * (numberOfYears - 3)) + rate3Year) / 100;
    }

    if (numberOfYears >= 1 && numberOfYears < 3) {
        return ((((rate3Year - rate12Months) / 2) * (numberOfYears - 1)) + rate12Months) / 100;
    }
    return NaN;
};

const sharePriceAtDate = (prices: any[], date: Moment): number => {
    const datePrice = prices.filter((price) => price.date.diff(date, 'days') === 0)[0];
    return (datePrice && datePrice.price) || NaN;
};

const calcLengthInYears = (from: Moment, to: Moment): number => {
    let diffInYears = to.diff(from, 'years', true);
    return diffInYears;
};

const exerciseDate = (from: Moment, days: number): Moment => {
    const years = Math.floor(days / 365);
    const remainingDays = days - (years * 365);
    return moment(from).add(years, 'years').add(remainingDays, 'days');
};

const bs = (stockPrice: number, interestRate: number, volatilityRate: number, strikePrice: number, timeToExpirationInYears: number): number => {
    //return blackScholes("call", params.sharePrice, strikePrice, timeToExpirationInYears, params.interestRate, params.volatilityRate);
    return blackScholes("call", stockPrice, strikePrice, timeToExpirationInYears, interestRate, volatilityRate);
};