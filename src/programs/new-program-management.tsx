import React, { Component } from 'react';
import {connect, MapDispatchToProps} from 'react-redux';
import { Program } from "./program-reducer";
import { SubProgram } from "../subprograms/subprogram-reducer";
import ViewProgram from "./view-program";
import NewProgram from "./new-program";
import NewSubProgram from "../subprograms/new-subprogram";
import { ADD_PROGRAM, POST_PROGRAM } from "./program-actions";
import { ADD_SUBPROGRAM } from "../subprograms/subprogram-actions";


interface DropdownOption {
    key: string,
    value: string,
    text: string,
}

interface StateProps {
    program?: Program,
    subProgram: SubProgram,
}

interface DispatchProps {
    addProgram: (program: Program) => void,
    addSubProgram: (subProgram: SubProgram) => void,
    saveProgram: (program: Program) => void,
}

interface OwnProps {
    closeFormClicked: () => void
    instrumentsOptions: DropdownOption[],
    settlementOptions: DropdownOption[]
}

type Props = OwnProps & DispatchProps & StateProps;

class NewProgramManagement extends Component<Props, {}> {

    render() {
        return (
            <div className="form-greyscale">
                {
                    this.props.program &&
                        <ViewProgram program={this.props.program} saveProgram={this.saveProgram} closeProgram={this.props.closeFormClicked}/>

                }
                {
                    !this.props.program &&
                        <NewProgram addProgram={this.addProgram} closeFormClicked={this.props.closeFormClicked}/>
                }
                {
                    this.props.program && this.props.program.incentive_sub_programs.length === 0 &&
                        <NewSubProgram program={this.props.program}
                                   addSubProgram={this.addSubProgram}
                                   instrumentsOptions={this.props.instrumentsOptions}
                                   settlementOptions={this.props.settlementOptions}
                                   closeFormClicked={this.props.closeFormClicked}/>
                }
            </div>
        )
    }

    private addProgram = (program: Program) => {
        this.props.addProgram(program);
    };

    private addSubProgram = (subProgram: SubProgram) => {
        this.props.addSubProgram(subProgram);
        this.setState({ openModal: true });
    };

    private saveProgram = () => {
        this.props.saveProgram(this.props.program);
        this.props.closeFormClicked();
    };
}

const mapStateToProps = (state): StateProps => {
    return ({
        program: state.program.program,
        subProgram: state.program.subProgram,
    })
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch): DispatchProps => ({
    addProgram: (program: Program) => dispatch({ type: ADD_PROGRAM, program }),
    addSubProgram: (subProgram: SubProgram) => dispatch({ type: ADD_SUBPROGRAM, subProgram }),
    saveProgram: (program: Program) => dispatch({ type: POST_PROGRAM, program }),
});

const ConnectedComponent = connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(NewProgramManagement);

export default ConnectedComponent;