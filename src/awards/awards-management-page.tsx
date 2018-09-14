import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DropdownItemProps, Dimmer, Loader, Message } from 'semantic-ui-react';
import { Program } from "../programs/program-reducer";
import { Employee } from "../employees/employee-reducer";
import { Award } from "./award-reducer";
import AllAwardsManagement from './all-awards-management';
import AwardEmployeeManagement from "./award-employee-management";
import { SubProgram } from "../subprograms/subprogram-reducer";
import { POST_AWARD } from "./award-actions";
import { match } from "react-router";
import SpinnerFullScreen from "../common/components/spinner-full-screen";

interface DispatchProps {
    fetchEmployeesAndPrograms: () => void,
    selectSubProgram: (subProgram: SubProgram) => void,
    postAward: (award: Award) => void
}

interface StateProps  {
    programs: Program[],
    employees: Employee[],
    subProgram: SubProgram,
    isFetching: boolean
}

interface OwnProps {
    match: match<any>,
}

type Props = DispatchProps & StateProps & OwnProps

class AwardsManagementPage extends Component<Props, {}> {

    state = {
        showForm: false
    };

    componentDidMount() {
        this.props.fetchEmployeesAndPrograms();
    }

    render() {

        const { isFetching, programs } = this.props;

        if (isFetching) {
            return <SpinnerFullScreen active/>;
        }

        if (!this.state.showForm && !isFetching && programs && programs.length === 0) {
            return (
                <div className="text-content-center">
                    <Message
                        header='You have no awards yet'
                        content='When you register awards to your employees, they will appear here. Awards available here are only for a specific company incentive program determined by the selected client.'
                    />
                </div>
            )
        }

        return (
            <div className='width-limit-small'>
                {
                    this.state.showForm ?
                        <div className='block-m'>
                            <h2 className="text-center block-xs">Add awards</h2>
                            <p className="text-content">Add awards to your employees
                                here...
                            </p>
                        </div>
                        :
                        <div className="width-limit block-s">
                            <h2 className="text-center">Awards</h2>
                        </div>
                }
                {
                    programs && programs.length > 0 && !this.state.showForm ?
                        <div>
                            <AllAwardsManagement
                                programs={this.props.programs}
                                employeeOptions={employeeOptions(this.props.employees)}
                                selectSubProgram={this.selectSubProgram}
                                employees={this.props.employees}
                            />
                        </div>
                        :
                        <AwardEmployeeManagement closeForm={this.closeForm} employeeOptions={employeeOptions(this.props.employees)}
                                                 postAward={this.postNewAward} subProgram={this.props.subProgram}/>
                }

            </div>
        )
    }

    private selectSubProgram = (subProgram: SubProgram) => {
        this.props.selectSubProgram(subProgram);
        this.setState({ showForm: true });
    };

    private closeForm = () => {
        this.setState({ showForm: false });
    };

    private postNewAward = (award: Award) => {
        this.props.postAward(award);
        this.setState({ showForm: false });
    };
}

const name = (firstName, lastName) => `${firstName} ${lastName}`;

export const employeeOptions = (employees): DropdownItemProps[] => employees.map((e) => ({
    key: e.id,
    value: e.id,
    text: name(e.firstName, e.lastName)
}));

const mapStateToProps = (state): StateProps => {
    return({
        programs: state.program.allPrograms,
        employees: state.employee.allEmployees,
        subProgram: state.subProgram.selectedSubProgram,
        isFetching: state.award.isFetching
    })
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchEmployeesAndPrograms: () => dispatch ({ type: 'FETCH_EMPLOYEES_AND_PROGRAMS' }),
    selectSubProgram: (subProgram: SubProgram) => dispatch ({ type: 'SELECT_SUBPROGRAM', subProgram }),
    postAward: (award: Award) => dispatch ({ type: POST_AWARD, award })
});

const ConnectedComponent = connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(AwardsManagementPage);

export default ConnectedComponent;