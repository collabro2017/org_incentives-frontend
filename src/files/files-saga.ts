import { call, fork, put, select, takeEvery, all } from "redux-saga/effects";
import {
    ATTACH_EMPLOYEE_TO_FILE,
    ATTACH_EMPLOYEE_TO_FILE_FAILED,
    ATTACH_EMPLOYEE_TO_FILE_SUCCEEDED,
    DELETE_DOCUMENT,
    DELETE_DOCUMENT_FAILED,
    DELETE_DOCUMENT_SUCCEEDED,
    DELETE_EMPLOYEE_ASSOCIATION,
    DELETE_EMPLOYEE_ASSOCIATION_FAILED,
    DELETE_EMPLOYEE_ASSOCIATION_SUCCEEDED,
    FETCH_DOCUMENTS,
    FETCH_EMPLOYEES_AND_FILES,
    FETCH_EMPLOYEES_AND_FILES_FAILED,
    FETCH_EMPLOYEES_AND_FILES_SUCCEEDED,
    FETCH_FILES,
    FETCH_FILES_FAILED,
    FETCH_FILES_SUCCEEDED,
    FILE_DOWNLOAD,
    FILE_DOWNLOAD_FAILED,
    FILE_DOWNLOAD_SUCCEEDED,
    MARK_DOCUMENT_AS_READ,
    MARK_DOCUMENT_AS_READ_FAILED,
    MARK_DOCUMENT_AS_READ_SUCCEEDED, UPDATE_DOCUMENT_SUCCEEDED,
    UPDATE_EMPLOYEE_DOCUMENTS_FOR_FILE, UPDATE_EMPLOYEE_DOCUMENTS_FOR_FILE_FAILED,
    UPDATE_EMPLOYEE_DOCUMENTS_FOR_FILE_SUCCEEDED,
    UPLOAD_FILES,
    UPLOAD_FILES_FAILED,
    UPLOAD_FILES_SUCCEEDED
} from "./files-actions";
import * as selectors from "../employees/employee-selectors";
import { callApi, Method, NOT_AUTHORIZED, Request, submitForm } from "../api/api-helper";
import Raven from "raven-js";
import { API_ROOT } from "../env";
import { push } from "react-router-redux";
import { fetchEmployees } from "../employees/employee-saga";
import { RootState } from "../reducers/all-reducers";
import { APIDocument } from "./files-reducer";
import { EmployeeDocumentInput } from "./attatch-employee/file-attatch-employee-form";

const FETCH_FILES_URL = "/files";
const ATTACH_EMPLOYEE_TO_FILE_URL = "/employee_documents";
const DOWNLOAD_FILE_URL = "/download";
const MARK_DOCUMENT_AS_READ_URL = "/employee_documents";
const DELETE_EMPLOYEE_ASSOCIATION_URL = "/employee_documents";
const DELETE_DOCUMENT_URL = "/documents";
const updateDocumentUrl = (documentId: string, tenantId: string) =>  `/documents/${documentId}?tenantId=${tenantId}`;
const FILES_ROUTE = "/admin/files";

const employeeDocumentsUrl = (tenantId: string, emplyeeDocumentId: string = undefined) => `/employee_documents${emplyeeDocumentId ? `/${emplyeeDocumentId}` : ''}?tenantId=${tenantId}`;

function* fetchFiles() {
    const token = yield select(selectors.token);
    const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
    try {
        const resultJson = yield call(callApi, FETCH_FILES_URL + "?tenantId=" + tenantId, token);
        yield put({ type: FETCH_FILES_SUCCEEDED, documents: resultJson.data });
    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put({ type: FETCH_FILES_FAILED, message: e.message });
        }
    }
}

export function* watchFetchFiles() {
    yield takeEvery(FETCH_FILES, fetchFiles)
}

function* fetchEmployeesAndFilesFork() {
    yield fork(fetchEmployees);
    yield fork(fetchFiles);
}


function* fetchEmployeesAndFiles() {
    try {
        yield call(fetchEmployeesAndFilesFork);
        yield put({ type: FETCH_EMPLOYEES_AND_FILES_SUCCEEDED });
    } catch (e) {
        if (e.status == NOT_AUTHORIZED) {
            yield put({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put({ type: FETCH_EMPLOYEES_AND_FILES_FAILED, message: e.message });
        }
    }
}

export function* watchFetchEmployeesAndFiles() {
    yield takeEvery(FETCH_EMPLOYEES_AND_FILES, fetchEmployeesAndFiles)
}

function* uploadFiles() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    console.log(fileInput.files);
    const bodies = Array.from(fileInput.files).map((file) => {
        const formData = new FormData();
        formData.append("data", file);
        return formData;
    });

    const token = yield select(selectors.token);
    const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);

    try {
        const resultJson = yield all(bodies.map((body) => call(submitForm, FETCH_FILES_URL + "?tenantId=" + tenantId, token, body)));
        yield all(resultJson.map((res) =>  put({ type: UPLOAD_FILES_SUCCEEDED, document: res.data })))
    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put({ type: UPLOAD_FILES_FAILED, message: e.message });
        }
    }
}

export function* watchUploadFiles() {
    yield takeEvery(UPLOAD_FILES, uploadFiles)
}

function* attachEmployeeToFile(action) {
    const token = yield select(selectors.token);
    const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
    try {
        const resultJson = yield call(callApi, ATTACH_EMPLOYEE_TO_FILE_URL + "?tenantId=" + tenantId, token, "POST", action.attachEmployeeData);
        yield put({ type: ATTACH_EMPLOYEE_TO_FILE_SUCCEEDED, data: resultJson.data });
        yield put(push(FILES_ROUTE))
    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put({ type: ATTACH_EMPLOYEE_TO_FILE_FAILED, message: e.message });
        }
    }
}


export function* watchAttatchEmployeeToFile() {
    yield takeEvery(ATTACH_EMPLOYEE_TO_FILE, attachEmployeeToFile)
}

interface UpdateEmployeeDocumentsAction {
    type: "UPDATE_EMPLOYEE_DOCUMENTS_FOR_FILE",
    documentId: string,
    updatedStatus: EmployeeDocumentInput[],
    document_header: string,
    message_header: string,
    message_body: string
}

function* updateEmployeeDocumentsForFile(action: UpdateEmployeeDocumentsAction) {
    const token = yield select(selectors.token);
    const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);

    const requests: Request[] = action.updatedStatus
        .map(toEmployeeDocumentRequest(tenantId, action.documentId, action.message_header, action.message_body, token))
        .filter(removeFalsy);

    console.log(requests);

    try {
        const updateDocumentResponse = yield call(callApi, updateDocumentUrl(action.documentId, tenantId), token, Method.PUT, {
            document_header: action.document_header || null,
            message_header: action.message_header || null,
            message_body: action.message_body || null,
        });

        yield put({ type: UPDATE_DOCUMENT_SUCCEEDED, data: updateDocumentResponse.data });

        const allPromises = requests.map((request) => call(callApi, request.url, request.token, Method[request.method], request.body));
        const results = yield all(allPromises);
        const withoutDeleted = results.filter((x, index) => requests[index].method !==  Method.DELETE);
        console.log(results);

        yield put({ type: UPDATE_EMPLOYEE_DOCUMENTS_FOR_FILE_SUCCEEDED, data: withoutDeleted.map(body => body.data), documentId: action.documentId });
        yield put(push(FILES_ROUTE))
    } catch (e) {
        console.log(e);
        if (e.status === NOT_AUTHORIZED) {
            yield put({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put({ type: UPDATE_EMPLOYEE_DOCUMENTS_FOR_FILE_FAILED, message: e.message });
        }
    }
}

const toEmployeeDocumentRequest = (tenantId: string, documentId: string, message_header: string, message_body: string, token: string) => (employeeDocument: EmployeeDocumentInput): Request | null => {
    console.log(employeeDocument);
    if (employeeDocument.editMode && employeeDocument.selected) {
        // PUT
        return {
            method: Method.PUT,
            url: employeeDocumentsUrl(tenantId, employeeDocument.employeeDocumentId),
            token,
            body: {
                document_id: documentId,
                employee_id: employeeDocument.employee_id,
                requires_acceptance: employeeDocument.requires_acceptance,
            },
        };
    } else if (employeeDocument.editMode && !employeeDocument.selected) {
        // DELETE
        return {
            method: Method.DELETE,
            url: employeeDocumentsUrl(tenantId, employeeDocument.employeeDocumentId),
            token,
        };
    } else if (employeeDocument.selected) {
        // POST
        return {
            method: Method.POST,
            url: employeeDocumentsUrl(tenantId),
            token,
            body: {
                document_id: documentId,
                employee_id: employeeDocument.employee_id,
                requires_acceptance: employeeDocument.requires_acceptance,
            },
        };
    } else {
        return null;
    }
};

const removeFalsy = (obj: any): boolean => !!obj;

export function* watchUpdateEmployeeDocumentsForFile() {
    yield takeEvery(UPDATE_EMPLOYEE_DOCUMENTS_FOR_FILE, updateEmployeeDocumentsForFile)
}

function* downloadFile(action) {
    const token = yield select(selectors.token);
    const fileUrl = action.link;

    try {
        const resultJson = yield call(callApi, fileUrl, token);
        //yield put ({ type: FILE_DOWNLOAD_SUCCEEDED, data: resultJson.data });
        //yield put (push("/admin/files"))
        //exercise-windows.open(resultJson.url,'_blank');
    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put({ type: FILE_DOWNLOAD_FAILED, message: e.message });
        }
    }
}


export function* watchFileDownload() {
    yield takeEvery(FILE_DOWNLOAD, downloadFile)
}

function* markDocumentAsRead(action) {
    const token = yield select(selectors.token);
    const documentId = action.documentId;

    try {
        const response = yield call(callApi, MARK_DOCUMENT_AS_READ_URL + "/" + documentId + "/read", token, "POST");
        yield put({ type: MARK_DOCUMENT_AS_READ_SUCCEEDED, documentId, accepted_at: response.accepted_at });
    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put({ type: MARK_DOCUMENT_AS_READ_FAILED, message: e.message });
        }
    }
}


export function* watchMarkDocumentAsRead() {
    yield takeEvery(MARK_DOCUMENT_AS_READ, markDocumentAsRead)
}

function* deleteEmployeeAssociation(action) {
    const token = yield select(selectors.token);
    const { employeeDocumentId } = action;

    try {
        yield call(callApi, DELETE_EMPLOYEE_ASSOCIATION_URL + "/" + employeeDocumentId, token, "DELETE");
        yield put({ type: DELETE_EMPLOYEE_ASSOCIATION_SUCCEEDED, employeeDocumentId });
        yield put(push(FILES_ROUTE))
    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put({ type: DELETE_EMPLOYEE_ASSOCIATION_FAILED, message: e.message });
        }
    }
}

export function* watchDeleteEmployeeAssociation() {
    yield takeEvery(DELETE_EMPLOYEE_ASSOCIATION, deleteEmployeeAssociation)
}

function* deleteDocument(action) {
    const token = yield select(selectors.token);
    const tenantId = yield select(selectors.tenantId);
    const { documentId } = action;

    try {
        yield call(callApi, DELETE_DOCUMENT_URL + "/" + documentId + "?tenantId=" + tenantId, token, "DELETE");
        yield put({ type: DELETE_DOCUMENT_SUCCEEDED, documentId });
        yield put(push(FILES_ROUTE))
    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put({ type: DELETE_DOCUMENT_FAILED, message: e.message });
        }
    }
}

export function* watchdeleteDocument() {
    yield takeEvery(DELETE_DOCUMENT, deleteDocument)
}