import { Reducer } from "redux";
import {
    DELETE_WINDOW,
    DELETE_WINDOW_SUCCEEDED, FETCH_WINDOW, FETCH_WINDOW_SUCCEEDED,
    POST_WINDOW, POST_WINDOW_SUCCEEDED, PUT_WINDOW, PUT_WINDOW_SUCCEEDED
} from "./window-actions";
import moment, { Moment } from "moment";
import {EmployeeSelection} from "./window-form";


export interface Window {
    id?: string,
    start_time: Moment,
    end_time: Moment,
    payment_deadline: Moment,
    window_type: WindowType,
    restricted?: boolean,
    require_bank_account: boolean,
    require_share_depository: boolean,
    restricted_employees: string[]
    allowed_exercise_types: string[]
    commission_percentage?: number,
}

export enum WindowType {
    EXERCISE = "EXERCISE", PURCHASE = "PURCHASE"
}

export interface ExerciseWindowState {
    allExerciseWindows: Window[],
    exerciseWindow?: Window,
    isFetching: boolean
}

const initialState: ExerciseWindowState = {
    allExerciseWindows: [],
    exerciseWindow: null,
    isFetching: false
};

const toWindow = (w): Window => ({
    id: w.id,
    start_time: moment(w.start_time),
    end_time: moment(w.end_time),
    payment_deadline: moment(w.payment_deadline),
    window_type: w.window_type,
    restricted_employees: w.window_restriction && w.window_restriction.employee_restriction ? w.window_restriction.window_employee_restrictions.map(er => er.employee_id) : [],
    allowed_exercise_types: w.allowed_exercise_types,
    require_share_depository: w.require_share_depository,
    require_bank_account: w.require_bank_account,
    commission_percentage: w.commission_percentage ? parseFloat(w.commission_percentage) : null,
});

const latestWindowFirst = (windowA: Window, windowB: Window): number => moment(windowA.end_time).isSameOrBefore(windowB.end_time) ? 1 : -1;

const windowReducer: Reducer<ExerciseWindowState> = (state = initialState, action) => {
    if (action.type === POST_WINDOW) {
        return { ...state, ...{ isFetching: true } };
    }
    if (action.type === POST_WINDOW_SUCCEEDED) {
        console.log(action.exerciseWindow);
        const sortedExerciseWindow = [...state.allExerciseWindows, toWindow(action.window)]
            .sort(latestWindowFirst);
        return { ...state, ...{ allExerciseWindows: sortedExerciseWindow }, isFetching: false };
    }

    if (action.type === FETCH_WINDOW) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === FETCH_WINDOW_SUCCEEDED) {
        return { ...state, ...{ allExerciseWindows: action.windows.map(toWindow).sort(latestWindowFirst) }, isFetching: false };
    }

    if (action.type === DELETE_WINDOW) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === DELETE_WINDOW_SUCCEEDED) {
        const exerciseWindow = state.allExerciseWindows.filter((exerciseWindow) => exerciseWindow.id !== action.windowId);
        return { ...state, allExerciseWindows: [...exerciseWindow], isFetching: false };
    }

    if (action.type === PUT_WINDOW) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === PUT_WINDOW_SUCCEEDED) {
        const windowIndex = state.allExerciseWindows.findIndex((window) => window.id === action.window.id);
        const windows = [ ...state.allExerciseWindows];
        windows[windowIndex] = toWindow(action.window);
        return { ...state, allExerciseWindows: windows, isFetching: false };
    }

    return state;
};

export default windowReducer;