import { Reducer } from "redux";
import { FETCH_DOCUMENTS, FETCH_DOCUMENTS_SUCCEEDED, MARK_DOCUMENT_AS_READ } from "../files/files-actions";
import { APIEmployeeDocument } from "../files/files-reducer";

export interface DocumentState {
    isFetchingDocuments: boolean,
    documents: APIEmployeeDocument[],
}

const initialState: DocumentState = {
    isFetchingDocuments: false,
    documents: [],
};

const documentReducer: Reducer<DocumentState> = (state = initialState, action) => {
    if (action.type === FETCH_DOCUMENTS) {
        return { ...state, isFetchingDocuments: true };
    }

    if (action.type === FETCH_DOCUMENTS_SUCCEEDED) {
        return { ...state, documents: action.documents, isFetchingDocuments: false };
    }

    if (action.type === MARK_DOCUMENT_AS_READ) {
        const documents = state.documents.map((d) => {
            if (d.id === action.documentId) {
                return { ...d, requires_acceptance: false, accepted_at: action.accepted_at }
            }
            return { ...d }
        });
        return { ...state, documents: documents };
    }

    return state;
};

export default documentReducer;
