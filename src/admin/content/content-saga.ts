import { call, put, select, takeEvery } from "redux-saga/effects";
import * as selectors from "../orders/orders-selectors";
import { callApi, NOT_AUTHORIZED } from "../../api/api-helper";
import {
    FETCH_CONTENTS,
    FETCH_CONTENTS_FAILED,
    FETCH_CONTENTS_SUCCEEDED,
    UPDATE_CONTENT, UPDATE_CONTENT_FAILED,
    UPDATE_CONTENT_SUCCEEDED
} from "./content-actions";
import Raven from "raven-js";
import { Content } from "./content-reducer";

const fetchContentsUrl = (tenantId: string) => `/content_templates?tenantId=${tenantId}`;
const updateContentUrl = (tenantId: string, contentId: string) => `/content_templates/${contentId}?tenantId=${tenantId}`;


function* fetchContentsRequested() {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.tenantId);

        const response = yield call(() => callApi(fetchContentsUrl(tenantId), token));
        yield put ({ type: FETCH_CONTENTS_SUCCEEDED, contents: response.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else if (e.errorMessage) {
            Raven.captureException(e.errorMessage);
            yield put ({ type: FETCH_CONTENTS_FAILED, message: e.message });
        }
    }
}

export function* watchFetchContent() {
    yield takeEvery(FETCH_CONTENTS, fetchContentsRequested)
}

export interface ContentUpdateObject {
    name?: string,
    description?: string,
    type?: string,
    content_type?: string,
    raw_content?: string,
}


interface UpdateContentAction {
    type: "UPDATE_CONTENT",
    content_id: string,
    updateObject: ContentUpdateObject
}

function* updateContent(action: UpdateContentAction) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.tenantId);

        const response = yield call(() => callApi(updateContentUrl(tenantId, action.content_id), token, "PUT", action.updateObject));
        yield put ({ type: UPDATE_CONTENT_SUCCEEDED, contents: response.data });
    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });
        } else if (e.errorMessage) {
            Raven.captureException(e.errorMessage);
            yield put ({ type: UPDATE_CONTENT_FAILED, message: e.message });
        }
    }
}

export function* watchUpdateContent() {
    yield takeEvery(UPDATE_CONTENT, updateContent)
}