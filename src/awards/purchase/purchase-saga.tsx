import * as selectors from "../award-selectors";
import { callApi, NOT_AUTHORIZED } from "../../api/api-helper";
import { all, call, select, takeEvery } from "redux-saga/effects";
import {
    CREATE_PURCHASE_CONFIG,
    CREATE_PURCHASE_CONFIG_FAILED,
    CREATE_PURCHASE_CONFIG_SUCCEEDED,
    DELETE_PURCHASE_CONFIG,
    DELETE_PURCHASE_CONFIG_FAILED,
    DELETE_PURCHASE_CONFIG_SUCCEEDED,
    UPDATE_PURCHASE_CONFIG,
    UPDATE_PURCHASE_CONFIG_FAILED,
    UPDATE_PURCHASE_CONFIG_SUCCEEDED
} from "./purchase-actions";
import { put } from "redux-saga/effects";
import Raven from "raven-js";
import { push } from "react-router-redux";

const purchaseConfigUrl = (subProgramId: string, tenantId: string) =>
    `/sub_programs/${subProgramId}/purchase_config?tenantId=${tenantId}`;

const updatePurchaseConfigUrl = (tenantId: string, purchaseConfigId: string) =>
    `/purchase_config/${purchaseConfigId}?tenantId=${tenantId}`;

const purchaseOpportunityUrl = (purchaseConfigId: string, tenantId: string) =>
    `/purchase_config/${purchaseConfigId}/purchase_opportunity?tenantId=${tenantId}`;

const specificPurchaseOpportunityUrl = (tenantId: string, purchaseOpportunityId: string) =>
    `/purchase_opportunity/${purchaseOpportunityId}?tenantId=${tenantId}`;

const deletePurchaseConfigUrl = (id: string, tenantId: string) =>
    `/purchase_config/${id}?tenantId=${tenantId}`;


export interface CreatePurchaseConfigAction {
    type: "CREATE_PURCHASE_CONFIG",
    sub_program_id: string,
    window_id?: string,
    price: number,
    requireShareDepository: boolean,
    individual_purchase_config: IndividualPurchaseConfig[]
}

interface IndividualPurchaseConfig {
    id?: string,
    selected: boolean,
    maximumAmount: number,
    employee_id: string,
    document_id: string,
}

interface CreatePurchaseConfigRequest {
    price: number,
    window_id?: string,
    require_share_depository: boolean,
}

interface PurchaseOpportunityRequest {
    maximumAmount: number,
    employee_id: string,
    document_id: string,
}

function* createOrUpdatePurchaseConfig(action: CreatePurchaseConfigAction) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const method = 'POST';

        const createPurchaseConfigBody: CreatePurchaseConfigRequest = { price: action.price, window_id: action.window_id, require_share_depository: action.requireShareDepository };
        const createPurchaseConfigResponse = yield call(() => callApi(purchaseConfigUrl(action.sub_program_id, tenantId), token, method, createPurchaseConfigBody));
        const purchaseConfigId = createPurchaseConfigResponse.data.id;

        const createPurchaseOpportunityBodies: PurchaseOpportunityRequest[] = action.individual_purchase_config.filter(x => x.selected).map((x) => ({
            maximumAmount: x.maximumAmount,
            employee_id: x.employee_id,
            document_id: x.document_id,
        }));

        const allResponse = yield all(createPurchaseOpportunityBodies.map(body => call(callApi, purchaseOpportunityUrl(purchaseConfigId, tenantId), token, method, body)));

        yield put ({ type: CREATE_PURCHASE_CONFIG_SUCCEEDED, purchase_config: { ...createPurchaseConfigResponse.data, purchase_opportunities: allResponse.map(res => res.data)} });
        yield put (push("/admin/awards"))

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });
        } else {
            Raven.captureException(e);
            yield put ({ type: CREATE_PURCHASE_CONFIG_FAILED, message: e.message });
        }
    }
}

export function* watchCreatePurchaseConfig() {
    yield takeEvery(CREATE_PURCHASE_CONFIG, createOrUpdatePurchaseConfig)
}


export interface UpdatePurchaseConfigAction {
    type: "UPDATE_PURCHASE_CONFIG",
    id: string,
    sub_program_id: string,
    window_id?: string,
    price: number,
    requireShareDepository: boolean,
    individual_purchase_config: IndividualPurchaseConfig[]
}

interface UpdatePurchaseConfigRequest {
    price: number,
    window_id?: string,
    require_share_depository: boolean,
}

function* updatePurchaseConfig(action: UpdatePurchaseConfigAction) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const method = 'PUT';

        const updatePurchaseConfigBody: UpdatePurchaseConfigRequest = { price: action.price, window_id: action.window_id, require_share_depository: action.requireShareDepository };
        const updatePurchaseConfigResponse = yield call(() => callApi(updatePurchaseConfigUrl(tenantId, action.id), token, method, updatePurchaseConfigBody));
        const purchaseConfigId = updatePurchaseConfigResponse.data.id;

        // De som har id og er selected mappes til PUT
        // De som har id men ikke er selected mappes til DELETE
        // De som ikke har id men er selected mappes til POST
        // De som ikke har id og ikke er selected filtreres ut

        const removeAllNonSelectedThatDontExistInBackend = x => x.id || x.selected;
        const allChanges = action.individual_purchase_config.filter(removeAllNonSelectedThatDontExistInBackend);
        const requests = allChanges.map((x) => {
            const body = {
                maximumAmount: x.maximumAmount,
                employee_id: x.employee_id,
                document_id: x.document_id,
            };

            if (x.id && x.selected) {
                return { method: "PUT", promise: call(callApi, specificPurchaseOpportunityUrl(tenantId, x.id), token, "PUT", body) }
            } else if (x.id && !x.selected) {
                return { method: "DELETE", promise: call(callApi, specificPurchaseOpportunityUrl(tenantId, x.id), token, "DELETE", body) }
            } else if (!x.id && x.selected) {
                return { method: "POST", promise: call(callApi, purchaseOpportunityUrl(purchaseConfigId, tenantId), token, "POST", body) }
            }
        });

        const allResponse = yield all(requests.map(r => r.promise));

        const withoutDeletedOpportunities = allResponse.filter((x, index) => requests[index].method !==  "DELETE");

        yield put ({ type: UPDATE_PURCHASE_CONFIG_SUCCEEDED, purchase_config: { ...updatePurchaseConfigResponse.data, purchase_opportunities: withoutDeletedOpportunities.map(res => res.data)} });
        yield put (push("/admin/awards"))

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });
        } else {
            Raven.captureException(e);
            yield put ({ type: UPDATE_PURCHASE_CONFIG_FAILED, message: e.message });
        }
    }
}

export function* watchUpdatePurchaseConfig() {
    yield takeEvery(UPDATE_PURCHASE_CONFIG, updatePurchaseConfig)
}

interface DeletePurchaseConfigAction {
    type: "DELETE_PURCHASE_CONFIG",
    id: string,
}

function* deletePurchaseConfig(action: DeletePurchaseConfigAction) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const method = 'DELETE';

        yield call(callApi, deletePurchaseConfigUrl(action.id, tenantId), token, method);

        yield put ({ type: DELETE_PURCHASE_CONFIG_SUCCEEDED, id: action.id });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: DELETE_PURCHASE_CONFIG_FAILED, message: e.message });
        }
    }
}

export function* watchDeletePurchaseConfig() {
    yield takeEvery(DELETE_PURCHASE_CONFIG, deletePurchaseConfig)
}


