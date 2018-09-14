import { callApi, NOT_AUTHORIZED } from "../api/api-helper";
import * as selectors from "../entity/entity-selectors";
import { all, call, put, select, takeEvery} from "redux-saga/effects";
import { Entity } from "../entity/entity-reducer";
import { IMPORT_ALL_MODELS, IMPORT_ALL_MODELS_FAILED, IMPORT_ALL_MODELS_SUCCEEDED } from "./import-actions";
import Raven from "raven-js";
import { EntitySheetImport, toEntity } from "../entity/entity-import";
import { EmployeeSheetImport, sheetImportToEmployee, toEmployee } from "../employees/employee-import";
import { Employee } from "../employees/employee-reducer";
import { Program } from "../programs/program-reducer";
import { Award, VestingEvent } from "../awards/award-reducer";
import { prepareDateForBackend, sumNumbers } from "../utils/utils";
import { SingleAwardImport } from "./all-models-import";
import { push } from "react-router-redux";

const ENTITIES_REQUEST_URL = "/entities?tenantId=";
const EMPLOYEES_REQUEST_URL = '/employees?tenantId=';
const PROGRAM_REQUEST_URL = '/incentive_programs?tenantId=';
const AWARDS_REQUEST_URL = "/awards?tenantId=";

type ImportAllModelsAction = {
    type: "IMPORT_ALL_MODELS",
    entities: Entity[],
    employees: EmployeeSheetImport[],
    programs: Program[],
    awards: SingleAwardImport[],
}

export const toVestingEventAPI = (ve: VestingEvent) => ({
    quantity: ve.quantity,
    vestedDate: prepareDateForBackend(ve.vestedDate),
    grant_date: prepareDateForBackend(ve.grant_date),
    expiry_date: prepareDateForBackend(ve.expiry_date),
    strike: ve.strike,
    purchase_price: ve.purchase_price,
    fair_value: ve.fair_value,
});


function* importModels(action: ImportAllModelsAction) {
    try {
        const token = yield select(selectors.token);
        const tenantId = yield select(selectors.isSysadmin && selectors.tenantId);
        const method = "POST";

        const entitiesResponse = yield all(action.entities.map((entity) => call(() => callApi(ENTITIES_REQUEST_URL + tenantId, token, method, entity))));
        const entities: Entity[] = entitiesResponse.map((r) => r.data);
        console.log(entities);

        const employeesResponse = yield all(action.employees.map(sheetImportToEmployee(entities)).map((body) => call(callApi, EMPLOYEES_REQUEST_URL + tenantId, token, method, body)));
        const employees: Employee[] = employeesResponse.map((r) => r.data);
        console.log(employees);

        const programBodies: Program[] = action.programs.map((program) => ({
            name: program.name,
            startDate: program.startDate,
            endDate: program.endDate,
            capacity: program.capacity,
            incentive_sub_programs: program.incentive_sub_programs.map((subProgram) => ({
                name: subProgram.name,
                instrumentTypeId: subProgram.instrumentTypeId,
                settlementTypeId: subProgram.settlementTypeId,
                performance: subProgram.performance,
                incentive_sub_program_template: {
                    vesting_event_templates: []
                },
                awards: []
            }))
        }));

        const programsResponse = yield all(programBodies.map((program) => call(() => callApi(PROGRAM_REQUEST_URL + tenantId, token, method, program))));
        const subprograms = programsResponse.map((r) => r.data).reduce((accumulator, program) => [...accumulator, ...program.incentive_sub_programs], []);
        const awards = action.awards.map((a: SingleAwardImport) => {
            const subProgram = subprograms.filter((sp) => sp.name === a.subProgramName)[0];
            // Map fra SingleAwardImport    til Award
            return {
                employee_id: employeeIdFromEmail(employees, a.employeeEmail),
                incentive_sub_program_id: subProgram.id,
                quantity: a.vesting_events.map(ve => ve.quantity).reduce(sumNumbers, 0),
                vesting_events: a.vesting_events.map(toVestingEventAPI),
            };
        });

        yield all(awards.map((award) => call(() => callApi(AWARDS_REQUEST_URL + tenantId, token, method, award))));

        yield put ({ type: IMPORT_ALL_MODELS_SUCCEEDED });
        yield put (push("/admin/awards"));
    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: "USER_NOT_AUTHORIZED" });

        } else {
            Raven.captureException(e);
            yield put ({ type: IMPORT_ALL_MODELS_FAILED, message: e.message });
        }
    }
}

const employeeIdFromEmail = (employees: Employee[], email: string) => {
    const employee = employees.filter((e) => e.email === email)[0];

    if (!employee) {
        throw new Error(`Error parsing employee with email: ${email}. It does not match any of the imported employee emails.`)
    }

    return employee.id;
}

export function* watchImportAllModels() {
    yield takeEvery(IMPORT_ALL_MODELS, importModels)
}