import React, { Component } from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { DropdownItemProps, Modal, Button, Icon, Header } from 'semantic-ui-react';
import ListSubprogramAwards from "./list-subprogram-awards";
import ViewAllAwards from "./view-all-awards";
import { PurchaseConfig, SubProgram } from "../subprograms/subprogram-reducer";
import { Program } from "../programs/program-reducer";
import {Award} from "./award-reducer";
import AwardEmployeeManagement from "./award-employee-management";
import {DELETE_AWARD, PUT_AWARD} from "./award-actions";
import { Route, Switch } from "react-router";
import PurchasePage from "./purchase/purchase-page";
import { Employee } from "../employees/employee-reducer";
import { DELETE_PURCHASE_CONFIG } from "./purchase/purchase-actions";
import { RootState } from "../reducers/all-reducers";
import SubprogramAwardsPage from "./sub-program-awards-page";
import { dividendEffectOptions } from "../admin/dividend/create/dividend-create-form";
import TrancheTransactionsPage from "./transaction/tranche-transactions-page";

interface DispatchProps {
    putAward: (award: Award, awardId: string) => void,
    deleteAward: (award: Award, awardId: string) => void,
    deletePurchaseConfig: (id: string) => void,
}

interface StateProps {
    award: Award[],
    isDeletingPurchaseConfig: boolean,
    getPurchaseConfig: (subprogramId: string) => PurchaseConfig | null
}

interface OwnProps {
    programs: Program[],
    employees: Employee[],
    selectSubProgram: (subProgram: SubProgram) => void
    employeeOptions: DropdownItemProps[],
}

interface State {
    modalOpen: boolean,
    subProgramAwards: SubProgram,
    selectedAward?: Award,
    deletedAward?: Award
}

type Props = DispatchProps & StateProps & OwnProps

class AllAwardsManagement extends Component<Props, State> {

    state = {
        modalOpen: false,
        subProgramAwards: null,
        selectedAward: null,
        deletedAward: null
    };

    render() {
        if (this.state.subProgramAwards) {
            return (
                <div>
                    {
                        this.state.selectedAward &&
                        <AwardEmployeeManagement
                            closeForm={this.closeEditModal} employeeOptions={this.props.employeeOptions}
                            postAward={this.editSubProgramAward} subProgram={this.state.subProgramAwards}
                            selectedAward={this.state.selectedAward}/>

                    }
                    {
                        this.state.deletedAward &&
                            <Modal open={this.state.modalOpen}>
                                <i className="close icon" onClick={() => this.setState({ modalOpen: false, deletedAward: null })}/>
                                <Header icon='trash' content={`${this.state.subProgramAwards.name}`}/>
                                <Modal.Content>
                                    <p>Are you sure you want to delete the selected award for this subProgram?</p>
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button basic color='red' onClick={() => this.setState({ deletedAward: null })}>
                                        <Icon name='remove' /> No
                                    </Button>
                                    <Button color='green' inverted onClick={this.deleteSubProgramAward}>
                                        <Icon name='checkmark' /> Yes
                                    </Button>
                                </Modal.Actions>
                            </Modal>
                    }
                </div>
            )
        }
        return (
            <Switch>
                <Route path={"/admin/awards/subprogramawards/:subProgramId/tranche/:trancheId/transactions"} render={({ match, location }) =>
                    <TrancheTransactionsPage
                        trancheId={match.params.trancheId}
                        match={match}
                    />
                }/>
                <Route path={"/admin/awards/subprogramawards/:subProgramId"} render={({ match, location }) =>
                    <SubprogramAwardsPage
                        subProgramId={match.params.subProgramId}
                        location={location}
                        employeeOptions={this.props.employeeOptions}
                        openEditForm={this.openEditForm}
                        deleteAward={this.openDeleteForm}
                        match={match}
                    />
                }/>
                <Route path={"/"} render={() =>
                    <div>
                        <Route path={"/admin/awards/purchase/:subProgramId"} render={({ match, location }) =>
                            <PurchasePage subProgramId={match.params.subProgramId} employees={this.props.employees} location={location} purchaseConfig={this.props.getPurchaseConfig(match.params.subProgramId)} key={location.pathname} />
                        }/>
                        <ViewAllAwards
                            programs={this.props.programs}
                            openAwardForm={this.props.selectSubProgram}
                            deletePurchaseConfig={this.props.deletePurchaseConfig}
                            isDeletingPurchaseConfig={this.props.isDeletingPurchaseConfig}
                        />
                    </div>
                }/>
            </Switch>
        )
    }

    private openEditForm = (award: Award) => {
        this.setState({ modalOpen: false, selectedAward: award });
    };

    private closeEditModal = () => {
        this.setState({ modalOpen: true, selectedAward: null });
    };

    private editSubProgramAward = (award: Award) => {
        this.props.putAward(award, this.state.selectedAward.id);
        this.setState({ selectedAward: null });
    };

    private openDeleteForm = (award: Award) => {
        this.setState({ modalOpen: true, deletedAward: award })
    };

    private deleteSubProgramAward = () => {
        this.props.deleteAward(this.state.deletedAward, this.state.deletedAward.id);
    };
}

const purchaseConfigForSubProgram = (programs: Program[], subprogramId: string): PurchaseConfig | null => {
    let purchaseConfig = null;
    programs.forEach((p) => {
        const subProgram = p.incentive_sub_programs.filter((s) => s.id === subprogramId)[0];
        if (subProgram) {
            purchaseConfig = subProgram.purchase_config
        }
    });
    return purchaseConfig;
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state): StateProps => {
    return ({
        award: state.award.allAwards,
        isDeletingPurchaseConfig: state.program.isDeletingPurchaseConfig,
        getPurchaseConfig: purchaseConfigForSubProgram.bind(this, state.program.allPrograms)
    });
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    putAward: (award: Award, awardId: string) => dispatch({ type: PUT_AWARD, award, awardId }),
    deleteAward: (award: Award, awardId: string) => dispatch({ type: DELETE_AWARD, award, awardId }),
    deletePurchaseConfig: (id: string) => dispatch({ type: DELETE_PURCHASE_CONFIG, id }),
});

const ConnectedComponent = connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(AllAwardsManagement);

export default ConnectedComponent;