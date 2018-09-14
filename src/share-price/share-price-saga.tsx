import { call, put, select, takeEvery } from "redux-saga/effects";
import {callApi, NOT_AUTHORIZED} from "../api/api-helper";
import Raven from "raven-js";
import * as selectors from "./share-price-selectors";
import {
    DELETE_SHARE_PRICE,
    DELETE_SHARE_PRICE_FAILED, DELETE_SHARE_PRICE_SUCCEEDED,
    FETCH_SHARE_PRICE, FETCH_SHARE_PRICE_FAILED, FETCH_SHARE_PRICE_SUCCEEDED,
    POST_SHARE_PRICE, POST_SHARE_PRICE_FAILED, POST_SHARE_PRICE_SUCCEEDED
} from "./share-price-actions";

const SHARE_PRICE_REQUEST_URL = "/stock_prices?tenantId=";
const DELETE_SHARE_PRICE_REQUEST_URL = "/stock_prices/";


function* postSharePriceRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const method = 'POST';

        const sharePriceResponse = yield call(() => callApi(SHARE_PRICE_REQUEST_URL + tenantId, token, method, action.sharePrice));
        yield put ({ type: POST_SHARE_PRICE_SUCCEEDED, sharePrice: sharePriceResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: POST_SHARE_PRICE_FAILED, message: e.message });
        }
    }
}

export function* watchPostSharePrice() {
    yield takeEvery (POST_SHARE_PRICE, postSharePriceRequested);
}

function* fetchSharePriceRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);

      const sharePriceResponse = yield call(() => callApi(SHARE_PRICE_REQUEST_URL + tenantId, token));
      yield put ({ type: FETCH_SHARE_PRICE_SUCCEEDED, sharePrices: sharePriceResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: FETCH_SHARE_PRICE_FAILED, message: e.message });
        }
    }
}

export function* watchFetchSharePrice() {
    yield takeEvery (FETCH_SHARE_PRICE, fetchSharePriceRequested);
}

function* deleteSharePriceRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const sharePriceId = action.sharePriceId;
        const method = 'DELETE';

        yield call(() => callApi(DELETE_SHARE_PRICE_REQUEST_URL + sharePriceId + "?tenantId=" + tenantId, token, method));
        yield put ({ type: DELETE_SHARE_PRICE_SUCCEEDED, sharePriceId });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: DELETE_SHARE_PRICE_FAILED, message: e.message });
        }
    }
}

export function* watchDeleteSharePrice() {
    yield takeEvery(DELETE_SHARE_PRICE, deleteSharePriceRequested);
}