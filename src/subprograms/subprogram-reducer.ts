import { Moment } from "moment";
import { Award } from "../awards/award-reducer";
import {
    DELETE_SUBPROGRAM, DELETE_SUBPROGRAM_SUCCEEDED,
    FETCH_SUBPROGRAMS_SUCCEEDED, POST_SUBPROGRAM, POST_SUBPROGRAM_SUCCEEDED,
    PUT_SUBPROGRAM, PUT_SUBPROGRAM_SUCCEEDED
} from "./subprogram-actions";
import { Reducer } from "redux";


export interface SubProgram {
    id?: string,
    name: string,
    instrumentTypeId: string,
    settlementTypeId: string,
    incentive_sub_program_template?: {
        vesting_event_templates: VestingEventTemplate[]
    }
    performance: boolean,
    purchase_config?: PurchaseConfig,
    awards: Award[]
}

export interface VestingEventTemplate {
    id?: string,
    quantityPercentage: string,
    strike: string,
    grant_date: string,
    vestedDate: string,
    expiry_date: string,
    purchase_price?: string,
    is_dividend: boolean,
}

export interface PurchaseConfig {
    id: string,
    price: string,
    window_id?: string,
    require_share_depository: boolean,
    purchase_opportunities: PurchaseOpportunity[]
}

export interface PurchaseOpportunity {
    id: string,
    document_id?: string,
    employee_id: string,
    maximumAmount: number,
    purchasedAmount: number,
}

export interface SubProgramState {
    allSubPrograms: SubProgram[]
    subProgram?: SubProgram
    selectedSubProgram?: SubProgram,
    isFetching: boolean
}

const initialState: SubProgramState = {
    allSubPrograms: [],
    subProgram: null,
    selectedSubProgram: null,
    isFetching: false
};


const subProgramReducer: Reducer<SubProgramState> = (state = initialState, action) => {
    if (action.type === POST_SUBPROGRAM) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === POST_SUBPROGRAM_SUCCEEDED) {
        return {...state, allSubPrograms: [...state.allSubPrograms, action.subProgram ], isFetching: false }
    }

    if (action.type === 'ADD_VESTING_SUCCEEDED') {
        if (state.subProgram) {
            state.subProgram.incentive_sub_program_template.vesting_event_templates.push(action.vesting);
            return { ...state, ...{ subProgram: { ...state.subProgram } } }
        }

        return state;
    }

    if (action.type === 'SELECT_SUBPROGRAM') {
        if (action.subProgram) {
            return { ...state, ...{ selectedSubProgram: action.subProgram } }
        }
    }

    if (action.type === FETCH_SUBPROGRAMS_SUCCEEDED) {
        return { ...state, ... { allSubPrograms: action.subPrograms } }
    }

    if (action.type === PUT_SUBPROGRAM) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === PUT_SUBPROGRAM_SUCCEEDED) {
        const subProgramIndex = state.allSubPrograms.findIndex((subProgram) => subProgram.id === action.subProgram.id);
        const subProgram = { ...state.allSubPrograms[subProgramIndex], ...action.subProgram };
        state.allSubPrograms = [...state.allSubPrograms];
        state.allSubPrograms[subProgramIndex] = subProgram;
        return { ...state, allSubPrograms: [...state.allSubPrograms], isFetching: false };
    }

    if (action.type === DELETE_SUBPROGRAM) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === DELETE_SUBPROGRAM_SUCCEEDED) {
        const subPrograms = state.allSubPrograms.filter((subProgram) => subProgram.id !== action.subProgramId);
        return { ...state, allSubPrograms: [ ...subPrograms], isFetching: false };
    }

    return state;
};

export default subProgramReducer;