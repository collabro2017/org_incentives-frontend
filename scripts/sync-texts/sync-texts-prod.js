const { syncTexts } = require("./sync-texts");
const { Client } = require('pg');
const localTexts = require('../../src/texts/texts');

const productionDbConfig = require('./production-env');

const client = new Client(productionDbConfig);

syncTexts(client, localTexts);
