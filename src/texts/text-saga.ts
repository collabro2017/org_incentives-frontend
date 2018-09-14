import { put, takeEvery, call, select } from "redux-saga/effects";
import * as selectors from "./text-selectors";
import {callApi, NOT_AUTHORIZED} from "../api/api-helper";
import {
    FETCH_TEXTS_SUCCEEDED,
    FETCH_TEXTS_FAILED,
    FETCH_TEXTS,
    PUT_TEXT_SUCCEEDED,
    PUT_TEXT,
    PUT_TEXT_FAILED, UPDATE_DEFAULT_TEXTS, UPDATE_DEFAULT_TEXTS_SUCCEEDED, UPDATE_DEFAULT_TEXTS_FAILED
} from "./text-actions";
import Raven from "raven-js";
import {RootState} from "../reducers/all-reducers";

const TEXTS_CONFIG_REQUEST_URL = "/configs?tenantId=";
const PUT_TEXTS_CONFIG_REQUEST_URL = "/tenants/";
const UPDATE_DEFAULT_TEXTS_URL = "/configs/update_default_config?tenantId=";
const updateDefaultTextsUrl = (tenantId: string) => `/tenants/${tenantId}/update_default_config?tenantId=${tenantId}`;

function* fetchTextsRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);

        const textResponse = yield call(() => callApi(TEXTS_CONFIG_REQUEST_URL + tenantId, token));
        yield put ({ type: FETCH_TEXTS_SUCCEEDED, texts: textResponse.data.tenant && textResponse.data.tenant.texts, defaultTexts: textResponse.data.default.texts });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' })

        } else {
            Raven.captureException(e);
            yield put ({ type: FETCH_TEXTS_FAILED, message: e.message });
        }
    }
}

export function* watchFetchTexts() {
    yield takeEvery(FETCH_TEXTS, fetchTextsRequested);
}

function* putTextRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const method = "PUT";
        const { key, value } = action;
        const texts = yield select(selectors.texts);

        const updatedTexts = { ...texts, [key]: value };

        const textResponse = yield call(() => callApi(PUT_TEXTS_CONFIG_REQUEST_URL + tenantId + "/update_config?tenantId=" + tenantId, token, method, { texts: updatedTexts } ));
        yield put ({ type: PUT_TEXT_SUCCEEDED, texts: textResponse.data.texts });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: PUT_TEXT_FAILED, message: e.message });
        }
    }
}

export function* watchPutText() {
    yield takeEvery(PUT_TEXT, putTextRequested);
}

function* updateDefaultTextsRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const method = "PUT";
        const { key, value } = action;
        const texts = yield select(selectors.defaultTexts);

        const updatedTexts = { ...texts, [key]: value };

        const textResponse = yield call(() => callApi(updateDefaultTextsUrl(tenantId), token, method, { texts: updatedTexts } ));
        yield put ({ type: UPDATE_DEFAULT_TEXTS_SUCCEEDED, texts: textResponse.data.texts });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: UPDATE_DEFAULT_TEXTS_FAILED, message: e.message });
        }
    }
}

export function* watchUpdateDefaultTexts() {
    yield takeEvery(UPDATE_DEFAULT_TEXTS, updateDefaultTextsRequested);
}

