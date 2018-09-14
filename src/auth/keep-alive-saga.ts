import { call, put, takeEvery } from "redux-saga/effects";
import { setSession, updateSession } from "./auth";
import Raven from "raven-js";
import { FETCH_TENANT_ORDERS_SUCCEEDED } from "../admin/orders/orders-actions";
import { POST_AWARD_SUCCEEDED } from "../awards/award-actions";
import { POST_EMPLOYEE_SUCCEEDED } from "../employees/employee-actions";
import { POST_SUBPROGRAM_SUCCEEDED } from "../subprograms/subprogram-actions";
import { POST_SHARE_PRICE_SUCCEEDED } from "../share-price/share-price-actions";
import { POST_TENANT_SUCCEEDED } from "../tenant/tenant-actions";
import { POST_PROGRAM_SUCCEEDED } from "../programs/program-actions";

export const KEEP_ALIVE_ACTION = 'KEEP_ALIVE';

function* keepAlive() {
    try {
        const authResult = yield call(updateSession);
        yield call(setSession, authResult);
        yield put({ type: 'PARSE_AUTH_HASH_SUCCEEDED', authResult });
    } catch (e) {
        Raven.captureException(e);
        yield put({ type: 'KEEP_ALIVE_FAILED', message: e });
    }
}

export function* watchKeepAlive() {
    yield [
        takeEvery(KEEP_ALIVE_ACTION, keepAlive),
        takeEvery(FETCH_TENANT_ORDERS_SUCCEEDED, keepAlive),
        takeEvery(POST_AWARD_SUCCEEDED, keepAlive),
        takeEvery(POST_EMPLOYEE_SUCCEEDED, keepAlive),
        takeEvery(POST_SUBPROGRAM_SUCCEEDED, keepAlive),
        takeEvery(POST_PROGRAM_SUCCEEDED, keepAlive),
        takeEvery(POST_SHARE_PRICE_SUCCEEDED, keepAlive),
        takeEvery(POST_TENANT_SUCCEEDED, keepAlive),
    ]
}
