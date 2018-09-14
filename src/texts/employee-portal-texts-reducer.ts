import { Reducer } from "redux";
import defaultTexts from './texts';

export interface IStringStringMap {
    [key: string]: string;
}

export interface TextState {
    messages?: IStringStringMap,
}

export const FETCH_EMPLOYEE_PORTAL_TEXTS_SUCCEEDED = 'FETCH_EMPLOYEE_PORTAL_TEXTS_SUCCEEDED';

const textReducer: Reducer<TextState> = (state = {}, action) => {
    if (action.type === FETCH_EMPLOYEE_PORTAL_TEXTS_SUCCEEDED) {
        return { ...state, messages: { ...defaultTexts, ...action.messages } };
    }

    return state;
};

export default textReducer;