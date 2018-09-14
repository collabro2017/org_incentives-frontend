import React, { Component } from 'react';
import { RootState } from "../../reducers/all-reducers";
import { subprogramById, trancheById } from "../../programs/program-selectors";
import { connect, MapStateToProps } from 'react-redux';
import { TrancheTransaction, VestingEvent } from "../award-reducer";
import {Button, Table} from "semantic-ui-react"
import moment from "moment";
import {Link, match, Route, withRouter} from "react-router-dom";
import { formatCurrency2Decimals, formatNumber, formatShortDate } from "../../utils/utils";
import {RouteComponentProps} from "react-router";
import {ViewAllTransactions} from "./view-all-transactions";
import {dividendEffectOptions} from "../../admin/dividend/create/dividend-create-form";
import CreateTransaction from "./create/create-transaction";


interface OwnProps {
    trancheId: string,
    match: match<{ trancheId: string }>
}

interface StateProps {
    tranche: VestingEvent
}

interface State {}

type Props = OwnProps & StateProps & RouteComponentProps<{}>;

class TrancheTransactionsPage extends Component<Props, State> {
    render() {
        const { tranche } = this.props;
        console.log(this.props);
        const createTransactionPath = `${this.props.match.url}/create`;
        const vestingEventId = this.props.match.params.trancheId;
        return (
            <div>
                <Route path={this.props.match.path} exact render={({ match }) =>
                    <ViewAllTransactions transactions={tranche.transactions} addTransactionLink={createTransactionPath} tranche={tranche}/>
                }/>
                <Route path={createTransactionPath} exact render={({ match }) =>
                    <CreateTransaction backLink={this.props.match.url} save={() => ({})} vestingEventId={vestingEventId}/>
                }/>
            </div>
        );
    }
}
const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state, ownProps): StateProps => {
    return ({
        tranche: trancheById(ownProps.trancheId)(state),
    });
};

export default withRouter<OwnProps>(connect<StateProps, null>(mapStateToProps, null)(TrancheTransactionsPage));
