import Papa from "papaparse";
import moment, { Moment } from "moment";

Papa.SCRIPT_PATH = '../node_modules/papaparse/papaparse.js';

export interface InterestRates {
    date: Moment;
    rate3Year: number;
    rate5Year: number;
    rate10Year: number;
    rate3Months: number;
    rate6Months: number;
    rate9Months: number;
    rate12Months: number;
}

export interface InterestRatesGBON {
    date: Moment;
    rate3Year: number;
    rate5Year: number;
    rate10Year: number;
}

export interface InterestRatesTBIL {
    date: Moment;
    rate3Months: number;
    rate6Months: number;
    rate9Months: number;
    rate12Months: number;
}

export const fetchInterestRatesGBON = (): Promise<InterestRatesGBON[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse("https://data.norges-bank.no/api/data/IR/B.GBON..R?format=csv-:-comma-true-y&startPeriod=2016", {
            download: true,
            complete: function(data) {
                const validEntries = data.data.filter((entry) => moment(entry[0]).isValid());
                const sanitized = validEntries.map((entry) =>({
                    date: moment(entry[0]),
                    rate10Year: parseFloat(entry[1]),
                    rate3Year: parseFloat(entry[2]),
                    rate5Year: parseFloat(entry[3]),
                }));
                resolve(sanitized);
            }
        })
    });
};

export const fetchInterestRatesTBIL = (): Promise<InterestRatesTBIL[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse("https://data.norges-bank.no/api/data/IR/B.TBIL..R?format=csv-:-comma-true-y&startPeriod=2016", {
            download: true,
            complete: function(data) {
                const validEntries = data.data.filter((entry) => moment(entry[0]).isValid());
                const sanitized = validEntries.map((entry) =>({
                    date: moment(entry[0]),
                    rate12Months: parseFloat(entry[1]),
                    rate6Months: parseFloat(entry[2]),
                    rate9Months: parseFloat(entry[3]),
                    rate3Months: parseFloat(entry[4]),
                }));
                resolve(sanitized);
            }
        })
    });
};


export const fetchInterestRates = (): Promise<InterestRates[]> => {
    return Promise.all([fetchInterestRatesTBIL(), fetchInterestRatesGBON()])
        .then(([tbil, gbon]) => {
            return gbon.map((gbonEntry, index) => {
                if (gbonEntry.date.diff(tbil[index].date, 'days') === 0) {
                    return Object.assign(gbonEntry, tbil[index]);
                } else {
                    return Object.assign(gbonEntry, tbil[index]);
                }
            });
        });
};

