import React, { StatelessComponent } from 'react';
import { Table,  Flag, FlagProps } from 'semantic-ui-react';
import { Employee } from "./entity-workflow";
import { countryOptions } from "../data/common";


export const AllEmployees: StatelessComponent<{ employees: Employee[] }> = ({ employees }) => (
    <div className={'block-m'}>
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Entity</Table.HeaderCell>
                    <Table.HeaderCell>Country</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {
                    employees.map((e) => {
                        const country = countryOptions.filter((option) => option.value === e.residence)[0];
                        const flagProps: FlagProps = { name: country.flag } as FlagProps;
                        return (
                            <Table.Row>
                                <Table.Cell>{`${e.firstName} ${e.lastName}`}</Table.Cell>
                                <Table.Cell>{e.entity}</Table.Cell>
                                <Table.Cell><Flag {...flagProps} />{country.text}</Table.Cell>
                            </Table.Row>
                        );
                    })
                }
            </Table.Body>
        </Table>
    </div>
);
