import { call, put, select, takeEvery } from "redux-saga/effects";
import {callApi, NOT_AUTHORIZED} from "../api/api-helper";
import Raven from "raven-js";
import * as selectors from "./tenant-selectors";
import {
    DELETE_TENANT,
    DELETE_TENANT_FAILED, DELETE_TENANT_SUCCEEDED,
    FETCH_TENANTS, FETCH_TENANTS_FAILED, FETCH_TENANTS_SUCCEEDED,
    POST_TENANT, POST_TENANT_FAILED, POST_TENANT_SUCCEEDED,
    PUT_TENANT, PUT_TENANT_FAILED, PUT_TENANT_SUCCEEDED, SELECT_TENANT
} from "./tenant-actions";

const TENANTS_REQUEST_URL = "/tenants";

function* fetchTenantsRequested(action) {
    try {
        const token = yield select(selectors.token);

        const tenantResponse = yield call(() => callApi(TENANTS_REQUEST_URL, token));
        yield put({ type: FETCH_TENANTS_SUCCEEDED, tenants: tenantResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put({ type: FETCH_TENANTS_FAILED, message: e.message });
        }
    }
}

export function* watchFetchTenants() {
    yield takeEvery(FETCH_TENANTS, fetchTenantsRequested);
}

function* postTenantRequested(action) {
    try {
        const token = yield select(selectors.token);
        const method = 'POST';

        const tenantResponse = yield call(() => callApi(TENANTS_REQUEST_URL, token, method, action.tenant));
        yield put({ type: POST_TENANT_SUCCEEDED, tenant: tenantResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: POST_TENANT_FAILED, message: e.message });
        }
    }
}

export function* watchPostTenant() {
    yield takeEvery(POST_TENANT, postTenantRequested);
}

function* putTenantRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.tenantId);
       const method = 'PUT';

       const tenantResponse = yield call(() => callApi(TENANTS_REQUEST_URL + '/' + tenantId + '?tenantId=' + tenantId, token, method, action.selectedTenant));
       yield put ({ type: PUT_TENANT_SUCCEEDED, selectedTenant: tenantResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: PUT_TENANT_FAILED, message: e.message });
        }
    }
}

export function* watchPutTenant() {
    yield takeEvery(PUT_TENANT, putTenantRequested);
}

function* storeInLocalStorage() {
    const tenant = yield select(selectors.tenant);
    localStorage.setItem('selectedTenant', JSON.stringify(tenant));
}

export function* watchSelectTenant() {
    yield takeEvery(SELECT_TENANT, storeInLocalStorage);
}

export function* watchPutTenantSucceeded() {
    yield takeEvery(PUT_TENANT_SUCCEEDED, storeInLocalStorage);
}

function* deleteTenantRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.tenantId);
        const method = 'DELETE';

        yield call(() => callApi(TENANTS_REQUEST_URL + '/' + tenantId, token, method));
        yield put ({ type: DELETE_TENANT_SUCCEEDED, tenantId });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: DELETE_TENANT_FAILED, message: e.message });
        }
    }
}

export function* watchDeleteTenant() {
    yield takeEvery(DELETE_TENANT, deleteTenantRequested);
}

function* deleteInLocalStorage() {
    localStorage.removeItem('selectedTenant');
}

export function* watchDeleteTenantSucceeded() {
    yield takeEvery(DELETE_TENANT_SUCCEEDED, deleteInLocalStorage);
}

