import { callApi, Method, NOT_AUTHORIZED } from "../../api/api-helper";
import { call, put, select, takeEvery } from "redux-saga/effects";
import Raven from "raven-js";
import * as selectors from "../orders/orders-selectors";
import {
    CREATE_DIVIDEND, CREATE_DIVIDEND_FAILED, CREATE_DIVIDEND_SUCCEEDED,
    FETCH_DIVIDENDS,
    FETCH_DIVIDENDS_FAILED,
    FETCH_DIVIDENDS_SUCCEEDED
} from "./dividend-actions";
import { dividendsRoute } from "../../menu/menu";
import { push } from "react-router-redux";
import { createDividendSucceededAction, fetchDividendsSucceededAction } from "./dividend-action-creators";
import { Dividend } from "./dividend-reducer";

const dividendsUrl = (tenantId: string) => `/dividends?tenantId=${tenantId}`;

function* fetchDividends() {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.tenantId);

        const response = yield call(() => callApi(dividendsUrl(tenantId), token));
        yield put (fetchDividendsSucceededAction(response.data as Dividend[]));

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else if (e.errorMessage) {
            Raven.captureException(e.errorMessage);
            yield put ({ type: FETCH_DIVIDENDS_FAILED, message: e.message });
        }
    }
}

export function* watchFetchDividends() {
    yield takeEvery(FETCH_DIVIDENDS, fetchDividends)
}

function* createDividend(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.tenantId);

        const response = yield call(() => callApi(dividendsUrl(tenantId), token, Method.POST, action.payload));
        yield put (createDividendSucceededAction(response.data as Dividend));
        yield put (push(dividendsRoute));
    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else if (e.errorMessage) {
            Raven.captureException(e.errorMessage);
            yield put ({ type: CREATE_DIVIDEND_FAILED, message: e.message });
        }
    }
}

export function* watchCreateDividend() {
    yield takeEvery(CREATE_DIVIDEND, createDividend)
}