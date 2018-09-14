import React, { Component } from 'react';
import {Table, Flag, FlagProps, Button, DropdownItemProps, Card } from 'semantic-ui-react';
import { countryOptions } from "../data/common";
import { Employee } from "./employee-reducer";
import { handleSortFunction, SortState} from "../utils/sort";
import { Link } from "react-router-dom";
import moment from "moment";
import { norwegianShortDate } from "../utils/utils";

interface Props {
    employees: Employee[],
    entityOptions: DropdownItemProps,
    editFormClicked: (employee: Employee) => void,
    openModalClicked: (employee: Employee) => void,
    viewDetailsLink: (employeeId: string) => string,
}

class ViewAllEmployees extends Component<Props, SortState> {

    constructor(props) {
        super(props);
        this.state = {
            column: null,
            data: this.props.employees,
            direction: "ascending"
        }
    }

    handleSort = clickedColumn => () => {
        this.setState(handleSortFunction(clickedColumn, this.state));
    };

    render() {

        const { employees, entityOptions, openModalClicked, editFormClicked, viewDetailsLink } = this.props;

        const name = (firstName, lastName) => `${firstName} ${lastName}`;

        return (
            <div className='block-s'>
                <Card fluid>
                    <Table celled padded sortable compact={"very"}>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell onClick={this.handleSort(`${"firstName"}`)}>Name</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort("email")}>Email</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort("internal_identification")}>Internal Id</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort("entity_id")}>Entity</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort("residence")}>Country</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort("account_id")}>Account ID</Table.HeaderCell>
                                <Table.HeaderCell>Database ID</Table.HeaderCell>
                                <Table.HeaderCell>SocSec</Table.HeaderCell>
                                <Table.HeaderCell>Termination</Table.HeaderCell>
                                <Table.HeaderCell>Actions</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {
                                employees.map((employee) => {
                                    const country = countryOptions.filter((option) => option.value === employee.residence)[0];
                                    const flagProps: FlagProps = { name: country.flag } as FlagProps;

                                    // const entity = entityOptions.filter((option) => option.value === employee.entity_id)[0];
                                    const entity = employee.entity;

                                    return (
                                        <Table.Row key={employee.id}>
                                            <Table.Cell>{`${employee.firstName} ${employee.lastName}`}</Table.Cell>
                                            <Table.Cell>{employee.email}</Table.Cell>
                                            <Table.Cell>{employee.internal_identification}</Table.Cell>
                                            <Table.Cell>{entity && entity.name}</Table.Cell>
                                            <Table.Cell><Flag {...flagProps} />{country.text}</Table.Cell>
                                            <Table.Cell>{employee.account_id}</Table.Cell>
                                            <Table.Cell singleLine>{employee.id}</Table.Cell>
                                            <Table.Cell>{employee.soc_sec}</Table.Cell>
                                            <Table.Cell>{employee.termination_date && moment(employee.termination_date).format(norwegianShortDate)}</Table.Cell>
                                            <Table.Cell singleLine>
                                                <Link to={viewDetailsLink(employee.id)}><Button basic>View details</Button></Link>
                                                <Button basic onClick={editFormClicked.bind(this, employee)}>Edit Employee</Button>
                                                <Button basic color='red' onClick={openModalClicked.bind(this, employee)}>Delete Employee</Button>
                                                {
                                                    !employee.termination_date &&
                                                    <Link to={`/admin/employees/${employee.id}/terminate`}><Button basic>Terminate Employee</Button></Link>
                                                }
                                            </Table.Cell>
                                        </Table.Row>
                                    );
                                })
                            }
                        </Table.Body>
                    </Table>
                </Card>
            </div>
        )
    }
}

export default ViewAllEmployees;
