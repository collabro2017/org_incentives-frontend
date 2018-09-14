import {RootState} from "../reducers/all-reducers";
import {APIDocument} from "./files-reducer";
import {employeeForId} from "../employees/employee-selectors";
import {employeeName, flatten} from "../utils/utils";
import moment, { Moment } from "moment";

export interface DocumentAcceptanceStatus {
    id: string,
    fileName: string,
    employeeName: string,
    employeeEmail: string,
    requiresAcceptance: boolean,
    acceptedAt?: Moment,
}

export const allDocumentsAcceptanceStatus = (state: RootState): DocumentAcceptanceStatus[] => {
    const statusList = state.file.documents
        .filter(removeDocumentsWithoutEmployee)
        .map((doc) => doc.employee_documents.map((ed) => {
            const employee = employeeForId(ed.employee_id)(state);

            return {
                id: ed.id,
                fileName: doc.file_name,
                employeeName: employee && employeeName(employee),
                employeeEmail: employee && employee.email,
                requiresAcceptance: ed.requires_acceptance,
                acceptedAt: ed.accepted_at && moment(ed.accepted_at),
            }
        }));

    return flatten(statusList);
}

const removeDocumentsWithoutEmployee = (doc: APIDocument) => doc.employee_documents.length > 0;