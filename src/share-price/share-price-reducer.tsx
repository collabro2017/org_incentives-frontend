import { Moment } from "moment";
import {
    DELETE_SHARE_PRICE, DELETE_SHARE_PRICE_SUCCEEDED,
    FETCH_SHARE_PRICE, FETCH_SHARE_PRICE_SUCCEEDED,
    POST_SHARE_PRICE, POST_SHARE_PRICE_SUCCEEDED
} from "./share-price-actions";
import { Reducer } from "redux";
import { TenantState } from "../tenant/tenant-reducer";

export interface SharePrice {
    id?: string
    price: string,
    date: Moment,
    created_at?: string,
    manual: boolean,
    message: string
}

export interface SharePriceState {
    allSharePrice: SharePrice[],
    sharePrice?: SharePrice,
    isFetching: boolean
}

const initialState: SharePriceState = {
    allSharePrice: [],
    sharePrice: null,
    isFetching: false
};


const sharePriceReducer: Reducer<SharePriceState> = (state = initialState, action) => {
    if (action.type === POST_SHARE_PRICE) {
        return { ...state, ...{ isFetching: true } }
    }
    if (action.type === POST_SHARE_PRICE_SUCCEEDED) {
        return { ...state, allSharePrice: [...state.allSharePrice, action.sharePrice], isFetching: false }
    }

    if (action.type === FETCH_SHARE_PRICE) {
        return { ...state, ...{ isFetching: true } }
    }

    if (action.type === FETCH_SHARE_PRICE_SUCCEEDED) {
        return { ...state, ...{ allSharePrice: action.sharePrices }, isFetching: false }
    }

    if (action.type === DELETE_SHARE_PRICE) {
        return { ...state, ...{ isFetching: true } }
    }

    if (action.type === DELETE_SHARE_PRICE_SUCCEEDED) {
        const allSharePrice = state.allSharePrice.filter((sharePrice) => sharePrice.id !== action.sharePriceId);
        return { ...state, allSharePrice: [...allSharePrice], isFetching: false }
    }

    return state;
};

export default sharePriceReducer;

