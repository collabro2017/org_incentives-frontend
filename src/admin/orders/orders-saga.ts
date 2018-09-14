import { call, put, select, takeEvery } from "redux-saga/effects";
import { callApi, NOT_AUTHORIZED } from "../../api/api-helper";
import * as selectors from "./orders-selectors";
import Raven from "raven-js";
import {
    FETCH_TENANT_ORDERS, FETCH_TENANT_ORDERS_FAILED, FETCH_TENANT_ORDERS_SUCCEEDED, PUT_TENANT_ORDERS,
    PUT_TENANT_ORDERS_FAILED, PUT_TENANT_ORDERS_SUCCEEDED
} from "./orders-actions";


const ORDERS_REQUEST_URL = "/orders?tenantId=";
const PUT_ORDERS_REQUEST_URL = "/orders/";


function* fetchTenantsOrdersRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);

        const ordersResponse = yield call(() => callApi(ORDERS_REQUEST_URL + tenantId, token));
        yield put ({ type: FETCH_TENANT_ORDERS_SUCCEEDED, orders: ordersResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else if (e.errorMessage) {
            Raven.captureException(e.errorMessage);
            yield put ({ type: FETCH_TENANT_ORDERS_FAILED, message: e.message });
        }
    }
}

export function* watchFetchTenantsOrders() {
    yield takeEvery(FETCH_TENANT_ORDERS, fetchTenantsOrdersRequested)
}

function* putTenantsOrdersRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const orderId = action.orderId;
        const method = "PUT";

        const ordersResponse = yield call(() => callApi(PUT_ORDERS_REQUEST_URL + orderId + "?tenantId=" + tenantId, token, method, action.updateOrder));
        yield put ({ type: PUT_TENANT_ORDERS_SUCCEEDED, order: ordersResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else if (e.errorMessage) {
            Raven.captureException(e.errorMessage);
            yield put ({ type: PUT_TENANT_ORDERS_FAILED, message: e.message });
        }
    }
}

export function* watchPutTenantsOrders() {
    yield takeEvery(PUT_TENANT_ORDERS, putTenantsOrdersRequested)
}