import {
    FETCH_DOCUMENTS, FETCH_DOCUMENTS_FAILED, FETCH_DOCUMENTS_SUCCEEDED
} from "../files/files-actions";
import { call, put, select, takeEvery } from "redux-saga/effects";
import * as selectors from "../employees/employee-selectors";
import Raven from "raven-js";
import { callApi, NOT_AUTHORIZED } from "../api/api-helper";
import { APIEmployeeDocument } from "../files/files-reducer";

const FETCH_DOCUMENTS_URL = "/documents";

interface FetchDocumentsResponse {
    data: APIEmployeeDocument[]
}

function* fetchDocuments() {
    const token = yield select(selectors.token);

    try {
        const resultJson: FetchDocumentsResponse = yield call(callApi, FETCH_DOCUMENTS_URL, token);
        yield put ({ type: FETCH_DOCUMENTS_SUCCEEDED, documents: resultJson.data });
    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: FETCH_DOCUMENTS_FAILED, message: e.message });
        }
    }
}

export function* watchFetchDocuments() {
    yield takeEvery(FETCH_DOCUMENTS, fetchDocuments)
}
