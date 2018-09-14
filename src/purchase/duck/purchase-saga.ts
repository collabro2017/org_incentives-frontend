import { call, put, select, takeEvery } from "redux-saga/effects";
import { callApi, NOT_AUTHORIZED } from "../../api/api-helper";
import * as selectors from "../../awards/award-selectors";
import {
    CREATE_PURCHASE_ORDER, CREATE_PURCHASE_ORDER_FAILED, CREATE_PURCHASE_ORDER_SUCCEEDED,
    FETCH_PURCHASE_DOCUMENT,
    FETCH_PURCHASE_DOCUMENT_FAILED,
    FETCH_PURCHASE_DOCUMENT_SUCCEEDED
} from "./purchase-actions";
import Raven from "raven-js";
import { push } from "react-router-redux";

const fetchDocumentUrl = (documentId: string) => `/documents/${documentId}`;
const createPurchaseOrderUrl = `/orders`;

function* fetchPurchaseDocument(action) {
    try {
        const token = yield select(selectors.token);
        const response = yield call(callApi, fetchDocumentUrl(action.documentId), token, 'GET');
        yield put ({ type: FETCH_PURCHASE_DOCUMENT_SUCCEEDED, document: response.data });
    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: FETCH_PURCHASE_DOCUMENT_FAILED, message: e.message });
        }
    }
}

export function* watchFetchPurchaseDocument() {
    yield takeEvery(FETCH_PURCHASE_DOCUMENT, fetchPurchaseDocument)
}

export enum OrderType {
    PURCHASE = "PURCHASE", EXERCISE = "EXERCISE"
}

interface CreatePurchaseOrder {
    order_type: "PURCHASE",
    data: {
        purchase_amount: number,
        purchase_opportunity_id: string,
        share_depository_account?: string,
    }
}

function* createPurchaseOrder(action) {
    try {
        const token = yield select(selectors.token);
        const body: CreatePurchaseOrder = {
            order_type: OrderType.PURCHASE,
            data: {
                purchase_amount: action.purchase_amount,
                purchase_opportunity_id: action.purchase_opportunity_id,
                share_depository_account: action.share_depository_account,
            }
        };
        const response = yield call(callApi, createPurchaseOrderUrl, token, 'POST', body);
        yield put ({ type: CREATE_PURCHASE_ORDER_SUCCEEDED, document: response.data });
        yield put ({ type: "FETCH_EMPLOYEE_PORTAL_WELCOME" });
        yield put (push("/orders/purchasecomplete"));
    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: CREATE_PURCHASE_ORDER_FAILED, message: e.message });
        }
    }
}


export function* watchCreatePurchaseOrder() {
    yield takeEvery(CREATE_PURCHASE_ORDER, createPurchaseOrder)
}