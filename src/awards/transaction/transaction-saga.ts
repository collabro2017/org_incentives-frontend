import {all, call, fork, put, select, takeEvery} from "redux-saga/effects";
import { callApi, NOT_AUTHORIZED } from "../../api/api-helper";
import Raven from "raven-js";
import * as selectors from "../award-selectors";
import {
    CREATE_TRANSACTION, CREATE_TRANSACTION_FAILED, CREATE_TRANSACTION_SUCCEEDED,
    UPDATE_TRANSACTION,
    UPDATE_TRANSACTION_FAILED,
    UPDATE_TRANSACTION_SUCCEEDED
} from "./transaction-actions";
import {UpdateTransaction} from "../../reports/reports";
import {CreateTransactionData} from "./create/create-transaction";
import {push} from "react-router-redux";

const updateTransactionUrl = (transactionId: string, tenantId: string) => `/transactions/${transactionId}?tenantId=${tenantId}`;
const createTransactionUrl = (tenantId: string, vesting_event_id: string) => `/transactions?tenantId=${tenantId}&vesting_event_id=${vesting_event_id}`;

interface UpdateTransactionAction {
    type: "UPDATE_TRANSACTION",
    transactions: UpdateTransaction[]
}

function* updateTransaction(action: UpdateTransactionAction) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const method = "PUT";

        const res = yield all(action.transactions.map(t => call(() =>
            callApi(updateTransactionUrl(t.transactionId, tenantId), token, method, { fair_value: t.fair_value })
        )));

        yield put ({ type: UPDATE_TRANSACTION_SUCCEEDED, transactions: res.map(r => r.data) });
        window.location.reload();
    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: UPDATE_TRANSACTION_FAILED, message: e.message });
        }
    }
}

export function* watchUpdateTransaction() {
    yield takeEvery(UPDATE_TRANSACTION, updateTransaction);
}

interface CreateTransactionAction {
    type: "CREATE_TRANSACTION",
    vestingEventId: string,
    redirectAfterSuccessLink?: string,
    payload: CreateTransactionData
}

function* createTransaction(action: CreateTransactionAction) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const method = "POST";

        const res = yield call(callApi, createTransactionUrl(tenantId, action.vestingEventId), token, method, action.payload);

        yield put ({ type: CREATE_TRANSACTION_SUCCEEDED, transaction: res.data });

        if (action.redirectAfterSuccessLink) {
            yield put (push(action.redirectAfterSuccessLink))
        }
    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: CREATE_TRANSACTION_FAILED, message: e.message });
        }
    }
}

export function* watchCreateTransaction() {
    yield takeEvery(CREATE_TRANSACTION, createTransaction);
}

