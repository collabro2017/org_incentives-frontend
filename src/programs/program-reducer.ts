import { Moment } from 'moment';
import { SubProgram } from "../subprograms/subprogram-reducer";
import {DELETE_AWARD_SUCCEEDED, POST_AWARD_SUCCEEDED, PUT_AWARD_SUCCEEDED} from "../awards/award-actions";
import {
    ADD_PROGRAM, ADD_PROGRAM_SUCCEEDED,
    DELETE_ALL_PROGRAMS, DELETE_ALL_PROGRAMS_SUCCEEDED, DELETE_PROGRAM,
    DELETE_PROGRAM_SUCCEEDED, FETCH_PROGRAMS, FETCH_PROGRAMS_SUCCEEDED,
    IMPORT_ALL_PROGRAM_AWARDS, IMPORT_ALL_PROGRAM_AWARDS_SUCCEEDED,
    POST_PROGRAM, POST_PROGRAM_SUCCEEDED, PUT_PROGRAM,
    PUT_PROGRAM_SUCCEEDED
} from "./program-actions";

import {
    ADD_SUBPROGRAM, DELETE_SUBPROGRAM_SUCCEEDED, POST_SUBPROGRAM_SUCCEEDED, PUT_SUBPROGRAM_SUCCEEDED
} from "../subprograms/subprogram-actions";
import { Reducer } from "redux";
import {
    CREATE_PURCHASE_CONFIG,
    CREATE_PURCHASE_CONFIG_FAILED,
    CREATE_PURCHASE_CONFIG_SUCCEEDED,
    DELETE_PURCHASE_CONFIG,
    DELETE_PURCHASE_CONFIG_FAILED,
    DELETE_PURCHASE_CONFIG_SUCCEEDED,
    UPDATE_PURCHASE_CONFIG,
    UPDATE_PURCHASE_CONFIG_FAILED,
    UPDATE_PURCHASE_CONFIG_SUCCEEDED
} from "../awards/purchase/purchase-actions";


export interface Program {
    id?: string,
    name: string,
    startDate: Moment,
    endDate: Moment,
    capacity: number,
    incentive_sub_programs: SubProgram[]
}

export interface ProgramState {
    readonly allPrograms: Program[],
    readonly program?: Program,
    readonly subProgram?: SubProgram,
    readonly isFetching: boolean,
    readonly isCreatingPurchaseConfig: boolean,
    readonly isDeletingPurchaseConfig: boolean,
}

const initialState: ProgramState = {
    allPrograms: [],
    program: null,
    subProgram: null,
    isFetching: false,
    isCreatingPurchaseConfig: false,
    isDeletingPurchaseConfig: false,
};

const programReducer: Reducer<ProgramState> = (state = initialState, action) => {
    if (action.type === ADD_PROGRAM) {
        return { ...state, ...{ program: action.program }, isFetching: false };
    }

    if (action.type === ADD_SUBPROGRAM) {
        if (state.program) {
            state.program.incentive_sub_programs.push(action.subProgram);
            return { ...state, ...{ program: { ...state.program } }, isFetching: false };
        }

        return state;
    }

    if (action.type === FETCH_PROGRAMS) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === FETCH_PROGRAMS_SUCCEEDED) {
        return { ...state, ...{ allPrograms: action.programs, isFetching: false } };
    }

    if (action.type === POST_PROGRAM) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === POST_PROGRAM_SUCCEEDED) {
        return { ...state, allPrograms: [...state.allPrograms, action.program], program: null, isFetching: false };
    }

    if (action.type === PUT_PROGRAM) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === PUT_PROGRAM_SUCCEEDED) {
        const programIndex = state.allPrograms.findIndex((program) => program.id === action.program.id);
        const program = { ...state.allPrograms[programIndex], ...action.program };
        const programs = [...state.allPrograms];
        programs[programIndex] = program;
        return { ...state, allPrograms: programs, isFetching: false };
    }

    if (action.type === DELETE_PROGRAM) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === DELETE_PROGRAM_SUCCEEDED) {
        const programs = state.allPrograms.filter((program) => program.id !== action.programId);
        return { ...state, allPrograms: [...programs], isFetching: false };
    }

    if (action.type === DELETE_ALL_PROGRAMS) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === DELETE_ALL_PROGRAMS_SUCCEEDED) {
        while (action.programs.length > 0) {
            action.programs.pop();
        }
        return { ...state, ...{ allPrograms: action.programs }, isFetching: false };
    }

    if (action.type === IMPORT_ALL_PROGRAM_AWARDS) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === IMPORT_ALL_PROGRAM_AWARDS_SUCCEEDED) {
        const importPrograms = action.programs.map((program) => program.data);
        const programs = [ ...state.allPrograms, ...importPrograms];

        return { ...state, allPrograms: programs, isFetching: false };
    }

    if (action.type === POST_SUBPROGRAM_SUCCEEDED) {
        const programIndex = state.allPrograms.findIndex((program) => program.id === action.subProgram.incentive_program_id);
        const program = { ...state.allPrograms[programIndex] };
        program.incentive_sub_programs = [...program.incentive_sub_programs, action.subProgram];
        const subProgram = program.incentive_sub_programs.find((subProgram) => subProgram.id === action.subProgram.id);
        subProgram.awards = [];
        state.allPrograms[programIndex] = program;
        return { ...state, allPrograms: [...state.allPrograms], isFetching: false };
    }

    if (action.type === PUT_SUBPROGRAM_SUCCEEDED) {
        const programIndex = state.allPrograms.findIndex((program) => program.id === action.subProgram.incentive_program_id);
        const program = state.allPrograms[programIndex];
        program.incentive_sub_programs = program.incentive_sub_programs.map((subProgram) => subProgram.id === action.subProgram.id ? action.subProgram : { ...subProgram } );
        state.allPrograms[programIndex] = program;
        return { ...state, allPrograms: [...state.allPrograms], isFetching: false }
    }

    if (action.type === DELETE_SUBPROGRAM_SUCCEEDED) {
        const programIndex = state.allPrograms.findIndex((program) => program.id === action.programId);
        const program = state.allPrograms[programIndex];
        program.incentive_sub_programs = program.incentive_sub_programs.filter((subProgram) => subProgram.id !== action.subProgramId);
        state.allPrograms[programIndex] = program;
        return { ...state, allPrograms: [ ...state.allPrograms], isFetching: false }
    }

    if (action.type === POST_AWARD_SUCCEEDED) {
        const programIndex = state.allPrograms.findIndex((program) => program.incentive_sub_programs.some((sub_program) => sub_program.id === action.award.incentive_sub_program_id));
        const program = state.allPrograms[programIndex];
        const subProgram = program.incentive_sub_programs.find((subProgram) => subProgram.id === action.award.incentive_sub_program_id);
        subProgram.awards = [...subProgram.awards, action.award];
        state.allPrograms[programIndex] = program;
        return { ...state, allPrograms: [...state.allPrograms], isFetching: false };
    }

    if (action.type === PUT_AWARD_SUCCEEDED) {
        const programIndex = state.allPrograms.findIndex((program) => program.incentive_sub_programs.some((sub_program) => sub_program.id === action.award.incentive_sub_program_id));
        const program = state.allPrograms[programIndex];
        const subProgram = program.incentive_sub_programs.find((subProgram) => subProgram.id === action.award.incentive_sub_program_id);
        subProgram.awards = [action.award, ...subProgram.awards.filter((award) => award.id !== action.award.id)];
        state.allPrograms[programIndex] = program;
        return { ...state, allPrograms: [...state.allPrograms], isFetching: false };
    }

    if (action.type === DELETE_AWARD_SUCCEEDED) {
        const programIndex = state.allPrograms.findIndex((program) => program.incentive_sub_programs.some((subProgram) => subProgram.id === action.award.incentive_sub_program_id));
        const program = state.allPrograms[programIndex];
        const subProgram = program.incentive_sub_programs.find((subProgram) => subProgram.id === action.award.incentive_sub_program_id);
        subProgram.awards = [...subProgram.awards.filter((award) => award.id !== action.award.id)];
        state.allPrograms[programIndex] = program;
        return { ...state, allPrograms: [...state.allPrograms], isFetching: false };
    }

    if (action.type === DELETE_PURCHASE_CONFIG) {
        return { ...state, isDeletingPurchaseConfig: true };
    }

    if (action.type === DELETE_PURCHASE_CONFIG_FAILED) {
        return { ...state, isDeletingPurchaseConfig: false };
    }

    if (action.type === DELETE_PURCHASE_CONFIG_SUCCEEDED) {
        const deletedPurchaseConfigId = action.id;
        const purchaseConfigPredicate = (subProgram) => subProgram.purchase_config && subProgram.purchase_config.id === deletedPurchaseConfigId;
        const newPrograms = state.allPrograms.map((program) => {
            if (program.incentive_sub_programs.some(purchaseConfigPredicate)) {
                const withoutPurchaseConfig = program.incentive_sub_programs.map((sub_program) => {
                    if (sub_program.purchase_config && sub_program.purchase_config.id === deletedPurchaseConfigId) {
                        return { ...sub_program, purchase_config: null }
                    }
                    return { ...sub_program }
                });
                return { ...program, incentive_sub_programs: withoutPurchaseConfig }
            }

            return { ...program }
        });

        return { ...state, isDeletingPurchaseConfig: false, allPrograms: newPrograms };
    }

    if (action.type === CREATE_PURCHASE_CONFIG || action.type === UPDATE_PURCHASE_CONFIG) {
        return { ...state, isCreatingPurchaseConfig: true };
    }

    if (action.type === CREATE_PURCHASE_CONFIG_FAILED || action.type === UPDATE_PURCHASE_CONFIG_FAILED) {
        return { ...state, isCreatingPurchaseConfig: false };
    }

    if (action.type === CREATE_PURCHASE_CONFIG_SUCCEEDED || action.type === UPDATE_PURCHASE_CONFIG_SUCCEEDED) {
        const sub_program_id = action.purchase_config.incentive_sub_program_id;
        const newPrograms = state.allPrograms.map((program) => {
            if (program.incentive_sub_programs.some((subProgram) => subProgram.id === sub_program_id)) {
                const withPurchaseConfig = program.incentive_sub_programs.map((sub_program) => {
                    if (sub_program.id === sub_program_id) {
                        return { ...sub_program, purchase_config: action.purchase_config }
                    }
                    return { ...sub_program }
                });
                return { ...program, incentive_sub_programs: withPurchaseConfig }
            }

            return { ...program }
        });

        return { ...state, isCreatingPurchaseConfig: false, allPrograms: newPrograms };
    }

    return state;
};

export default programReducer;