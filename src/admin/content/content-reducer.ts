import { Reducer } from "redux";
import { FETCH_CONTENTS, FETCH_CONTENTS_FAILED, FETCH_CONTENTS_SUCCEEDED } from "./content-actions";

export interface ContentState {
    allContents: Content[],
    isFetchingContents: boolean,
}

export interface Content {
    id: string,
    name: string,
    description?: string,
    type: string,
    content_type: string,
    raw_content: string,
}

const initialState: ContentState = {
    allContents: [],
    isFetchingContents: false,
};

const ContentReducer: Reducer<ContentState> = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_CONTENTS:
            return { ...state, isFetchingContents: true };
        case FETCH_CONTENTS_FAILED:
            return { ...state, isFetchingContents: false };
        case FETCH_CONTENTS_SUCCEEDED:
            return { ...state, isFetchingContents: false, allContents: action.contents };
    }

    return state;
};

export default ContentReducer;
