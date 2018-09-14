const fetch = require("isomorphic-fetch");
const moment = require("moment");

const parseJson = (response) => response.json();
const checkStatus = (response) => {
    if (!response.ok) {
        console.log(response);
        throw Error(response.statusText);
    }
    return response;
};

const logAndContinue = (object) => {
    console.log(object);
    return object;
};

function sortBy(propertyName, data) {
    return data.sort((a, b) => b[propertyName].diff(a[propertyName]))
}

const todaysEntry = (result) => {
    const daily = result['Time Series (Daily)'];

    const entries = Object.keys(daily).map((key) => ({
        date: moment(key, "YYYY-MM-DD"),
        close: parseFloat(daily[key]['4. close'])
    }));

    console.log(entries);
    const mostRecentFirst = sortBy('date', entries);

    console.log(mostRecentFirst);
    console.log(mostRecentFirst[0]);

    return mostRecentFirst[0];
};


const fetchStockPriceFromAlphaVantage = (ticker) =>
    fetch('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=' + ticker + '&apikey=KWV1Y5ZP4KJCS776')
        .then(checkStatus)
        .then(parseJson)
        .then(logAndContinue)
        .then(todaysEntry)
        .then(logAndContinue)
        .then((entry) => ({
            price: entry.close,
            date: entry.date.format("YYYY-MM-DD"),
            manual: false
        }))
        .then(logAndContinue)
        .catch(error => console.log(error));

fetchStockPriceFromAlphaVantage('TOBII.ST');

