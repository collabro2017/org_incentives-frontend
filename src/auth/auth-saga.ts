import { call, put, takeEvery } from "redux-saga/effects";
import { clearLoginStateFromLocalStorage, parseAuthUrl, setSession, showLock } from "./auth";
import Raven from "raven-js";
import { Auth0LockPasswordless } from 'auth0-lock';
import {userMetadata} from "../reducers/user";

function* parseAuthHash() {
    try {
        const authResult = yield call(parseAuthUrl);
        setSession(authResult);
        yield put({type: 'PARSE_AUTH_HASH_SUCCEEDED', authResult });

        // Må cleares ved logout eller sesjonstimout hvis det skal brukes
        // const { idTokenPayload } = authResult;
        // Raven.setExtraContext({
        //     name: idTokenPayload && userMetadata(idTokenPayload).name,
        // })
    } catch (e) {
        Raven.captureException(e);
        yield put({type: 'PARSE_AUTH_HASH_FAILED', message: e});
    }
}

export function* watchParseAuthHash() {
    yield takeEvery('PARSE_AUTH_HASH', parseAuthHash)
}

export function* showLoginDialog() {
    showLock();
}

export function* watchLoginRequested() {
    yield takeEvery('LOGIN_REQUESTED', showLoginDialog)
}

export function* logout() {
    clearLoginStateFromLocalStorage();
}

export function* watchLogoutRequested() {
    yield takeEvery('LOGOUT_REQUESTED', logout)
}
