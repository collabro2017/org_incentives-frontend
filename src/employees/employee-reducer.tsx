import {
    IMPORT_ALL_EMPLOYEES, IMPORT_ALL_EMPLOYEES_SUCCEEDED, DELETE_ALL_EMPLOYEES, DELETE_ALL_EMPLOYEES_SUCCEEDED,
    DELETE_EMPLOYEE, DELETE_EMPLOYEE_SUCCEEDED,
    FETCH_EMPLOYEES, FETCH_EMPLOYEES_SUCCEEDED,
    POST_EMPLOYEE, POST_EMPLOYEE_SUCCEEDED, PUT_EMPLOYEE, PUT_EMPLOYEE_SUCCEEDED,TERMINATE_EMPLOYEE, TERMINATE_EMPLOYEE_SUCCEEDED, TERMINATE_EMPLOYEE_FAILED
} from "./employee-actions";
import { Reducer } from "redux";
import {Entity} from "../entity/entity-reducer";

export interface Employee {
    id?: string,
    firstName: string,
    lastName: string,
    email: string,
    residence: string,
    entity_id: string,
    account_id?: string,
    created_at?: string,
    updated_at?: string,
    termination_date?: string,
    insider: boolean,
    soc_sec?: string,
    internal_identification?: string,
    mobility_entries: MobilityEntry[]
    entity?: Entity,
}

export interface MobilityEntry {
    from_date: string,
    to_date: string,
    override_entity_soc_sec?: string,
    entity_id: string,
    entity?: Entity,
    employee_id?: string
}

export interface EmployeeState {
    allEmployees: Employee[]
    isFetching: boolean,
    isFetchingEmployees: boolean,
    isTerminatingEmployee: boolean,
}

const initialState: EmployeeState = {
    allEmployees: [],
    isFetching: false,
    isFetchingEmployees: false,
    isTerminatingEmployee: false,
};

const employeeReducer: Reducer<EmployeeState> = (state = initialState, action) => {
    if (action.type === FETCH_EMPLOYEES) {
        return {...state, ...{ isFetchingEmployees: true } };
    }

    if (action.type === FETCH_EMPLOYEES_SUCCEEDED) {
        return { ...state, ...{ allEmployees: action.employees }, isFetchingEmployees: false };
    }

    if (action.type === 'FETCH_EMPLOYEES_AND_ENTITIES') {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === 'FETCH_EMPLOYEES_AND_ENTITIES_SUCCEEDED') {
        return { ...state, ...{ isFetching: false } };
    }

    if (action.type === POST_EMPLOYEE) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === POST_EMPLOYEE_SUCCEEDED) {
        return { ...state, allEmployees: [...state.allEmployees, action.employee], isFetching: false };
    }

    if (action.type === IMPORT_ALL_EMPLOYEES) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === IMPORT_ALL_EMPLOYEES_SUCCEEDED) {
        const employees = action.employees.map((employee) => employee.data);
        return { ...state, allEmployees: [ ...state.allEmployees, ...employees], isFetching: false };
    }

    if (action.type === DELETE_EMPLOYEE) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === DELETE_EMPLOYEE_SUCCEEDED) {
        const allEmployees = state.allEmployees.filter((employee) => employee.id !== action.employeeId);
        return { ...state, allEmployees: [...allEmployees], isFetching: false };
    }

    if (action.type === PUT_EMPLOYEE) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === PUT_EMPLOYEE_SUCCEEDED) {
        const employeeIndex = state.allEmployees.findIndex((employee) => employee.id === action.employee.id);
        const employee = { ...state.allEmployees[employeeIndex], ...action.employee };
        const employees = [ ...state.allEmployees];
        employees[employeeIndex] = employee;
        return { ...state, allEmployees: employees, isFetching: false };
    }

    if (action.type === DELETE_ALL_EMPLOYEES) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === DELETE_ALL_EMPLOYEES_SUCCEEDED) {
        while (action.employees.length > 0) {
            action.employees.pop();
        }
        return { ...state, ... { allEmployees: action.employees }, isFetching: false };
    }

    if (action.type === TERMINATE_EMPLOYEE) {
        return { ...state, ...{ isTerminatingEmployee: true } };
    }

    if (action.type === TERMINATE_EMPLOYEE_SUCCEEDED) {
        const newEmployees = state.allEmployees.map((e) => {
            if (e.id === action.employeeId) {
                return { ...e, termination_date: action.terminationDate };
            } else {
                return e;
            }
        });
        return { ...state, isTerminatingEmployee: false, allEmployees: newEmployees };
    }

    if (action.type === TERMINATE_EMPLOYEE_FAILED) {
        return { ...state, ...{ isTerminatingEmployee: false } };
    }

    return state;
};

export default employeeReducer;