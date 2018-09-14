import { Reducer } from "redux";
import {
    FETCH_TEXTS,
    FETCH_TEXTS_SUCCEEDED,
    PUT_TEXT,
    PUT_TEXT_SUCCEEDED,
    UPDATE_DEFAULT_TEXTS,
    UPDATE_DEFAULT_TEXTS_SUCCEEDED
} from "./text-actions";
import { IStringStringMap } from "./employee-portal-texts-reducer";

export interface Text {
    [key: string]: string
}

export interface TextObject {
    [key: string]: {
        value: string,
        defaultValue: string,
        overridden: boolean,
    }
}

export interface TextState {
    allTexts?: IStringStringMap,
    defaultTexts?: IStringStringMap,
    texts: TextObject,
    isFetching: boolean,
    isUpdatingDefaultTexts: boolean,
}

const initialState: TextState = {
    allTexts: {},
    texts: {},
    isFetching: false,
    isUpdatingDefaultTexts: false,
};

function createTextObject(defaultTexts, tenantSpecificTexts) {
    let texts: TextObject = {};

    Object.keys(defaultTexts).forEach((key) => {
        texts[key] = {
            defaultValue: defaultTexts[key],
            value: (tenantSpecificTexts && tenantSpecificTexts[key]) || defaultTexts[key],
            overridden: tenantSpecificTexts && !!tenantSpecificTexts[key]
        }
    });

    Object.keys(tenantSpecificTexts || {}).forEach((key) => {
        if (!texts[key]) {
            texts[key] = {
                defaultValue: undefined,
                value: tenantSpecificTexts[key],
                overridden: true
            }
        }
    });

    return texts;
}

const textReducer: Reducer<TextState> = (state = initialState, action) => {
    if (action.type === FETCH_TEXTS) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === FETCH_TEXTS_SUCCEEDED) {
        let texts = createTextObject(action.defaultTexts, action.texts);
        return { ...state, ...{ allTexts: action.texts, defaultTexts: action.defaultTexts, texts }, isFetching: false };
    }

    if (action.type === "POST_TEXT") {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === "POST_TEXT_SUCCEEDED") {
        const texts = state.allTexts;
        texts[action.key] = action.value;
        return { ...state, allTexts: { ...state.allTexts }, isFetching: false };
    }

    if (action.type === "DELETE_TEXT_SUCCEEDED") {
        let texts = { ...state.allTexts, [action.key]: undefined };
        return { ...state, allTexts: texts, isFetching: false };
    }

    if (action.type === PUT_TEXT) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === PUT_TEXT_SUCCEEDED) {
        let texts = createTextObject(state.defaultTexts, action.texts);
        return { ...state, texts, allTexts: action.texts, isFetching: false };
    }

    if (action.type === UPDATE_DEFAULT_TEXTS) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === UPDATE_DEFAULT_TEXTS_SUCCEEDED) {
        let texts = createTextObject(action.texts, state.allTexts);
        return { ...state, texts, defaultTexts: action.texts, isFetching: false };
    }

    return state;
};

export default textReducer;
