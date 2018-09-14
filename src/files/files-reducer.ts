import { Reducer } from "redux";
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
    FETCH_EMPLOYEES_AND_FILES,
    FETCH_EMPLOYEES_AND_FILES_FAILED,
    FETCH_EMPLOYEES_AND_FILES_SUCCEEDED,
    FETCH_FILES,
    FETCH_FILES_SUCCEEDED,
    MARK_DOCUMENT_AS_READ_SUCCEEDED, UPDATE_DOCUMENT_SUCCEEDED, UPDATE_EMPLOYEE_DOCUMENTS_FOR_FILE,
    UPDATE_EMPLOYEE_DOCUMENTS_FOR_FILE_FAILED,
    UPDATE_EMPLOYEE_DOCUMENTS_FOR_FILE_SUCCEEDED,
    UPLOAD_FILES,
    UPLOAD_FILES_SUCCEEDED
} from "./files-actions";

export interface APIDocument {
    id: string,
    file_name: string,
    type: string,
    document_header: string,
    message_header: string,
    message_body: string,
    employee_documents: APIEmployeeDocument2[]
}

export interface APIEmployeeDocument2 {
    id: string,
    requires_acceptance: boolean,
    accepted_at?: string,
    employee_id: string,
}

export enum FileType {
    GRANT_DOUCMENT = "GRANT_DOUCMENT", OTHER = "OTHER"
}

export const fileTypes: FileType[] = (() => {
    let types = [];
    for (const type in FileType) {
        if (typeof type === "string") {
            types.push(type);
        }
    }
    return types;
})();

export interface APIEmployeeDocument {
    id: string,
    fileName: string,
    document_header?: string,
    message_header?: string,
    message_body?: string,
    downloadLink: string,
    requires_acceptance: boolean,
    accepted_at?: string,
}

export interface FileState {
    documents: APIDocument[],
    isLoading: boolean,
    isDeletingEmployeeAssociation: boolean,
    isAttachingEmployee: boolean
    isFetchingDocumentsAndEmployees: boolean
    isDeletingFile: boolean
}

const initialState = {
    documents: [],
    isLoading: false,
    isAttachingEmployee: false,
    isDeletingEmployeeAssociation: false,
    isFetchingDocumentsAndEmployees: false,
    isDeletingFile: false,
};

const fileReducer: Reducer<FileState> = (state = initialState, action) => {
    if (action.type === FETCH_FILES_SUCCEEDED) {

        const documents = action.documents.map((document) => {
            return { ...document, employee_document: document.employee_documents }
        });
        return { ...state, documents, isLoading: false };
    }

    if (action.type === FETCH_FILES) {
        return { ...state, isLoading: false };
    }

    if (action.type === FETCH_EMPLOYEES_AND_FILES) {
        return { ...state, isFetchingDocumentsAndEmployees: true };
    }

    if (action.type === FETCH_EMPLOYEES_AND_FILES_SUCCEEDED) {
        return { ...state, isFetchingDocumentsAndEmployees: false };
    }

    if (action.type === FETCH_EMPLOYEES_AND_FILES_FAILED) {
        return { ...state, isFetchingDocumentsAndEmployees: false };
    }

    if (action.type === UPLOAD_FILES) {
        return { ...state, isLoading: true };
    }

    if (action.type === UPLOAD_FILES_SUCCEEDED) {
        return { ...state, documents: [action.document, ...state.documents], isLoading: false };
    }

    if (action.type === ATTACH_EMPLOYEE_TO_FILE) {
        return { ...state, isAttachingEmployee: true };
    }

    if (action.type === ATTACH_EMPLOYEE_TO_FILE_SUCCEEDED) {
        const documents = state.documents.map((document) => {
            if (document.id === action.data.document_id) {
                return { ...document, employee_document: action.data }
            }
            return document;
        });

        return { ...state, isAttachingEmployee: false, documents };
    }

    if (action.type === ATTACH_EMPLOYEE_TO_FILE_FAILED) {
        return { ...state, isAttachingEmployee: false };
    }

    if (action.type === DELETE_EMPLOYEE_ASSOCIATION) {
        return { ...state, isDeletingEmployeeAssociation: true };
    }

    if (action.type === DELETE_EMPLOYEE_ASSOCIATION_SUCCEEDED) {
        // const documents = state.documents.map((document) => {
        //     if (document.employee_documents && document.employee_documents.id === action.employeeDocumentId) {
        //         return { ...document, employee_document: null }
        //     }
        //
        //     return document;
        // });
        //
        // return { ...state, isDeletingEmployeeAssociation: false, documents };
    }

    if (action.type === DELETE_EMPLOYEE_ASSOCIATION_FAILED) {
        return { ...state, isDeletingEmployeeAssociation: false };
    }

    if (action.type === DELETE_DOCUMENT) {
        return { ...state, isDeletingFile: true };
    }

    if (action.type === DELETE_DOCUMENT_SUCCEEDED) {
        const remainingDocuments = state.documents.filter((document) => document.id !== action.documentId);
        return { ...state, documents: remainingDocuments, isDeletingFile: false };
    }

    if (action.type === DELETE_DOCUMENT_FAILED) {
        return { ...state, isDeletingFile: false };
    }

    if (action.type === UPDATE_EMPLOYEE_DOCUMENTS_FOR_FILE) {
        return { ...state, isAttachingEmployee: true };
    }

    if (action.type === UPDATE_EMPLOYEE_DOCUMENTS_FOR_FILE_FAILED) {
        return { ...state, isAttachingEmployee: false };
    }

    if (action.type === UPDATE_EMPLOYEE_DOCUMENTS_FOR_FILE_SUCCEEDED) {
        const documents = state.documents.map(d => {
            if (action.documentId === d.id) {
                const employeeDocuments = action.data.map((ed): APIEmployeeDocument2 => ({
                    accepted_at: ed.accepted_at,
                    employee_id: ed.employee_id,
                    id: ed.id,
                    requires_acceptance: ed.requires_acceptance,
                }));

                return { ...d, employee_documents: employeeDocuments };
            }
            return { ...d };
        });

        return { ...state, isAttachingEmployee: false, documents};
    }

    if (action.type === UPDATE_DOCUMENT_SUCCEEDED) {
        const documents = state.documents.map(d => {
            if (action.data.id === d.id) {
                return { ...d, ...action.data };
            }

            return { ...d };
        });

        return { ...state, documents};
    }

    return state;
};

export default fileReducer;
