import React, { Component } from 'react';
import * as _ from 'lodash';
import {connect, MapStateToProps} from 'react-redux';
import ListAllPrograms from './list-all-programs'
import { Program } from "./program-reducer";
import SubProgramManagementPage from "../subprograms/subprogram-management-page";
import { DropdownItemProps, Modal, Button, Header, Icon, Dimmer, Loader } from "semantic-ui-react";
import {DELETE_PROGRAM, PUT_PROGRAM} from "./program-actions";
import NewProgram from "./new-program";
import { SubProgram, VestingEventTemplate } from "../subprograms/subprogram-reducer";
import {DELETE_SUBPROGRAM} from "../subprograms/subprogram-actions";


interface DispatchProps {
    putProgram: (program: Program, programId: string) => void,
    deleteProgram: (programId: string) => void,
    deleteSubProgram: (programId: string, subProgramId: string) => void
}

interface StateProps {
    subProgram: SubProgram,
    isFetchingSubProgram: boolean,
    isFetchingProgram: boolean
}

interface OwnProps {
    programs: Program[],
    instrumentsOptions: DropdownItemProps[],
    settlementOptions: DropdownItemProps[],
    closeForm: () => void
}

interface State {
    selectedProgram: Program,
    selectedSubProgram: SubProgram
    editModal: boolean,
    deleteModal: boolean,
}

type Props = OwnProps & DispatchProps & StateProps

class AllPrograms extends Component<Props, State> {

    state = {
        selectedProgram: null,
        selectedSubProgram: null,
        editModal: false,
        deleteModal: false,
    };


    render() {
        const { isFetchingSubProgram, isFetchingProgram } = this.props;
        const { selectedProgram, editModal, deleteModal } = this.state;

        if (isFetchingSubProgram || isFetchingProgram) {
            return (
                <div className="loader-full-screen">
                    <Dimmer active={isFetchingSubProgram || isFetchingProgram}>
                        <Loader size="big" />
                    </Dimmer>
                </div>
            );
        }

        return (
            <div>
                {
                    selectedProgram && !editModal && !deleteModal?
                        <div className='form-greyscale'>
                            <SubProgramManagementPage
                                program={this.state.selectedProgram} closeForm={this.closeEditForm}
                                instrumentsOptions={this.props.instrumentsOptions}
                                settlementOptions={this.props.settlementOptions}
                                subProgram={this.state.selectedSubProgram}
                            />
                        </div>
                        :
                        <Modal open={editModal}>
                            <i className='close-icon' onClick={() => this.setState({ editModal: false })}/>
                            <div className='form-greyscale'>
                                <NewProgram addProgram={this.editProgram} closeFormClicked={this.closeEditForm} selectedProgram={selectedProgram}/>
                            </div>
                        </Modal>

                }
                {
                    selectedProgram && !editModal && deleteModal &&
                        <Modal open={deleteModal}>
                            <i className="close icon" onClick={() => this.setState({ deleteModal: false, selectedProgram: null })}/>
                            <Header icon='trash' content={`${this.state.selectedProgram.name}`}/>
                            <Modal.Content>
                                <p>Are you sure you want to delete this program?</p>
                            </Modal.Content>
                            <Modal.Actions>
                                <Button basic color='red' onClick={() => this.setState({ deleteModal: false, selectedProgram: null })}>
                                    <Icon name='remove' /> No
                                </Button>
                                <Button color='green' inverted onClick={this.deleteProgram}>
                                    <Icon name='checkmark' /> Yes
                                </Button>
                            </Modal.Actions>
                        </Modal>
                }
                {
                    !selectedProgram && !editModal && !deleteModal &&
                    <ListAllPrograms programs={this.props.programs} addNewSubProgram={this.addSubProgramToProgram} deleteSelectedSubProgram={this.props.deleteSubProgram}
                                     editSelectedProgram={this.openEditProgramModal} editSelectedSubProgram={this.openEditSubProgramForm} deleteSelectedProgram={this.openDeleteProgramModal}/>
                }
            </div>
        )
    }

    private addSubProgramToProgram = (program: Program) => {
        this.setState({ selectedProgram: program });
    };

    private openEditProgramModal = (program: Program) => {
        this.setState({ selectedProgram: program, editModal: true });
    };

    private openEditSubProgramForm = (program: Program, subProgram: SubProgram) => {
        this.setState({ selectedProgram: program, selectedSubProgram: subProgram });
    };

    private closeEditForm = () => {
        this.setState({ selectedProgram: null, selectedSubProgram: null, editModal: false });
    };

    private editProgram =(program: Program) => {
        this.props.putProgram(program, this.state.selectedProgram.id);
        this.setState({ selectedProgram: null, editModal: false });
    };

    private openDeleteProgramModal = (program: Program) => {
        this.setState({ selectedProgram: program, deleteModal: true, editModal: false });
    };

    private deleteProgram = () => {
        this.props.deleteProgram(this.state.selectedProgram.id);
        this.setState({ selectedProgram: null, deleteModal: false });
    };

}

const mapStateToProps = (state): StateProps => {
    return ({
        subProgram: state.subProgram.subProgram,
        isFetchingSubProgram: state.subProgram.isFetching,
        isFetchingProgram: state.program.isFetching
    })
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    putProgram: (program: Program, programId: string) => dispatch({ type: PUT_PROGRAM, program, programId }),
    deleteProgram: (programId: string) => dispatch ({ type: DELETE_PROGRAM, programId }),
    deleteSubProgram: (programId: string, subProgramId: string) => dispatch ({ type: DELETE_SUBPROGRAM, programId, subProgramId })
});

const ConnectedComponent = connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(AllPrograms);

export default ConnectedComponent;