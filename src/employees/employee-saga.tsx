import {call, fork, put, select, takeEvery, all} from 'redux-saga/effects';
import { callApi, NOT_AUTHORIZED } from '../api/api-helper';
import * as selectors from "./employee-selectors";
import Raven from "raven-js";
import {
    FETCH_EMPLOYEES,
    FETCH_EMPLOYEES_FAILED,
    FETCH_EMPLOYEES_SUCCEEDED,
    POST_EMPLOYEE,
    POST_EMPLOYEE_FAILED,
    POST_EMPLOYEE_SUCCEEDED,
    DELETE_EMPLOYEE,
    DELETE_EMPLOYEE_FAILED,
    DELETE_EMPLOYEE_SUCCEEDED,
    IMPORT_ALL_EMPLOYEES,
    IMPORT_ALL_EMPLOYEES_SUCCEEDED,
    IMPORT_ALL_EMPLOYEES_FAILED,
    DELETE_ALL_EMPLOYEES_FAILED,
    DELETE_ALL_EMPLOYEES_SUCCEEDED,
    DELETE_ALL_EMPLOYEES,
    TERMINATE_EMPLOYEE,
    TERMINATE_EMPLOYEE_SUCCEEDED, TERMINATE_EMPLOYEE_FAILED,
    PUT_EMPLOYEE_FAILED,
    PUT_EMPLOYEE_SUCCEEDED, PUT_EMPLOYEE
} from "./employee-actions";
import { fetchEntities } from "../entity/entity-saga";
import { Employee } from "./employee-reducer";
import { employeesRoute } from "../menu/menu";
import { push } from 'react-router-redux';
import {delay} from "redux-saga";
import {AUTH0_BATCH_SIZE, AUTH0_DELAY_IN_MILLISECONDS} from "../env";


const EMPLOYEES_REQUEST_URL = '/employees?tenantId=';
const DELETE_EMPLOYEES_REQUEST_URL = '/employees/';
const EMPLOYEES_OPTION_REQUEST_URL = '/employees/';
const terminateEmployeeUrl = (employeeId: string, tenantId: string) => `/employees/${employeeId}/termination?tenantId=${tenantId}`;

export function* fetchEmployees() {
    const token = yield select(selectors.token);
    const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);

    const employeeResponse = yield call(() => callApi(EMPLOYEES_REQUEST_URL + tenantId, token));
    yield put ({ type: FETCH_EMPLOYEES_SUCCEEDED, employees: employeeResponse.data });
}

function* fetchAllEntitiesAndEmployees() {
    yield fork (fetchEntities);
    yield fork (fetchEmployees);
}

function* fetchEntitiesAndEmployees() {
    try {
        yield call(fetchAllEntitiesAndEmployees);
        yield put ({ type: 'FETCH_EMPLOYEES_AND_ENTITIES_SUCCEEDED' });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: 'FETCH_EMPLOYEES_AND_ENTITIES_FAILED', message: e.message });
        }
    }
}

export function* watchFetchEntitiesAndEmployees() {
    yield takeEvery('FETCH_EMPLOYEES_AND_ENTITIES', fetchEntitiesAndEmployees);
}

function* fetchEmployeesRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);

        const employeeResponse = yield call(() => callApi(EMPLOYEES_REQUEST_URL + tenantId, token));
        yield put ({ type: FETCH_EMPLOYEES_SUCCEEDED, employees: employeeResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: FETCH_EMPLOYEES_FAILED, message: e.message });
        }
    }
}

export function* watchFetchEmployees() {
    yield takeEvery(FETCH_EMPLOYEES, fetchEmployeesRequested)
}

function* postEmployeesRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const method = 'POST';

        const employeeResponse = yield call(() => callApi(EMPLOYEES_REQUEST_URL + tenantId, token, method, action.employee));
        yield put ({ type: POST_EMPLOYEE_SUCCEEDED, employee: employeeResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: POST_EMPLOYEE_FAILED, message: e.message });
        }
    }
}

export function* watchPostEmployee() {
    yield takeEvery(POST_EMPLOYEE, postEmployeesRequested)
}

interface TerminateEmployeeAction {
    type: "TERMINATE_EMPLOYEE"
    employeeId: string,
    terminationDate: string,
}

function* terminateEmployee(action: TerminateEmployeeAction) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const method = 'POST';

        const body  = {
            termination_date: action.terminationDate,
            termination_type: "TERMINATE_ALL_NOT_FULLY_VESTED"
        };

        yield call(() => callApi(terminateEmployeeUrl(action.employeeId, tenantId), token, method, body));
        yield put ({ type: TERMINATE_EMPLOYEE_SUCCEEDED, employeeId: action.employeeId, terminationDate: action.terminationDate });
        yield put (push(employeesRoute))
    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: TERMINATE_EMPLOYEE_FAILED, message: e.message });
        }
    }
}

export function* watchTerminateEmployee() {
    yield takeEvery(TERMINATE_EMPLOYEE, terminateEmployee)
}

function* deleteEmployeeRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const employeeId = action.employeeId;
        const method = 'DELETE';

        yield call(() => callApi(EMPLOYEES_OPTION_REQUEST_URL + employeeId + "?tenantId=" + tenantId, token, method));
        yield put ({ type: DELETE_EMPLOYEE_SUCCEEDED, employeeId });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: DELETE_EMPLOYEE_FAILED, message: e.message });
        }
    }
}

export function* watchDeleteEmployee() {
    yield takeEvery(DELETE_EMPLOYEE, deleteEmployeeRequested)
}

function* putEmployeeRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const employeeId = action.employeeId;
        const method = "PUT";

        const employeeResponse = yield call(() => callApi(EMPLOYEES_OPTION_REQUEST_URL + employeeId + "?tenantId=" + tenantId, token, method, action.employee));
        yield put ({ type: PUT_EMPLOYEE_SUCCEEDED, employee: employeeResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: "USER_NOT_AUTHORIZED" });

        } else {
            Raven.captureException(e);
            yield put ({ type: PUT_EMPLOYEE_FAILED, message: e.message });
        }
    }
}

export function* watchPutEmployee() {
    yield takeEvery(PUT_EMPLOYEE, putEmployeeRequested);
}

type ImportAllEmployeesAction = {
    type: "IMPORT_ALL_EMPLOYEES",
    employees: Employee[]
}

function* createEmployeesRequested(action: ImportAllEmployeesAction) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const method = 'POST';

        const promiseCreators = yield all(action.employees.map((employee) => () => callApi(EMPLOYEES_REQUEST_URL + tenantId, token, method, employee)));
        const response = yield batchRequests(AUTH0_BATCH_SIZE, AUTH0_DELAY_IN_MILLISECONDS, promiseCreators);
        yield put ({ type: IMPORT_ALL_EMPLOYEES_SUCCEEDED, employees: response });
    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: IMPORT_ALL_EMPLOYEES_FAILED, message: e.message });
        }
    }
}

type CreatePromise = () => Promise<any>;

function* batchRequests(batchSize: number, delayInMilliseconds: number, promises: CreatePromise[]) {
    let result = [];
    let currentIndex = 0;
    while (currentIndex <= promises.length) {
        const batch = promises.slice(currentIndex, currentIndex + batchSize);
        const batchResult = yield all(batch.map(p => call(p)));
        result = result.concat(batchResult);
        currentIndex += batchSize;
        yield delay(delayInMilliseconds)
    }

    return result;
}

export function* watchCreateEmployees() {
    yield takeEvery(IMPORT_ALL_EMPLOYEES, createEmployeesRequested)
}

type DeleteAllEmployeesAction = {
    type: "DELETE_EMPLOYEES",
    employees: Employee[]
}

function* deleteAllEmployeesRequested(action: DeleteAllEmployeesAction) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const method = "DELETE";
        const promiseCreators = yield all(action.employees.map((employee) => () => callApi(EMPLOYEES_OPTION_REQUEST_URL + employee.id + "?tenantId=" + tenantId, token, method)));

        const employees = yield batchRequests(AUTH0_BATCH_SIZE, AUTH0_DELAY_IN_MILLISECONDS, promiseCreators);
        yield put ({ type: DELETE_ALL_EMPLOYEES_SUCCEEDED, employees });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: "USER_NOT_AUTHORIZED" });

        } else {
            Raven.captureException(e);
            yield put ({ type: DELETE_ALL_EMPLOYEES_FAILED, message: e.message });
        }
    }
}

export function* watchDeleteAllEmployees() {
    yield takeEvery(DELETE_ALL_EMPLOYEES, deleteAllEmployeesRequested)
}

