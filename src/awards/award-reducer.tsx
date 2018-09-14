import { Moment } from "moment";
import {
    ADD_AWARD_VESTING_SUCCEEDED, DELETE_AWARD, DELETE_AWARD_SUCCEEDED, POST_AWARD, POST_AWARD_SUCCEEDED, PUT_AWARD,
    PUT_AWARD_SUCCEEDED
} from "./award-actions";
import { Reducer } from "redux";
import { FETCH_EMPLOYEES_SUCCEEDED } from "../employees/employee-actions";
import { FETCH_PROGRAMS_SUCCEEDED } from "../programs/program-actions";
import {Employee, MobilityEntry} from "../employees/employee-reducer";
import {Entity} from "../entity/entity-reducer";
import {
    CREATE_TRANSACTION_SUCCEEDED,
    UPDATE_TRANSACTION,
    UPDATE_TRANSACTION_SUCCEEDED
} from "./transaction/transaction-actions";
import {flatten} from "../utils/utils";
import {AllAwardsResponseAward, toExcelSheetLine, toTranches} from "./award-saga";


export interface Award {
    id?: string,
    incentive_sub_program_id: string,
    quantity: number,
    employee_id: string,
    vesting_events: VestingEvent[]
}

export interface VestingEvent {
    id?: string,
    quantity: number,
    strike: string,
    vestedDate: Moment,
    grant_date: Moment,
    expiry_date: Moment,
    exercised_quantity?: number
    termination_quantity?: number
    purchase_price?: string,
    is_dividend: boolean,
    transactions?: TrancheTransaction[],
    fair_value?: number | string,
}

export interface TrancheTransaction {
    id: string,
    transaction_date: string,
    transaction_type: string,

    termination_date?: string,
    termination_quantity?: number,

    grant_date?: string,
    vested_date?: string,
    expiry_date?: string,
    strike?: string,
    quantity?: number,
    purchase_price?: string,

    fair_value?: string,
    account_id?: string,
}

export interface VestingEventApi {
    id?: string,
    quantity: number,
    strike: string,
    vestedDate: string,
    grant_date: string,
    expiry_date: string,
    purchase_price?: string,
    is_dividend: boolean,
}

export interface ExcelSheetAwardLine {
    id: string,
    integerId: number, // Used for sorting while working with the report in Excel
    internal_employee_id?: string,
    vesting_event_id: string,
    programId: string,
    programName: string,
    subProgramName: string,
    employeeName: string,
    employee: Employee,
    entity: Entity,
    country: string,
    entityName: string,
    instrumentName: string,
    settlementName: string,
    performance: boolean,
    grantDate?: Moment,
    vestedDate?: Moment,
    expiryDate?: Moment,
    strike: number,
    quantity: number,
    exercisedQuantity: number
    purchase_price?: string,
    fair_value?: string,
    transaction_type: string,
    transaction_date: Moment,
    termination_quantity?: number,
    transactions_to_terminate?: ExcelSheetAwardLine[],
    is_dividend: boolean,
    mobility: MobilityEntry[]
}

export interface Tranche {
    id: string,

    employeeName: string,
    employee: Employee,
    country: string,
    entityName: string,
    entity: Entity,
    internal_employee_id?: string,

    programId: string,
    programName: string,
    subProgramName: string,
    instrumentName: string,
    settlementName: string,

    performance: boolean,
    grantDate: Moment,
    vestedDate: Moment,
    expiryDate: Moment,
    strike: number,
    quantity: number,
    exercisedQuantity: number
    termination_quantity: number
    purchase_price?: string,
    is_dividend: boolean,
    fair_value?: string,

    transactions: TrancheTransaction[],
    mobility: MobilityEntry[],
}

export interface AwardState {
    allAwards: Award[],
    award?: Award
    isFetching: boolean,
    isFetchingTenantAwards: boolean,
    allTenantAwards: Tranche[]
}

const initialState: AwardState = {
    allAwards: [],
    award: null,
    isFetching: false,
    allTenantAwards: [],
    isFetchingTenantAwards: false,
};

const awardReducer: Reducer<AwardState> = (state = initialState, action) => {
    console.log(action);
    if (action.type === POST_AWARD) {
        return { ...state, ... { isFetching: true } };
    }

    if (action.type === POST_AWARD_SUCCEEDED) {
        return { ...state, allAwards: [ ...state.allAwards, action.award ], isFetching: false };
    }

    if (action.type === ADD_AWARD_VESTING_SUCCEEDED) {
        if (state.award) {
            state.award.vesting_events.push(action.vesting);
            return { ...state, ...{ award: { ...state.award } } };
        }
    }

    if (action.type === PUT_AWARD) {
        return { ...state, ...{ isFetching: true } }
    }

    if (action.type === PUT_AWARD_SUCCEEDED) {
        const awardIndex = state.allAwards.findIndex((award) => award.id === action.award.id);
        const award = { ...state.allAwards[awardIndex], ...action.award };
        state.allAwards = [...state.allAwards];
        state.allAwards[awardIndex] = award;
        return {...state, allAwards: [...state.allAwards], isFetching: false };
    }

    if (action.type === 'FETCH_EMPLOYEES_AND_PROGRAMS') {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === 'FETCH_EMPLOYEES_AND_PROGRAMS_SUCCEEDED') {
        return { ...state, ...{ isFetching: false } };
    }

    if (action.type === 'FETCH_TENANT_AWARDS') {
        return { ...state, isFetchingTenantAwards: true };
    }

    if (action.type === 'FETCH_TENANT_AWARDS_SUCCEEDED') {
        return { ...state, isFetchingTenantAwards: false, allTenantAwards: action.allTenantAwards };
    }

    if (action.type === DELETE_AWARD) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === DELETE_AWARD_SUCCEEDED) {
        const allAwards = state.allAwards.filter((award) => award.id !== action.awardId);
        return { ...state, allAwards: [...allAwards], isFetching: false };
    }

    if (action.type === UPDATE_TRANSACTION_SUCCEEDED) {
        const allAwards = state.allTenantAwards.map((a) => {
            const updatedTransactions = a.transactions.map((transaction) => {
                const updatedTransaction = action.transactions.filter(t => t.id === transaction.id)[0];
                if (updatedTransaction) {
                    return { ...transaction, fair_value: updatedTransaction.fair_value };
                }
                return {...transaction};
            });

            return { ...a, transactions: updatedTransactions}
        });
        return { ...state, allTenantAwards: allAwards };
    }

    if (action.type === CREATE_TRANSACTION_SUCCEEDED) {
        const allAwards = state.allTenantAwards.map((tranche) => {
            let transactions = tranche.transactions;

            if (tranche.id === action.transaction.vesting_event_id) {
                transactions = tranche.transactions.concat([action.transaction]);
            }

            return { ...tranche, transactions }
        });
        return { ...state, allTenantAwards: allAwards };
    }

    return state

};

export default awardReducer;