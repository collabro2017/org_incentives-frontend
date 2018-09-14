import { call, put, select, takeEvery } from "redux-saga/effects";
import { callApi, NOT_AUTHORIZED } from "../api/api-helper";
import Raven from "raven-js";
import { push } from "react-router-redux";
import { RootState } from "../reducers/all-reducers";
import { fetchTexts } from "../texts/employee-portal-texts-saga";

const WELCOME_URL = '/welcomes';

function* fetchWelcome(action) {
    try {
        const beforeState: RootState = yield select();
        const token = beforeState.user.token;
        const welcomeResponse = yield call(() => callApi(WELCOME_URL, token));

        yield call(fetchTexts);
        yield put ({ type: 'FETCH_EMPLOYEE_PORTAL_WELCOME_SUCCEEDED', welcomeData: welcomeResponse.data });
        const afterState: RootState = yield select();
        if (afterState.features.documents && afterState.user.documents.some((doc) => doc.requires_acceptance)) {
            yield put (push("/acceptdocuments"));
        } else if (afterState.features.purchase) {
            const purchase_opportunity = afterState.user.currentPurchaseWindow && afterState.user.currentPurchaseWindow.purchase_opportunity;
            if (purchase_opportunity && purchase_opportunity.purchasedAmount === 0) {
                yield put (push("/purchasepopup"));
            }
        }
    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });
        } else if (e.errorMessage){
            Raven.captureMessage(e.errorMessage);
            yield put ({ type: 'FETCH_EMPLOYEE_PORTAL_WELCOME_FAILED', message: e.message, error: e });
        } else {
            Raven.captureException(e);
            yield put ({ type: 'FETCH_EMPLOYEE_PORTAL_WELCOME_FAILED', message: e.message, error: e });
        }
    }
}

export function* watchFethEmployeePortalWelcome() {
    yield takeEvery('FETCH_EMPLOYEE_PORTAL_WELCOME', fetchWelcome)
}