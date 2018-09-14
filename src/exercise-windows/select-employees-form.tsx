import React, {Component} from "react";
import {Form, Checkbox, Table, Header, Modal, Icon, Button} from "semantic-ui-react";
import SpinnerFullScreen from "../common/components/spinner-full-screen";
import {employeeName} from "../utils/utils";
import {FETCH_EMPLOYEES} from "../employees/employee-actions";
import {Employee} from "../employees/employee-reducer";
import {connect} from "react-redux";

interface OwnProps {
    closeModal: () => void,
    confirmSelection: (selectedEmployees: string[]) => void,
    selectedEmployees: string[]
}

interface State {
    all_selected: boolean,
    selected: boolean[]
}

interface StateProps {
    isFetching: boolean,
    employees: Employee[]
}

interface DispatchProps {
    fetchEmployees: () => void,
}

type Props = OwnProps & DispatchProps & StateProps;

class SelectEmployeesForm extends Component<Props, State> {
    state = {
        all_selected: false,
        selected: []
    };

    componentDidMount() {
        this.props.fetchEmployees();
    }

    componentWillReceiveProps(newProps: Props) {
        if (this.props.employees !== newProps.employees) {
            const selected = newProps.employees.map((e) => this.props.selectedEmployees.includes(e.id));
            this.setState({ selected })
        }
    }

    render() {
        return (
            <div>
                <Modal open closeIcon={<Icon className="close icon"/>} onClose={this.props.closeModal}>
                    <Header content="Select employees" textAlign={"center"}/>
                    <Modal.Content>
                        <SpinnerFullScreen active={this.props.isFetching}/>
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell><Checkbox onChange={this.toggleSelectAll}
                                                                checked={this.state.all_selected}/></Table.HeaderCell>
                                    <Table.HeaderCell>Employee</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {
                                    this.props.employees.map((employee, index) => (
                                        <Table.Row key={employee.id}>
                                            <Table.Cell>{<Checkbox onChange={this.toggleEmployee.bind(this, index)}
                                                                   checked={this.state.selected[index]}/>}</Table.Cell>
                                            <Table.Cell>{employeeName(employee)}</Table.Cell>
                                        </Table.Row>
                                    ))
                                }
                            </Table.Body>
                        </Table>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={this.props.closeModal}>
                            Close
                        </Button>
                        <Button
                            color='green'
                            onClick={this.okClicked}
                            inverted>
                            <Icon name='checkmark'/> Ok
                        </Button>
                    </Modal.Actions>
                </Modal>
            </div>
        )
    }

    private toggleEmployee = (index) => {
        const selected = this.state.selected.map((value, i) => i === index ? !value : value);
        const all_selected = selected.every((value) => value);
        this.setState({selected, all_selected})
    };

    private toggleSelectAll = () => {
        const all_selected = !this.state.all_selected;
        const selected = Array(this.props.employees.length).fill(all_selected);
        this.setState({selected, all_selected})
    };

    private okClicked = () => {
        const selected = this.props.employees.filter((e, index) => this.state.selected[index]).map(e => e.id);
        console.log(this.state.selected, selected);
        this.props.confirmSelection(selected);
    };
}

const mapStateToProps = (state): StateProps => {
    return ({
        employees: state.employee.allEmployees,
        isFetching: state.employee.isFetchingEmployees
    });
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchEmployees: () => dispatch({type: FETCH_EMPLOYEES}),
});

const ConnectedComponent = connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(SelectEmployeesForm);

export default ConnectedComponent;
