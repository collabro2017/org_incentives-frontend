const { syncTexts } = require("./sync-texts");
const { Client } = require('pg');
const localTexts = require('../../src/texts/texts');

const testDbConfig = require('./test-env');

const client = new Client(testDbConfig);

syncTexts(client, localTexts);
