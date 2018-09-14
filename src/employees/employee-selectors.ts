import {RootState} from "../reducers/all-reducers";
import {Employee} from "./employee-reducer";

export const token = (state) => state.user.token;
export const tenant = (state) => state.tenant.selectedTenant;
export const tenantId = (state) => state.tenant.selectedTenant.id;
export const isSysadmin = (state) => state.user.isSysadmin;

export const employeeForId = (emplyeeId: string) => (state: RootState): Employee | undefined => state.employee.allEmployees.filter((e) => e.id === emplyeeId)[0];
