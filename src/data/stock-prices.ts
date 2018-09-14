import Papa from "papaparse";

Papa.SCRIPT_PATH = '../node_modules/papaparse/papaparse.js';

export const fetchStockPrices = (cb) => Papa.parse("http://www.netfonds.no/quotes/paperhistory.php?paper=AXA.OSE&csv_format=csv", {
    download: true,
    header: true,
    complete: function(data) {
        cb(data);
    }
});
