import { call, put, select, takeEvery } from "redux-saga/effects";
import {callApi, NOT_AUTHORIZED} from "../api/api-helper";
import * as selectors from "./subprogram-selectors";
import Raven from "raven-js";
import {
    ADD_VESTING, ADD_VESTING_FAILED, ADD_VESTING_SUCCEEDED, DELETE_SUBPROGRAM, DELETE_SUBPROGRAM_SUCCEEDED,
    FETCH_SUBPROGRAM_FAILED, FETCH_SUBPROGRAMS, FETCH_SUBPROGRAMS_SUCCEEDED,
    POST_SUBPROGRAM, POST_SUBPROGRAM_FAILED, POST_SUBPROGRAM_SUCCEEDED, PUT_SUBPROGRAM, PUT_SUBPROGRAM_FAILED,
    PUT_SUBPROGRAM_SUCCEEDED
} from "./subprogram-actions";
import {DELETE_ALL_PROGRAMS_FAILED} from "../programs/program-actions";


const SUBPROGRAM_REQUEST_URL = '/incentive_programs/';

export function* postSubProgramRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const programId = action.programId;
        const method = 'POST';

        const subProgramResponse = yield call(() => callApi(SUBPROGRAM_REQUEST_URL + programId + '/sub_programs?tenantId=' + tenantId, token, method, action.subProgram));
        yield put ({ type: POST_SUBPROGRAM_SUCCEEDED, subProgram: subProgramResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: POST_SUBPROGRAM_FAILED, message: e.message });
        }
    }
}

export function* watchPostSubProgram() {
    yield takeEvery (POST_SUBPROGRAM, postSubProgramRequested);
}

export function* fetchSubProgramRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const programId = action.programId;

        const subProgramResponse = yield call(() => callApi(SUBPROGRAM_REQUEST_URL + programId + '/sub_programs?tenantId=' + tenantId, token));
        yield put ({ type: FETCH_SUBPROGRAMS_SUCCEEDED, subPrograms: subProgramResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: FETCH_SUBPROGRAM_FAILED, message: e.message });
        }
    }
}

export function* watchFetchSubProgram() {
    yield takeEvery (FETCH_SUBPROGRAMS, fetchSubProgramRequested);
}


export function* addVestingRequested(action) {
    try {
        yield put ({ type: ADD_VESTING_SUCCEEDED, vesting: action.vesting });

    } catch (e) {
        Raven.captureException(e);
        yield put ({ type: ADD_VESTING_FAILED, message: e.message });
    }
}

export function* watchAddVesting() {
    yield takeEvery(ADD_VESTING, addVestingRequested);
}

function* putSubProgramRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const programId = action.programId;
        const subProgramId = action.subProgramId;
        const method = 'PUT';

        const subProgramResponse = yield call(callApi, SUBPROGRAM_REQUEST_URL + programId + '/sub_programs/' + subProgramId + '?tenantId=' + tenantId, token, method, action.subProgram);
        yield put ({ type: PUT_SUBPROGRAM_SUCCEEDED, subProgram: subProgramResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: PUT_SUBPROGRAM_FAILED, message: e.message });
        }
    }
}

export function* watchPutSubProgram() {
    yield takeEvery(PUT_SUBPROGRAM, putSubProgramRequested);
}

function* deleteSubProgramRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const programId = action.programId;
        const subProgramId = action.subProgramId;
        const method = "DELETE";

        yield call(() => callApi(SUBPROGRAM_REQUEST_URL + programId + "/sub_programs/" + subProgramId + "?tenantId=" + tenantId, token, method));
        yield put ({ type: DELETE_SUBPROGRAM_SUCCEEDED, programId, subProgramId });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: "USER_NOT_AUTHORIZED" });

        } else {
            Raven.captureException(e);
            yield put ({ type: DELETE_ALL_PROGRAMS_FAILED, message: e.message });
        }
    }
}

export function* watchDeleteSubProgram() {
    yield takeEvery(DELETE_SUBPROGRAM, deleteSubProgramRequested);
}