import React, { StatelessComponent } from "react";
import { RootState } from "../reducers/all-reducers";
import { connect, MapStateToProps } from 'react-redux';
import { SubProgram } from "../subprograms/subprogram-reducer";
import { subprogramById } from "../programs/program-selectors";
import ListSubprogramAwards from "./list-subprogram-awards";
import { Award } from "./award-reducer";
import { DropdownItemProps } from "semantic-ui-react";
import { Location } from "history";
import { match } from "react-router-dom";

interface OwnProps {
    location: Location,
    subProgramId: string,
    employeeOptions: DropdownItemProps[],
    openEditForm: (award: Award, subProgram: SubProgram) => void,
    deleteAward: (award: Award) => void,
    match: match<{}>
}

interface StateProps {
    subProgram?: SubProgram
}

type Props = OwnProps & StateProps;

const SubprogramAwardsPage: StatelessComponent<Props> = ({ openEditForm, deleteAward, employeeOptions, subProgram, match }) => (
    <div>
        <h1>Awards for subprogram {subProgram.name}</h1>
        <ListSubprogramAwards
            subProgram={subProgram}
            employeeOptions={employeeOptions}
            openEditForm={openEditForm}
            deleteAward={deleteAward}
            createTransactionsLink={(vestingEventId) => `${match.url}/tranche/${vestingEventId}/transactions`}
        />
    </div>
);

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state, ownProps): StateProps => {
    return ({
        subProgram: subprogramById(ownProps.subProgramId)(state),
    });
};

export default connect(mapStateToProps)(SubprogramAwardsPage);
