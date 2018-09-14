import { call, put, select, takeEvery } from "redux-saga/effects";
import { callApi } from "../api/api-helper";
import { FETCH_EMPLOYEE_PORTAL_TEXTS_SUCCEEDED } from "./employee-portal-texts-reducer";
import Raven from "raven-js";

const TEXTS_URL = '/texts';

export function* fetchTexts() {
    try {
        const state = yield select();
        const token = state.user.token;

        const response = yield call(() => callApi(TEXTS_URL, token));
        yield put ({ type: FETCH_EMPLOYEE_PORTAL_TEXTS_SUCCEEDED, messages: response.data });
    } catch (e) {
        Raven.captureException(e);
    }
}
