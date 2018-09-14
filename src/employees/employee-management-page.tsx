import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Loader, DropdownItemProps, Modal, Header, Icon, Dimmer, Message } from 'semantic-ui-react';
import { Employee } from "./employee-reducer";
import ViewAllEmployees from './view-all-employees';
import EmployeeForm from './employee-form';
import { Entity } from "../entity/entity-reducer";
import { DELETE_ALL_EMPLOYEES, DELETE_EMPLOYEE, POST_EMPLOYEE, PUT_EMPLOYEE, TERMINATE_EMPLOYEE } from "./employee-actions";
import EmployeeImport from "./employee-import";
import DeleteEmployeesModal from "./delete-employees-modal";
import {Route, Switch} from "react-router-dom";
import EmployeeTermination from "./employee-termination-modal";
import { employeesRoute } from "../menu/menu";
import {push, replace} from "react-router-redux";
import { Moment } from "moment";
import { match } from 'react-router';
import {apiShortDate, norwegianShortDate} from "../utils/utils";
import EmployeeDetailPage from "./employee-detail-page";

interface DispatchProps {
    fetchEmployeesAndEntities: () => void,
    postEmployee: (employee: Employee) => void,
    deleteEmployee: (employeeId: string) => void,
    putEmployee: (employeeId: string, employee: Employee) => void,
    deleteAllEmployees: (employees: Employee[]) => void
    redirectToEmployees: () => void,
    navigate: (url: string) => () => void,
    terminateEmployee: (employeeId: string, terminationDate: Moment) => void,
}

interface StateProps {
    employees: Employee[]
    entities: Entity[]
    isFetching: boolean
}

interface State {
    showForm: boolean,
    openModal: boolean,
    importModal: boolean,
    selectedEmployee?: Employee
}


type Props = DispatchProps & StateProps & { match: match<{}> }


class EmployeeManagementPage extends Component<Props, State> {

    state = {
        showForm: false,
        openModal: false,
        importModal: false,
        selectedEmployee: null
    };

    componentDidMount() {
        this.props.fetchEmployeesAndEntities();
    };

    render() {

        console.log(this.state.showForm);

        const { isFetching, employees, entities, navigate } = this.props;
        const { showForm, importModal, openModal, selectedEmployee } = this.state;

        if (isFetching) {
            return (
                <div className="loader-full-screen">
                    <Dimmer active={isFetching}>
                        <Loader size="big" />
                    </Dimmer>
                </div>
            )
        }

        if (!showForm && !importModal && !isFetching && employees && employees.length === 0) {
            return (
                <div className="text-content-center">
                    <Message
                        header='You have no employees yet'
                        content='When you register employees in your incentive programs, they will appear here. Employees available here are only for a specific company determined by the client selected.'
                    />
                    <div className='text-center'>
                        <Button primary basic onClick={this.addNewEmployee}>
                            <i className="plus icon"/>
                            New Employee
                        </Button>
                        <Button secondary basic onClick={this.openImportEmployeesForm}>
                            <Icon name="upload"/>
                            Import Employees
                        </Button>
                    </div>
                </div>
            )
        }

        const entityOptions = createEntityOptions(entities);
        return (
            <div className=''>
                <Switch>
                    <Route path={`/admin/employees/:employeeId/details`} render={({ match }) => (
                        <EmployeeDetailPage
                            entityOptions={entityOptions}
                            editEmployee={this.props.putEmployee.bind(this, match.params.employeeId)}
                            employee={this.props.employees.filter(e => e.id === match.params.employeeId)[0]}
                            backHandler={navigate("/admin/employees/")}
                        />
                    )}/>

                    <Route path={`/`} render={({ match }) => (
                        <div>
                            <Route path={`/admin/employees/:employeeId/terminate`} render={({ match }) => (
                                <EmployeeTermination
                                    closeModal={this.props.redirectToEmployees}
                                    confirm={this.props.terminateEmployee}
                                    employee={this.props.employees.filter(e => e.id === match.params.employeeId)[0]}
                                />
                            )}/>
                            {
                                showForm ?
                                    <div className='block-m'>
                                        <h2 className="text-center block-xs">Add employees</h2>
                                        <p className="text-content">Register all employees in your incentive programs
                                            here...
                                        </p>
                                    </div>
                                    :
                                    <div className="width-limit block-s">
                                        <h2 className="text-center">Employees</h2>
                                    </div>
                            }
                            {
                                employees && employees.length > 0 && !showForm ?
                                    <div className='form-greyscale'>
                                        <div className='flex-row align-center flex-end block-xs'>
                                            <Button primary basic onClick={this.addNewEmployee}>
                                                <i className="plus icon" />
                                                Add another employee
                                            </Button>
                                            <Button secondary basic onClick={this.openImportEmployeesForm}>
                                                <Icon name="upload"/>
                                                Import Employees
                                            </Button>
                                        </div>
                                        <div>
                                            <ViewAllEmployees
                                                employees={employees}
                                                entityOptions={entityOptions}
                                                openModalClicked={this.openModalClicked}
                                                editFormClicked={this.editFormClicked}
                                                viewDetailsLink={(employeeId) => `/admin/employees/${employeeId}/details`}
                                            />
                                        </div>
                                        <div className="text-center">
                                            <Button basic color='red' onClick={this.openDeleteAllEmployeesClicked}>
                                                Delete All Employees
                                            </Button>
                                        </div>
                                    </div>
                                    :
                                    <div>
                                        {
                                            !importModal &&
                                            <EmployeeForm
                                                saveEmployee={this.saveEmployee}
                                                entityOptions={entityOptions}
                                                onCloseForm={this.closeFormClicked}
                                                selectedEmployee={this.state.selectedEmployee}
                                            />
                                        }
                                    </div>
                            }
                            {
                                openModal &&
                                <DeleteEmployeesModal closeModal={() => this.setState({ openModal: false, selectedEmployee: null })} open={openModal}
                                                      selectedEmployee={this.state.selectedEmployee} deleteEmployee={this.deleteEmployee} deleteAllEmployees={this.deleteAllEmployees}/>
                            }
                            {
                                importModal &&
                                <Modal open={importModal}>
                                    <i className="close icon" onClick={() => this.setState({ importModal: false })}/>
                                    <div className='form-white'>
                                        <div className='block-m'>
                                            <h2 className="text-center block-xs">Import Employees</h2>
                                            <p className="text-content">Import all employees in your incentive programs
                                                here...
                                            </p>
                                        </div>
                                        <div className='form-greyscale' style={{ borderRadius: 5 }}>
                                            <EmployeeImport entities={entities} entityOptions={entityOptions} closeImportEmployeesForm={this.closeImportEmployeesForm}/>
                                        </div>
                                    </div>
                                </Modal>
                            }
                        </div>
                    )}/>


                </Switch>
            </div>
        )
    }

    private saveEmployee = (employee) => {
        if (this.state.selectedEmployee) {
            this.props.putEmployee(this.state.selectedEmployee.id, employee);
            this.setState({ selectedEmployee: null, showForm: false });
        } else {
            this.props.postEmployee(employee);
            this.setState({ showForm: false });
        }
    };

    private addNewEmployee = () => {
        this.setState({ showForm: true });
    };

    private deleteEmployee = () => {
        this.props.deleteEmployee(this.state.selectedEmployee.id);
        this.setState({ openModal: false, selectedEmployee: null });
    };

    private openModalClicked = (employee: Employee) => {
        this.setState({ openModal: true, selectedEmployee: employee });
    };

    private closeFormClicked = () => {
        this.setState({ showForm: false, selectedEmployee: null });
    };

    private openImportEmployeesForm = () => {
        this.setState({ importModal: true });
    };

    private closeImportEmployeesForm = () => {
        this.setState({ importModal: false });
    };

    private openDeleteAllEmployeesClicked = () => {
        this.setState({ openModal: true });
    };

    private deleteAllEmployees = () => {
        this.props.deleteAllEmployees(this.props.employees);
        this.setState({ openModal: false });
    };

    private editFormClicked = (employee: Employee) => {
        this.setState({ showForm: true, selectedEmployee: employee });
    };

    private editEmployee = (employee: Employee) => {

    };
}

export const createEntityOptions = (entities): DropdownItemProps[] => entities.map((e) => ({
    key: e.id,
    value: e.id,
    text: `${e.name} ${e.identification ? `(${e.identification})` : ''}`
}));

const mapStateToProps = (state): StateProps => {
    return({
        employees: state.employee.allEmployees,
        entities: state.entity.allEntities,
        isFetching: state.employee.isFetching
    });
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchEmployeesAndEntities: () => dispatch ({ type: 'FETCH_EMPLOYEES_AND_ENTITIES' }),
    redirectToEmployees: () => dispatch(replace(employeesRoute)),
    terminateEmployee: (employeeId: string, terminationDate: Moment) => dispatch({ type: TERMINATE_EMPLOYEE, employeeId, terminationDate: terminationDate.format(apiShortDate) }),
    postEmployee: (employee: Employee) => dispatch({ type: POST_EMPLOYEE, employee }),
    deleteEmployee: (employeeId: string) => dispatch({ type: DELETE_EMPLOYEE, employeeId }),
    putEmployee: (employeeId: string, employee: Employee) => dispatch({ type: PUT_EMPLOYEE, employee, employeeId }),
    navigate: (url: string) => () => dispatch(push(url)),
    deleteAllEmployees: (employees) => dispatch({ type: DELETE_ALL_EMPLOYEES, employees })
});

const ConnectedComponent = connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(EmployeeManagementPage);

export default ConnectedComponent;