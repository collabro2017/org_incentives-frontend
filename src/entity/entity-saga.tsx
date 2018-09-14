import { all, call, put, select, takeEvery} from "redux-saga/effects";
import { callApi, NOT_AUTHORIZED } from "../api/api-helper";
import * as selectors from "./entity-selectors";
import Raven from "raven-js";
import {
    CREATE_ALL_ENTITIES, CREATE_ALL_ENTITIES_FAILED, CREATE_ALL_ENTITIES_SUCCEEDED,
    DELETE_ALL_ENTITIES, DELETE_ALL_ENTITIES_FAILED, DELETE_ALL_ENTITIES_SUCCEEDED,
    DELETE_ENTITY, DELETE_ENTITY_FAILED, DELETE_ENTITY_SUCCEEDED,
    FETCH_ENTITIES, FETCH_ENTITIES_FAILED, FETCH_ENTITIES_SUCCEEDED,
    POST_ENTITY, POST_ENTITY_FAILED, POST_ENTITY_SUCCEEDED, PUT_ENTITY,
    PUT_ENTITY_FAILED, PUT_ENTITY_SUCCEEDED
} from "./entity-actions";
import {Entity} from "./entity-reducer";

const ENTITIES_REQUEST_URL = "/entities?tenantId=";
const OPTIONS_ENTITY_REQUEST_URL = '/entities/';


export function* fetchEntities() {
    const token = yield select(selectors.token);
    const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);

    const entityResponse = yield call(() => callApi(ENTITIES_REQUEST_URL + tenantId, token));
    yield put ({ type: FETCH_ENTITIES_SUCCEEDED, entities: entityResponse.data });
}

function* fetchEntitiesRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);

        const entityResponse = yield call(() => callApi(ENTITIES_REQUEST_URL + tenantId, token));
        yield put ({ type: FETCH_ENTITIES_SUCCEEDED, entities: entityResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: FETCH_ENTITIES_FAILED, message: e.message });
        }
    }
}

export function* watchFetchEntities() {
    yield takeEvery(FETCH_ENTITIES, fetchEntitiesRequested)
}

function* postEntityRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const method = 'POST';

        const entityResponse = yield call(() => callApi(ENTITIES_REQUEST_URL + tenantId, token, method, action.entity));
        yield put ({ type: POST_ENTITY_SUCCEEDED, entity: entityResponse.data });
    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: POST_ENTITY_FAILED, message: e.message });
        }
    }
}

export function* watchPostEntity() {
    yield takeEvery(POST_ENTITY, postEntityRequested)
}

function* deleteEntityRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const entityId = action.entityId;
        const method = 'DELETE';

        yield call(() => callApi(OPTIONS_ENTITY_REQUEST_URL + entityId + "?tenantId=" + tenantId, token, method));
        yield put ({ type: DELETE_ENTITY_SUCCEEDED, entityId });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: DELETE_ENTITY_FAILED, message: e.message });
        }
    }
}

export function* watchDeleteEntity() {
    yield takeEvery(DELETE_ENTITY, deleteEntityRequested)
}

function* putEntityRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const entityId = action.entityId;
        const method = "PUT";

        const entityResponse = yield call(() => callApi(OPTIONS_ENTITY_REQUEST_URL + entityId + "?tenantId=" + tenantId, token, method, action.entity));
        yield put ({ type: PUT_ENTITY_SUCCEEDED, entity: entityResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: "USER_NOT_AUTHORIZED" });

        } else {
            Raven.captureException(e);
            yield put ({ type: PUT_ENTITY_FAILED, message: e.message });
        }
    }
}

export function* watchPutEntity() {
    yield takeEvery(PUT_ENTITY, putEntityRequested)
}

type CreateEntitiesAction = {
    type: "CREATE_ALL_ENTITIES",
    entities: Entity[]
}

function* createEntitiesRequested(action: CreateEntitiesAction) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const method = "POST";

        const entities = yield all(action.entities.map((entity) => call(() => callApi(ENTITIES_REQUEST_URL + tenantId, token, method, entity))));
        yield put ({ type: CREATE_ALL_ENTITIES_SUCCEEDED, entities: entities });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: "USER_NOT_AUTHORIZED" });

        } else {
            Raven.captureException(e);
            yield put ({ type: CREATE_ALL_ENTITIES_FAILED, message: e.message });
        }
    }
}

export function* watchCreateEntities() {
    yield takeEvery(CREATE_ALL_ENTITIES, createEntitiesRequested)
}

interface DeleteEntitiesAction {
    type: "DELETE_ALL_ENTITIES",
    entities: Entity[]
}

function* deleteEntitiesRequested(action: DeleteEntitiesAction) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const method = "DELETE";

        const entities = yield all(action.entities.map((entity) => call(() => callApi(OPTIONS_ENTITY_REQUEST_URL + entity.id + "?tenantId=" + tenantId, token, method))));
        yield put ({ type: DELETE_ALL_ENTITIES_SUCCEEDED, entities });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: "USER_NOT_AUTHORIZED" });

        } else {
            Raven.captureException(e);
            yield put ({ type: DELETE_ALL_ENTITIES_FAILED, message: e.message });
        }
    }
}

export function* watchDeleteEntities() {
    yield takeEvery(DELETE_ALL_ENTITIES, deleteEntitiesRequested)
}


