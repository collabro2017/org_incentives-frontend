import { all, call, fork, put, select, takeEvery } from "redux-saga/effects";
import { callApi, NOT_AUTHORIZED } from "../api/api-helper";
import Raven from "raven-js";
import * as selectors from "./program-selectors";
import {
    ADD_PROGRAM_SUCCEEDED, ADD_PROGRAM_FAILED, ADD_PROGRAM,
    POST_PROGRAM_SUCCEEDED, POST_PROGRAM_FAILED, POST_PROGRAM,
    FETCH_PROGRAMS_SUCCEEDED, FETCH_PROGRAMS_FAILED, FETCH_PROGRAMS,
    PUT_PROGRAM_FAILED, PUT_PROGRAM_SUCCEEDED, PUT_PROGRAM,
    IMPORT_ALL_PROGRAM_AWARDS_FAILED, IMPORT_ALL_PROGRAM_AWARDS,
    DELETE_PROGRAM_FAILED, DELETE_PROGRAM_SUCCEEDED, DELETE_PROGRAM,
    DELETE_ALL_PROGRAMS_FAILED, DELETE_ALL_PROGRAMS_SUCCEEDED, DELETE_ALL_PROGRAMS, IMPORT_ALL_PROGRAM_AWARDS_SUCCEEDED,
} from "./program-actions";
import { ADD_SUBPROGRAM, ADD_SUBPROGRAM_FAILED, ADD_SUBPROGRAM_SUCCEEDED } from "../subprograms/subprogram-actions";
import { fetchEmployees } from "../employees/employee-saga";
import { Program } from "./program-reducer";
import { SingleAwardImport } from "./program-import";
import { sumNumbers } from "../utils/utils";
import { toVestingEventAPI } from "../import/import-saga";


const PROGRAM_REQUEST_URL = '/incentive_programs?tenantId=';
const PROGRAM_OPTION_REQUEST_URL = '/incentive_programs/';
const AWARDS_REQUEST_URL = "/awards?tenantId=";

function* addProgramRequested(action) {
    try {
        yield put ({ type: ADD_PROGRAM_SUCCEEDED, program: action.program });

    } catch (e) {
        Raven.captureException(e);
        yield put ({ type: ADD_PROGRAM_FAILED, message: e.message });
    }
}

export function* watchAddProgram() {
    yield takeEvery(ADD_PROGRAM, addProgramRequested);
}

function* addSubProgramRequested(action) {
    try {
        yield put ({ type: ADD_SUBPROGRAM_SUCCEEDED, subProgram: action.subProgram });

    } catch (e) {
        Raven.captureException(e);
        yield put ({ type: ADD_SUBPROGRAM_FAILED, message: e.message });
    }
}

export function* watchAddSubProgram() {
    yield takeEvery(ADD_SUBPROGRAM, addSubProgramRequested);
}

function* postProgramRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const method = 'POST';

        const programResponse = yield call(() => callApi(PROGRAM_REQUEST_URL + tenantId, token, method, action.program));
        yield put ({ type: POST_PROGRAM_SUCCEEDED, program: programResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' })
        } else {
            Raven.captureException(e);
            yield put ({ type: POST_PROGRAM_FAILED, message: e.message });
        }
    }
}

export function* watchPostProgram() {
    yield takeEvery(POST_PROGRAM, postProgramRequested);
}

interface ImportAllProgramAwardsAction {
    type: "IMPORT_ALL_PROGRAM_AWARDS",
    programs: Program[],
    awards: SingleAwardImport[],
}

function* importAllProgramAwardsRequested(action: ImportAllProgramAwardsAction) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const method = 'POST';

        const programBodies: Program[] = action.programs.map((program) => ({
            name: program.name,
            startDate: program.startDate,
            endDate: program.endDate,
            capacity: program.capacity,
            incentive_sub_programs: program.incentive_sub_programs.map((subProgram) => ({
                name: subProgram.name,
                instrumentTypeId: subProgram.instrumentTypeId,
                settlementTypeId: subProgram.settlementTypeId,
                performance: subProgram.performance,
                incentive_sub_program_template: {
                    vesting_event_templates: []
                },
                awards: []
            }))
        }));

        const programsResponse = yield all(programBodies.map((program) => call(() => callApi(PROGRAM_REQUEST_URL + tenantId, token, method, program))));
        const subprograms = programsResponse.map((r) => r.data).reduce((accumulator, program) => [...accumulator, ...program.incentive_sub_programs.map((sp) => ({...sp, programName: program.name }))], []);
        const awards = action.awards.map((a: SingleAwardImport) => {

            const subProgram = subprograms.filter((sp) => sp.name === a.subProgramName && sp.programName === a.programName)[0];
            // Map fra SingleAwardImport til Award
            return {
                employee_id: a.employee_id,
                incentive_sub_program_id: subProgram.id,
                quantity: a.vesting_events.map(ve => ve.quantity).reduce(sumNumbers, 0),
                vesting_events: a.vesting_events.map(toVestingEventAPI),
            };
        });

        yield all(awards.map((award) => call(() => callApi(AWARDS_REQUEST_URL + tenantId, token, method, award))));
        yield put ({ type: IMPORT_ALL_PROGRAM_AWARDS_SUCCEEDED, programs: programsResponse });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: IMPORT_ALL_PROGRAM_AWARDS_FAILED, message: e.message });
        }
    }
}

export function* watchImportAllProgramAwards() {
    yield takeEvery(IMPORT_ALL_PROGRAM_AWARDS, importAllProgramAwardsRequested)
}

function* fetchPrograms() {
    const token = yield select(selectors.token);
    const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);

    const programResponse = yield call(() => callApi(PROGRAM_REQUEST_URL + tenantId, token));
    yield put ({ type: FETCH_PROGRAMS_SUCCEEDED, programs: programResponse.data });
}

function* fetchAllEmployeesAndPrograms() {
    yield fork (fetchEmployees);
    yield fork (fetchPrograms);
}

function* fetchEmployeesAndPrograms() {
    try {
        yield call(fetchAllEmployeesAndPrograms);
        yield put ({ type: 'FETCH_EMPLOYEES_AND_PROGRAMS_SUCCEEDED' });

    } catch (e) {
        if (e.status == NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: 'FETCH_EMPLOYEES_AND_PROGRAMS_FAILED', message: e.message });
        }
    }
}

export function* watchFetchEmployeesAndPrograms() {
    yield takeEvery('FETCH_EMPLOYEES_AND_PROGRAMS', fetchEmployeesAndPrograms);
}

function* fetchProgramsRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);

        const programResponse = yield call(() => callApi(PROGRAM_REQUEST_URL + tenantId, token));
        yield put ({ type: FETCH_PROGRAMS_SUCCEEDED, programs: programResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: FETCH_PROGRAMS_FAILED, message: e.message });
        }
    }
}

export function* watchFetchPrograms() {
    yield takeEvery(FETCH_PROGRAMS, fetchProgramsRequested);
}

function* putProgramRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const programId = action.programId;
        const method = 'PUT';

        const programResponse = yield call(() => callApi(PROGRAM_OPTION_REQUEST_URL + programId + "?tenantId=" + tenantId, token, method, action.program));
        yield put ({ type: PUT_PROGRAM_SUCCEEDED, program: programResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: PUT_PROGRAM_FAILED, message: e.message });
        }
    }
}

export function* watchPutProgram() {
    yield takeEvery(PUT_PROGRAM, putProgramRequested);
}

function* deleteProgramRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const programId = action.programId;
        const method = "DELETE";

        yield call(() => callApi(PROGRAM_OPTION_REQUEST_URL + programId + "?tenantId=" + tenantId, token, method));
        yield put ({ type: DELETE_PROGRAM_SUCCEEDED, programId });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: DELETE_PROGRAM_FAILED, message: e.message });
        }
    }
}

export function* watchDeleteProgram() {
    yield takeEvery(DELETE_PROGRAM, deleteProgramRequested);
}

interface DeleteAllProgramsAction {
    type: "DELETE_ALL_PROGRAMS",
    programs: Program[]
}

function* deleteAllProgramsRequested(action: DeleteAllProgramsAction) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const method = "DELETE";

        const programs = yield all(action.programs.map((program) => call(() => callApi(PROGRAM_OPTION_REQUEST_URL + program.id + "?tenantId=" + tenantId, token, method))));
        yield put ({ type: DELETE_ALL_PROGRAMS_SUCCEEDED, programs });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: "USER_NOT_AUTHORIZED" });

        } else {
            Raven.captureException(e);
            yield put ({ type: DELETE_ALL_PROGRAMS_FAILED, message: e.message });
        }
    }
}

export function* watchDeleteAllPrograms() {
    yield takeEvery(DELETE_ALL_PROGRAMS, deleteAllProgramsRequested);
}

