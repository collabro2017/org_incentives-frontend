import React, { Component } from 'react';
import { SheetJSApp } from "../file-parse/sheetjs";
import { Entity } from "../entity/entity-reducer";
import { countryOptions } from "../data/common";
import EmployeesImportPreview from "./employee-import-preview";
import { DropdownItemProps, Button } from "semantic-ui-react";
import { Employee } from "./employee-reducer";
import { connect, MapDispatchToProps } from "react-redux";
import { IMPORT_ALL_EMPLOYEES } from "./employee-actions";
import {changeCommaForPunctuation} from "../utils/utils";
import {createDefaultMobilityEntry} from "./employee-form";

export interface EmployeeSheetImport {
    firstName: string,
    lastName: string,
    email: string,
    residence: string,
    entityName: string,
    insider: number,
    soc_sec?: number,
    internal_identification?: string,
}

interface Props {
    entities: Entity[],
    entityOptions: DropdownItemProps[],
    closeImportEmployeesForm: () => void
}

interface State {
    employees: EmployeeSheetImport[],
    employeesToBeCreated: Employee[]
    error?: string,
}

interface DispatchProps {
    createEmployees: (employees: Employee[]) => void,
}

class EmployeeImport extends Component<Props & DispatchProps, State> {
    state = {
        employees: [],
        employeesToBeCreated: [],
        error: null,
    };

    render() {
        return (
            <div>
                <div className="block-xs">
                    <SheetJSApp handleData={this.handleData} />
                </div>
                {
                    this.state.error && <p>{this.state.error}</p>
                }
                {
                    this.state.employees.length > 0 &&
                    <EmployeesImportPreview employees={this.state.employees} entities={this.props.entities}/>
                }
                {
                    this.state.employees.length > 0 &&
                    <div className='text-center'>
                        <Button primary basic onClick={this.importEmployees}>
                            Import Employees
                        </Button>
                    </div>
                }
            </div>
        );
    }

    private importEmployees = () => {
        this.props.createEmployees(this.state.employeesToBeCreated);
        this.props.closeImportEmployeesForm();
    };

    private handleData = (data: Array<Array<string>>, cols: any) => {
        const [header, ...importData] = data;
        try {
            const employees: EmployeeSheetImport[] = importData.map(toEmployeeSheetImport);
            const employeesToBeCreated: Employee[] = importData.map(toEmployee(this.props.entities));

            this.setState({ employees, employeesToBeCreated, error: null });
        } catch (e) {
            this.setState({ error: e.message })
        }
    }
}

export const toEmployeeSheetImport = (employeeLine): EmployeeSheetImport => {
    return {
        firstName: employeeLine[0],
        lastName: employeeLine[1],
        email: employeeLine[2],
        residence: employeeLine[3],
        insider: parseInt(employeeLine[4], 10),
        entityName: employeeLine[5],
        soc_sec: parseSocSec(employeeLine[6]),
        internal_identification: employeeLine[7],
    };
};

export const parseSocSec = (socSec: string | undefined): number | null => socSec ? parseFloat(changeCommaForPunctuation(socSec)) : null;

export const toEmployee = (entities) => (employeeLine) => {
    // const entityId = entityIdForName(entities, employeeLine[5]);
    const entityId = employeeLine[5];
    const residenceCode = countryCodeForCountryName(employeeLine[3]);

    return {
        firstName: employeeLine[0],
        lastName: employeeLine[1],
        email: employeeLine[2],
        residence: residenceCode,
        insider: parseInt(employeeLine[4], 10) === 1,
        entity_id: entityId,
        soc_sec: typeof parseSocSec(employeeLine[6]) === "number" ? parseSocSec(employeeLine[6]).toString() : null,
        internal_identification: employeeLine[7],
        mobility_entries: [createDefaultMobilityEntry(entityId)]
    };
};

export const sheetImportToEmployee = (entities: Entity[]) => (e: EmployeeSheetImport): Employee => {
    const entityId = entityIdForName(entities, e.entityName);
    const residenceCode = countryCodeForCountryName(e.residence);

    return {
        firstName: e.firstName,
        lastName: e.lastName,
        email: e.email,
        residence: residenceCode,
        insider: e.insider === 1,
        entity_id: entityId,
        soc_sec: e.soc_sec ? e.soc_sec.toString() : null,
        internal_identification: e.internal_identification,
        mobility_entries: [createDefaultMobilityEntry(entityId)]
    };
};

const entityIdForName = (entities: Entity[], entityName: string): string => {
    const entity = entities.filter((e) => e.name === entityName)[0];

    if (!entity) {
        throw new Error(`Error parsing entity name: ${entityName}. It does not match any of stored entity names.`)
    }

    return entity.id;
};

export const entityNameForId = (entities: Entity[], entityId: string): string => {
    const entity = entities.filter((e) => e.id === entityId)[0];
    console.log(entities, entityId);
    if (!entity) {
        throw new Error(`Error parsing entity name: ${entityId}. It does not match any of stored entity names.`)
    }

    return entity.name;
};

const countryCodeForCountryName = (countryName: string): string => {
    const country = countryOptions.filter((c) => c.text === countryName)[0];

    if (!country) {
        throw new Error(`Error parsing country name: ${countryName}. It does not match any of stored countries.`)
    }

    return country.key;
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (dispatch) => ({
    createEmployees: (employees) => dispatch({ type: IMPORT_ALL_EMPLOYEES, employees })
});

export default connect<null, DispatchProps>(null, mapDispatchToProps)(EmployeeImport);
