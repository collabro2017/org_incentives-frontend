import { Reducer } from "redux";
import {
    CREATE_PURCHASE_ORDER, CREATE_PURCHASE_ORDER_FAILED, CREATE_PURCHASE_ORDER_SUCCEEDED,
    FETCH_PURCHASE_DOCUMENT,
    FETCH_PURCHASE_DOCUMENT_FAILED,
    FETCH_PURCHASE_DOCUMENT_SUCCEEDED, REMOVE_PURCHASE_ORDER_ERROR
} from "./purchase-actions";

export interface PurchaseState {
    purchaseDocument?: DocumentMetadata,
    isFetchingPurchaseDocument: boolean,
    isPlacingOrder: boolean,
    purchaseError: boolean,
}

export interface DocumentMetadata {
    id: string,
    fileName: string,
    downloadLink: string,
}

const initialState: PurchaseState = {
    purchaseDocument: null,
    isFetchingPurchaseDocument: false,
    isPlacingOrder: false,
    purchaseError: false,
};

const PurchaseReducer: Reducer<PurchaseState> = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_PURCHASE_DOCUMENT:
            return { ...state, isFetchingPurchaseDocument: true };
        case FETCH_PURCHASE_DOCUMENT_SUCCEEDED:
            return { ...state, isFetchingPurchaseDocument: false, purchaseDocument: action.document };
        case FETCH_PURCHASE_DOCUMENT_FAILED:
            return { ...state, isFetchingPurchaseDocument: false };
        case CREATE_PURCHASE_ORDER:
            return { ...state, isPlacingOrder: true };
        case CREATE_PURCHASE_ORDER_SUCCEEDED:
            return { ...state, isPlacingOrder: false };
        case CREATE_PURCHASE_ORDER_FAILED:
            return { ...state, isPlacingOrder: false, purchaseError: true };
        case REMOVE_PURCHASE_ORDER_ERROR:
            return { ...state, purchaseError: false };
    }
    return state;
};

export default PurchaseReducer;
