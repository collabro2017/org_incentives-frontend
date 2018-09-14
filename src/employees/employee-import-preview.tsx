import React, { StatelessComponent } from 'react';
import {Table, Flag, FlagProps, Button, DropdownItemProps } from 'semantic-ui-react';
import { countryOptions } from "../data/common";
import { Entity } from "../entity/entity-reducer";
import {EmployeeSheetImport, entityNameForId} from "./employee-import";

interface Props {
    employees: EmployeeSheetImport[],
    entities: Entity[]
}

const EmployeesPreview: StatelessComponent<Props> = ({ employees, entities }) => {

    return (
        <div className='block-m'>
            <Table celled padded>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Email</Table.HeaderCell>
                        <Table.HeaderCell>Entity</Table.HeaderCell>
                        <Table.HeaderCell>Country</Table.HeaderCell>
                        <Table.HeaderCell>Insider</Table.HeaderCell>
                        <Table.HeaderCell>SocSec</Table.HeaderCell>
                        <Table.HeaderCell>Internal Id</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {
                        employees.map((employee) => {
                            const country = countryOptions.filter((option) => option.text === employee.residence)[0];
                            const flagProps: FlagProps = { name: country.flag } as FlagProps;

                            return (
                                <Table.Row key={`${employee.firstName} ${employee.lastName}`}>
                                    <Table.Cell>{`${employee.firstName} ${employee.lastName}`}</Table.Cell>
                                    <Table.Cell>{employee.email}</Table.Cell>
                                    <Table.Cell>{entityNameForId(entities, employee.entityName)}</Table.Cell>
                                    <Table.Cell><Flag {...flagProps} />{country.text}</Table.Cell>
                                    <Table.Cell>{employee.insider}</Table.Cell>
                                    <Table.Cell>{employee.soc_sec}</Table.Cell>
                                    <Table.Cell>{employee.internal_identification}</Table.Cell>
                                </Table.Row>
                            );
                        })
                    }
                </Table.Body>
            </Table>
        </div>
    )
};


export default EmployeesPreview;
