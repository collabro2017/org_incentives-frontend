import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Button } from "semantic-ui-react";
import { match } from "react-router-dom";
import { createDividendAction, fetchDividendsAction } from "./dividend-action-creators";
import { Dividend } from "./dividend-reducer";
import { getDividends, getIsFetchingDividends } from "./dividend-selectors";
import { RootState } from "../../reducers/all-reducers";
import { MapStateToProps } from "react-redux";
import SpinnerFullScreen from "../../common/components/spinner-full-screen";
import ViewAllDividends from "./dividend-view-all";
import { Link } from "react-router-dom";
import { dividendsRoute } from "../../menu/menu";
import { Route, Switch } from 'react-router-dom';
import CreateDividend from "./create/dividend-create";

interface OwnProps {
    match: match<{}>
}

export interface CreateDividendBody {
    dividend_date: string,
    dividend_per_share: string,
    share_price_at_dividend_date: string,
    dividend_transactions: DividendTransaction[]
}

export interface DividendTransaction {
    sub_program_id: string,
    dividend_transaction_type: string,
}

interface DispatchProps {
    fetchDividends: () => void,
    createDividend: (dividend: CreateDividendBody) => void,
}

interface StateProps {
    dividends: Dividend[]
    isFetchingDividends: boolean,
}

interface State {

}

type Props = OwnProps & DispatchProps & StateProps;

class DividendManagementPage extends Component<Props, State> {
    componentDidMount() {
        this.props.fetchDividends();
    }

    render() {
        if (this.props.isFetchingDividends) {
            return <SpinnerFullScreen active />
        }

        const { dividends } = this.props;
        console.log(dividends)
        return (
            <Switch>
                <Route path={newDividendPath} render={() => <CreateDividend createDividend={this.props.createDividend} backLink={dividendsRoute} />} />
                <Route path={"/"} render={() => (
                    <div className="width-limit-medium">
                        <h1>Dividends</h1>
                        <div className="block-m">
                            <ViewAllDividends dividends={dividends} />
                        </div>
                        <CreateDividendButton />
                    </div>
                )} />
            </Switch>
        )
    }

}

const newDividendPath = `${dividendsRoute}/new`;

const CreateDividendButton = () => (
    <div className='text-center'>
        <Link to={newDividendPath}>
            <Button primary basic>
                <i className="plus icon" />
                Register dividend
            </Button>
        </Link>
    </div>
);

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state): StateProps => {
    return ({
        dividends: getDividends(state),
        isFetchingDividends: getIsFetchingDividends(state),
    })
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchDividends: () => dispatch(fetchDividendsAction()),
    createDividend: (dividend: Dividend) => dispatch(createDividendAction(dividend))
});

const ConnectedComponent = connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(DividendManagementPage);

export default ConnectedComponent;


