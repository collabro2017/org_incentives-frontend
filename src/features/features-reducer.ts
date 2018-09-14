import { Reducer } from "redux";

export interface Features {
    exercise?: boolean,
    documents?: boolean,
    purchase?: boolean,
}

const initialState: Features = {
    exercise: false,
    documents: false,
    purchase: false,
};


const featuresReducer: Reducer<Features> = (state = initialState, action) =>  {
    if (action.type === 'FETCH_EMPLOYEE_PORTAL_WELCOME_SUCCEEDED') {
        const { welcomeData: { features } } = action;
        return { ...state, ...features }
    }

    return state;
};

export default featuresReducer;