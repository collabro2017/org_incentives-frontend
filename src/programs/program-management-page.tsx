import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Loader, Message, Dimmer, Icon } from 'semantic-ui-react';
import { Program } from "./program-reducer";
import NewProgramManagement from "./new-program-management";
import AllPrograms from './all-programs';
import { FETCH_PROGRAMS } from "./program-actions";
import ProgramImport from "./program-import";
import { Employee } from "../employees/employee-reducer";

export const instrumentOptions = [
    {
        key: 'rsu',
        value: 'rsu',
        text: 'RSU'
    },
    {
        key: 'rsa',
        value: 'rsa',
        text: 'RSA'
    },
    {
        key: 'option',
        value: 'option',
        text: 'Option'
    },
    {
        key: 'warrant',
        value: 'warrant',
        text: 'Warrant'
    }
];

export const settlementOptions = [
    {
        key: 'equity',
        value: 'equity',
        text: 'Equity'
    },
    {
        key: 'cash',
        value: 'cash',
        text: 'Cash'
    },
];

interface DispatchProps {
    fetchPrograms: () => void
}

interface StateProps {
    programs: Program[],
    isFetching: boolean
}

interface State {
    showForm: boolean,
    importForm: boolean
}

type Props = DispatchProps & StateProps

class ProgramManagementPage extends Component<Props, State> {

    state = {
        showForm: false,
        importForm: false
    };

    componentDidMount() {
        this.props.fetchPrograms();
    }

    render() {

        const { isFetching, programs } = this.props;
        const { showForm, importForm } = this.state;

        if (isFetching) {
            return (
                <div className="loader-full-screen">
                    <Dimmer active={isFetching}>
                        <Loader size="big" />
                    </Dimmer>
                </div>
            );
        }

        if (!showForm && !importForm && !isFetching && programs && programs.length === 0) {
            return (
                <div className="text-content-center">
                    <Message
                        header='You have no incentive programs yet'
                        content='When you create incentive programs for your employees, they will appear here. Incentive programs available here are only for a specific company determined by the selected client.'
                    />
                    <div className='text-center'>
                        <Button primary basic onClick={this.addNewProgram}>
                            <i className="plus icon" />
                            New Program
                        </Button>
                        <Button secondary basic onClick={this.openImportProgramsModal}>
                            <Icon name="upload"/>
                            Import Programs
                        </Button>
                    </div>
                </div>
            )
        }

        return (
            <div className={importForm ? 'width-limit-medium' : 'width-limit-small'}>
                {
                    showForm ?
                        <div className="block-m text-center">
                            <h2>Add Incentive Program</h2>
                            <p className="text-content">Create a new incentive program for your employees</p>
                        </div>
                        :
                        <div className="width-limit block-s">
                            {
                                !importForm && <h2 className="text-center">Incentive programs</h2>
                            }
                        </div>
                }
                {
                    programs && programs.length > 0 && !showForm && !importForm ?
                        <div>
                            <div className="text-center block-xs">
                                <Button primary basic onClick={this.addNewProgram}>
                                    <i className="plus icon" />
                                    New Program
                                </Button>
                                <Button secondary basic onClick={this.openImportProgramsModal}>
                                    <Icon name="upload"/>
                                    Import Programs
                                </Button>
                            </div>
                            <AllPrograms programs={programs} instrumentsOptions={instrumentOptions} settlementOptions={settlementOptions} closeForm={this.closeFormClicked}/>
                        </div>
                        :
                        <div className='width-limit-small'>
                            {
                                !importForm &&
                                    <NewProgramManagement instrumentsOptions={instrumentOptions} settlementOptions={settlementOptions} closeFormClicked={this.closeFormClicked}/>
                            }
                        </div>
                }
                {
                    importForm &&
                        <div className='form-greyscale'>
                            <div className='block-m'>
                                <h2 className="text-center block-xs">Import Programs</h2>
                                <p className="text-content">Import all incentive programs for your employees here...</p>
                            </div>
                            <div className="form-white block-xs" style={{ borderRadius: 5 }}>
                                <ProgramImport instrumentsOptions={instrumentOptions} settlementOptions={settlementOptions} closeImportProgramsModal={this.closeImportProgramsModal}/>
                            </div>
                            <div className="text-center">
                                <Button type='button' basic secondary onClick={() => this.setState({ importForm: false })}>Cancel</Button>
                            </div>
                        </div>
                }
            </div>
        )
    }

    private addNewProgram = () => {
        this.setState({ showForm: true });
    };

    private closeFormClicked = () => {
        this.setState({ showForm: false });
    };

    private openImportProgramsModal = () => {
        this.setState({ importForm: true });
    };

    private closeImportProgramsModal = () => {
        this.setState({ importForm: false });
    };
}

const mapStateToProps = (state): StateProps => {
    return({
        programs: state.program.allPrograms,
        isFetching: state.program.isFetching
    })
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchPrograms: () => dispatch ({ type: FETCH_PROGRAMS })
});

const ConnectedComponent = connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(ProgramManagementPage);


export default ConnectedComponent;
