import React, { Component } from "react";
import { connect } from "react-redux";
import { Employee } from "../employees/employee-reducer";
import { withRouter, RouteComponentProps } from "react-router";
import { Table, Flag, FlagProps, DropdownItemProps } from "semantic-ui-react";
import { countryOptions } from "../data/common";
import { Entity } from "../entity/entity-reducer";
import moment from "moment";

interface DispatchProps {
    fetchEmployeesAndEntities: () => void
}

interface StateProps {
    employees: Employee[],
    entities: Entity[],
    isFetching: boolean
}

type Props = RouteComponentProps<{}> & DispatchProps & StateProps

class EmployeeMenuPage extends Component<Props, {}> {


    componentDidMount() {
        this.props.fetchEmployeesAndEntities();
    };

    render() {
        return (
            <div>
                <div className="width-limit-medium text-center">
                    <h2 className="block-xs">Employees</h2>
                    <div>
                        <div className='block-m'>
                            <Table>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>Id</Table.HeaderCell>
                                        <Table.HeaderCell>Name</Table.HeaderCell>
                                        <Table.HeaderCell>Email</Table.HeaderCell>
                                        <Table.HeaderCell>Entity</Table.HeaderCell>
                                        <Table.HeaderCell>Country</Table.HeaderCell>
                                        <Table.HeaderCell>Account id</Table.HeaderCell>
                                        <Table.HeaderCell>Created Date</Table.HeaderCell>
                                        <Table.HeaderCell>Updated Date</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {
                                        this.props.employees.map((employee) => {
                                            const country = countryOptions.filter((option) => option.value === employee.residence)[0];
                                            const flagProps: FlagProps = { name: country.flag } as FlagProps;

                                            const entity = entityOptions(this.props.entities).filter((option) => option.value === employee.entity_id)[0];

                                            return (
                                                <Table.Row key={employee.id}>
                                                    <Table.Cell>{employee.id}</Table.Cell>
                                                    <Table.Cell>{`${employee.firstName} ${employee.lastName}`}</Table.Cell>
                                                    <Table.Cell>{employee.email}</Table.Cell>
                                                    <Table.Cell>{entity.text}</Table.Cell>
                                                    <Table.Cell><Flag {...flagProps} />{country.text}</Table.Cell>
                                                    <Table.Cell>{employee.account_id}</Table.Cell>
                                                    <Table.Cell>{`${moment(employee.created_at).format("lll")}`}</Table.Cell>
                                                    <Table.Cell>{`${moment(employee.updated_at).format("lll")}`}</Table.Cell>
                                                </Table.Row>
                                            );
                                        })
                                    }
                                </Table.Body>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export const entityOptions = (entities): DropdownItemProps[] => entities.map((e) => ({
    key: e.id,
    value: e.id,
    text: e.name
}));

const mapStateToProps = (state): StateProps => {
    return ({
        employees: state.employee.allEmployees,
        entities: state.entity.allEntities,
        isFetching: state.employee.isFetching
    })
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchEmployeesAndEntities: () => dispatch ({ type: 'FETCH_EMPLOYEES_AND_ENTITIES' })
});

const ConnectedComponent = connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(EmployeeMenuPage);

export default withRouter<{}>(ConnectedComponent);