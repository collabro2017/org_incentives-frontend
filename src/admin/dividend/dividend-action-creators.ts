import { Dividend } from "./dividend-reducer";
import { createAction } from 'typesafe-actions';
import {
    CREATE_DIVIDEND, CREATE_DIVIDEND_SUCCEEDED,
    FETCH_DIVIDENDS,
    FETCH_DIVIDENDS_FAILED,
    FETCH_DIVIDENDS_SUCCEEDED
} from "./dividend-actions";

export const fetchDividendsAction = createAction(FETCH_DIVIDENDS);

const fetchDividendsSucceededExecutor = resolve => (dividends: Dividend[]) => resolve(dividends);
export const fetchDividendsSucceededAction = createAction(FETCH_DIVIDENDS_SUCCEEDED, fetchDividendsSucceededExecutor);

export const fetchDividendsFaildAction = createAction(FETCH_DIVIDENDS_FAILED);


const createDividendExecutor = resolve => (dividend: Dividend) => resolve(dividend);
export const createDividendAction = createAction(CREATE_DIVIDEND, createDividendExecutor);

const createDividendSuccededExecutor = resolve => (dividend: Dividend) => resolve(dividend);
export const createDividendSucceededAction = createAction(CREATE_DIVIDEND_SUCCEEDED, createDividendSuccededExecutor);

