import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SubProgram } from "./subprogram-reducer";
import NewSubProgram from "./new-subprogram";
import { Program } from "../programs/program-reducer";
import { DropdownItemProps } from "semantic-ui-react";
import {POST_SUBPROGRAM, PUT_SUBPROGRAM} from "./subprogram-actions";
import EditSubProgram from "./edit-subprogram";

interface DispatchProps {
    saveSubProgram: (subProgram: SubProgram, programId: string) => void,
    putSubProgram: (subProgram: SubProgram, programId: string, subProgramId: string) => void
}

interface OwnProps {
    program: Program,
    subProgram: SubProgram,
    instrumentsOptions: DropdownItemProps[],
    settlementOptions: DropdownItemProps[]
    closeForm: () => void,
}

type Props = OwnProps & DispatchProps


class SubProgramManagementPage extends Component<Props, {}> {

    render() {
        return (
            <div>
                {
                    this.props.program && this.props.subProgram ?
                        <EditSubProgram program={this.props.program} instrumentsOptions={this.props.instrumentsOptions}
                                        settlementOptions={this.props.settlementOptions} addSubProgram={this.editSubProgram}
                                        closeFormClicked={this.props.closeForm} selectedSubProgram={this.props.subProgram}/>
                        :
                        <NewSubProgram program={this.props.program} instrumentsOptions={this.props.instrumentsOptions}
                                       settlementOptions={this.props.settlementOptions} addSubProgram={this.saveSubProgram}
                                       closeFormClicked={this.props.closeForm}/>
                }
            </div>
        )
    }

    private saveSubProgram = (subProgram) => {
        this.props.saveSubProgram(subProgram, this.props.program.id);
        this.props.closeForm();
    };

    private editSubProgram = (subProgram: SubProgram) => {
        this.props.putSubProgram(subProgram, this.props.program.id, this.props.subProgram.id);
        this.props.closeForm();
    };
}

const mapDispatchToProps = (dispatch): DispatchProps => ({
    saveSubProgram: (subProgram: SubProgram, programId: string) => dispatch({ type: POST_SUBPROGRAM, subProgram, programId }),
    putSubProgram: (subProgram: SubProgram, programId: string, subProgramId: string) => dispatch ({ type: PUT_SUBPROGRAM, subProgram, programId, subProgramId })
});

const ConnectedComponent = connect<null, DispatchProps>(null, mapDispatchToProps)(SubProgramManagementPage);

export default ConnectedComponent;
