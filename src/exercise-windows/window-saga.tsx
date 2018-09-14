import { call, put, select, takeEvery } from "redux-saga/effects";
import { callApi, NOT_AUTHORIZED } from "../api/api-helper";
import Raven from "raven-js";
import * as selectors from "./window-selectors";
import {
    DELETE_WINDOW, DELETE_WINDOW_FAILED, DELETE_WINDOW_SUCCEEDED,
    FETCH_WINDOW, FETCH_WINDOW_FAILED, FETCH_WINDOW_SUCCEEDED,
    POST_WINDOW, POST_WINDOW_FAILED, POST_WINDOW_SUCCEEDED,
    PUT_WINDOW, PUT_WINDOW_FAILED, PUT_WINDOW_SUCCEEDED,
} from "./window-actions";


const EXERCISE_WINDOW_URL = '/windows?tenantId=';
const OPTIONS_EXERCISE_WINDOW_URL = '/windows/';


function* postExerciseWindowRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const method = 'POST';

        const windowResponse = yield call(() => callApi(EXERCISE_WINDOW_URL + tenantId, token, method, action.window));
        yield put ({ type: POST_WINDOW_SUCCEEDED, window: windowResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: POST_WINDOW_FAILED, message: e.message });
        }
    }
}

export function* watchPostExerciseWindow() {
    yield takeEvery(POST_WINDOW, postExerciseWindowRequested);
}

function* fetchExerciseWindowRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);

        const windowResponse = yield call(() => callApi(EXERCISE_WINDOW_URL + tenantId, token));
        yield put ({ type: FETCH_WINDOW_SUCCEEDED, windows: windowResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: FETCH_WINDOW_FAILED, message: e.message });
        }
    }
}

export function* watchFetchExerciseWindow() {
    yield takeEvery(FETCH_WINDOW, fetchExerciseWindowRequested);
}

function* deleteExerciseWindowRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const windowId = action.windowId;
        const method = 'DELETE';

       yield call(() => callApi(OPTIONS_EXERCISE_WINDOW_URL + windowId + "?tenantId=" + tenantId, token, method));
       yield put ({ type: DELETE_WINDOW_SUCCEEDED, windowId });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: DELETE_WINDOW_FAILED, message: e.message });
        }
    }
}

export function* watchDeleteExerciseWindow() {
    yield takeEvery(DELETE_WINDOW, deleteExerciseWindowRequested);
}

function* putExerciseWindowRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const windowId = action.windowId;
        const method = "PUT";

        const windowResponse = yield call(() => callApi(OPTIONS_EXERCISE_WINDOW_URL + windowId + "?tenantId=" + tenantId, token, method, action.window));
        yield put ({ type: PUT_WINDOW_SUCCEEDED, window: windowResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: "USER_NOT_AUTHORIZED" });

        } else {
            Raven.captureException(e);
            yield put ({ type: PUT_WINDOW_FAILED, message: e.message })
        }
    }
}

export function* watchPutExerciseWindow() {
    yield takeEvery(PUT_WINDOW, putExerciseWindowRequested);
}
