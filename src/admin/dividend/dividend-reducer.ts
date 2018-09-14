import { Reducer } from "redux";
import { ActionType, getType } from 'typesafe-actions';
import * as dividendActions from './dividend-action-creators';

export type DividendAction = ActionType<typeof dividendActions>;

export interface Dividend {
    dividend_date: string,
    dividend_per_share: string,
    share_price_at_dividend_date: string,
}

export interface DividendState {
    dividends: Dividend[]
    isFetchingDividends: boolean,
}

const initialState: DividendState = {
    dividends: [],
    isFetchingDividends: false,
};

const dividendReducer = (state: DividendState = initialState, action: DividendAction) => {
    switch (action.type) {
        case getType(dividendActions.fetchDividendsAction):
            return { ...state, isFetchingDividends: true };
        case getType(dividendActions.fetchDividendsSucceededAction):
            return { ...state, isFetchingDividends: false, dividends: action.payload };
        case getType(dividendActions.createDividendAction):
            return { ...state, isFetchingDividends: true };
        case getType(dividendActions.createDividendSucceededAction):
            console.log(action);
            return { ...state, isFetchingDividends: false, dividends: [...state.dividends, action.payload] };
    }
    return state;
};

export default dividendReducer;
