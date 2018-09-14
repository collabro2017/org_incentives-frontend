import {call, fork, put, select, takeEvery} from "redux-saga/effects";
import { callApi, NOT_AUTHORIZED } from "../api/api-helper";
import Raven from "raven-js";
import {VestingEventApi, VestingEvent, ExcelSheetAwardLine, Award, TrancheTransaction, Tranche} from "./award-reducer";
import * as selectors from "./award-selectors";
import {
    ADD_AWARD_VESTING, ADD_AWARD_VESTING_FAILED, ADD_AWARD_VESTING_SUCCEEDED, DELETE_AWARD, DELETE_AWARD_FAILED,
    DELETE_AWARD_SUCCEEDED,
    POST_AWARD, POST_AWARD_FAILED, POST_AWARD_SUCCEEDED,
    PUT_AWARD, PUT_AWARD_FAILED, PUT_AWARD_SUCCEEDED
} from "./award-actions";
import { Employee } from "../employees/employee-reducer";
import moment, {Moment} from 'moment';
import { apiShortDate, flatten } from "../utils/utils";
import { Entity } from "../entity/entity-reducer";
import {Program} from "../programs/program-reducer";
import {SubProgram} from "../subprograms/subprogram-reducer";
import {TransactionType} from "../reports/reports";


const AWARDS_REQUEST_URL = "/awards?tenantId=";
const OPTION_AWARDS_REQUEST_URL = "/awards/";

interface PostAwardAction {
    type: 'POST_AWARD',
    award: Award,
}

const toVestingEventApi = (vestingEvent: VestingEvent): VestingEventApi => ({
    grant_date: vestingEvent.grant_date.format(apiShortDate),
    vestedDate: vestingEvent.vestedDate.format(apiShortDate),
    expiry_date: vestingEvent.expiry_date.format(apiShortDate),
    strike: vestingEvent.strike,
    quantity: vestingEvent.quantity,
    purchase_price: vestingEvent.purchase_price,
    is_dividend: vestingEvent.is_dividend,
});

function* postAwardRequested(action: PostAwardAction) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const method = 'POST';

        const apiAward = { ...action.award, ...{ vesting_events: action.award.vesting_events.map(toVestingEventApi) } };

        const awardResponse = yield call(() => callApi(AWARDS_REQUEST_URL + tenantId, token, method, apiAward));
        yield put ({ type: POST_AWARD_SUCCEEDED, award: awardResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: POST_AWARD_FAILED, message: e.message });
        }
    }
}

export function* watchPostAward() {
    yield takeEvery(POST_AWARD, postAwardRequested)
}


export function* addAwardVestingRequested(action) {
    try {
        yield put ({ type: ADD_AWARD_VESTING_SUCCEEDED, vesting: action.vesting });

    } catch (e) {
        Raven.captureException(e);
        yield put ({ type: ADD_AWARD_VESTING_FAILED, message: e.message });
    }
}

export function* watchAddAwardVesting() {
    yield takeEvery(ADD_AWARD_VESTING, addAwardVestingRequested);
}

function* putAwardRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const awardId = action.awardId;
        const method = "PUT";

        const apiAward = { ...action.award, ...{ vesting_events: action.award.vesting_events.map(toVestingEventApi) } };

        const awardResponse = yield call(() => callApi(OPTION_AWARDS_REQUEST_URL + awardId + "?tenantId=" + tenantId, token, method, apiAward));
        yield put ({ type: PUT_AWARD_SUCCEEDED, award: awardResponse.data });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: PUT_AWARD_FAILED, message: e.message });
        }
    }
}

export function* watchPutAward() {
    yield takeEvery(PUT_AWARD, putAwardRequested);
}

function* deleteAwardRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const awardId = action.awardId;
        const award = action.award;
        const method = "DELETE";

        yield call(() => callApi(OPTION_AWARDS_REQUEST_URL + awardId + "?tenantId=" + tenantId, token, method, action.award));
        yield put ({ type: DELETE_AWARD_SUCCEEDED, award });

    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });

        } else {
            Raven.captureException(e);
            yield put ({ type: DELETE_AWARD_FAILED, message: e.message });
        }
    }
}

export function* watchDeleteAward() {
    yield takeEvery(DELETE_AWARD, deleteAwardRequested);
}


export const FETCH_TENANT_AWARDS = 'FETCH_TENANT_AWARDS';
export const TENANT_AWARDS_REQUEST_URL = '/awards/all_awards?tenantId=';

function* fetchTenantAwardsRequested(action) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);

        const awardResponse = yield call(() => callApi(TENANT_AWARDS_REQUEST_URL + tenantId, token));
        const allTenantAwards = flatten(awardResponse.data.map(toExcelSheetLine));
        const allTenantTranches = flatten(awardResponse.data.map(toTranches));
        console.log(allTenantAwards, allTenantTranches);

        yield put({ type: 'FETCH_TENANT_AWARDS_SUCCEEDED', allTenantAwards: allTenantTranches })
    } catch (e) {
        Raven.captureException(e);
        yield put({ type: 'FETCH_TENANT_AWARDS_FAILED', message: e.message })
    }
}

interface AllAwardsResponse {
    data: AllAwardsResponseAward[]
}

export interface AllAwardsResponseAward {
    vesting_events: VestingEvent[],
    employee: Employee & { entity: Entity },
    incentive_sub_program: SubProgram & { incentive_program: Program }
}
export const optioIncentivesBeginningOfTime = "1970-01-01";
export const optioIncentivesEndOfTime = "4000-01-01";

export const toExcelSheetLine = (award: AllAwardsResponseAward): ExcelSheetAwardLine[] => {
    let lines: ExcelSheetAwardLine[] = flatten(award.vesting_events.map((ve, trancheIndex): ExcelSheetAwardLine[] => ve.transactions.map((t: TrancheTransaction, transactionIndex) => {
        const trancheIntegerId = (trancheIndex + 1) * 1000;
        const integerId = trancheIntegerId + transactionIndex + 1;
        return {
            id: t.id,
            integerId,
            vesting_event_id: ve.id,
            programId: award.incentive_sub_program.incentive_program.id,
            programName: award.incentive_sub_program.incentive_program.name,
            subProgramName: award.incentive_sub_program.name,
            employeeName: `${award.employee.firstName} ${award.employee.lastName}`,
            employee: award.employee,
            entity: award.employee.entity,
            country: award.employee.residence,
            entityName: award.employee.entity.name,
            instrumentName: award.incentive_sub_program.instrumentTypeId,
            settlementName: award.incentive_sub_program.settlementTypeId,
            performance: award.incentive_sub_program.performance,
            grantDate: t.grant_date && moment(t.grant_date),
            vestedDate: t.vested_date && moment(t.vested_date),
            expiryDate: t.expiry_date && moment(t.expiry_date),
            quantity: t.quantity,
            strike: isNaN(parseFloat(t.strike)) ? null : parseFloat(t.strike),
            exercisedQuantity: ve.exercised_quantity,
            purchase_price: t.purchase_price,
            fair_value: t.fair_value,
            transaction_type: t.transaction_type,
            transaction_date: moment(t.transaction_date),
            termination_quantity: typeof t.termination_quantity === "number" ? t.termination_quantity : null,
            is_dividend: ve.is_dividend,
            mobility: award.employee.mobility_entries.map((me) => ({...me, from_date: me.from_date || optioIncentivesBeginningOfTime, to_date: me.to_date || optioIncentivesEndOfTime }))
        };
    })));

    return lines.map(line => {
        if (TransactionType[line.transaction_type] === TransactionType.TERMINATION) {
            return { ...line, transactions_to_terminate: transactionsToTerminate(lines, line)}
        }
        return line;
    });
};

export const toTranches = (award: AllAwardsResponseAward): Tranche[] => {
    return award.vesting_events.map((ve): Tranche => ({
        id: ve.id,
        programId: award.incentive_sub_program.incentive_program.id,
        programName: award.incentive_sub_program.incentive_program.name,
        subProgramName: award.incentive_sub_program.name,
        employeeName: `${award.employee.firstName} ${award.employee.lastName}`,
        employee: award.employee,
        entity: award.employee.entity,
        country: award.employee.residence,
        entityName: award.employee.entity.name,
        instrumentName: award.incentive_sub_program.instrumentTypeId,
        settlementName: award.incentive_sub_program.settlementTypeId,
        performance: award.incentive_sub_program.performance,
        grantDate: moment(ve.grant_date),
        vestedDate: moment(ve.vestedDate),
        expiryDate: moment(ve.expiry_date),
        quantity: ve.quantity,
        strike: isNaN(parseFloat(ve.strike)) ? null : parseFloat(ve.strike),
        exercisedQuantity: ve.exercised_quantity,
        termination_quantity: ve.termination_quantity,
        purchase_price: ve.purchase_price,
        is_dividend: ve.is_dividend,
        fair_value: typeof ve.fair_value === "number" ? ve.fair_value.toString() : ve.fair_value,
        transactions: ve.transactions,
        mobility: award.employee.mobility_entries.map((me) => ({...me, from_date: me.from_date || optioIncentivesBeginningOfTime, to_date: me.to_date || optioIncentivesEndOfTime }))
    }));
};

const transactionsToTerminate = (lines: ExcelSheetAwardLine[], line: ExcelSheetAwardLine) =>
    lines.filter(l => l.vesting_event_id === line.vesting_event_id && line.id !== l.id);


export function* watchFetchAllTenantAwards() {
    yield takeEvery(FETCH_TENANT_AWARDS, fetchTenantAwardsRequested)
}

