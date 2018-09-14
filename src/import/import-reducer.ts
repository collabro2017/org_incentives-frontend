import { Reducer } from "redux";
import { IMPORT_ALL_MODELS, IMPORT_ALL_MODELS_FAILED, IMPORT_ALL_MODELS_SUCCEEDED } from "./import-actions";

export interface ImportState {
    isLoading: boolean,
}

const initialState: ImportState = {
    isLoading: false,
};

const importReducer: Reducer<ImportState> = (state = initialState, action) => {
    switch (action.type) {
        case IMPORT_ALL_MODELS: return { ...state, isLoading: true };
        case IMPORT_ALL_MODELS_SUCCEEDED: return { ...state, isLoading: false };
        case IMPORT_ALL_MODELS_FAILED: return { ...state, isLoading: false };
    }
    return state;
};

export default importReducer;

