import React, {Component} from "react";
import {Link, match, withRouter} from "react-router-dom";
import { Button } from "semantic-ui-react";
import {AdjustmentType, CreateTransactionForm} from "./create-transaction-form";
import {FETCH_EMPLOYEES_AND_FILES} from "../../../files/files-actions";
import {connect} from "react-redux";
import {CREATE_TRANSACTION} from "../transaction-actions";
import {RouteComponentProps} from "react-router";
import moment, {Moment} from "moment";
import {apiShortDate, changeCommaForPunctuation, norwegianShortDate} from "../../../utils/utils";

interface OwnProps {
    backLink: string,
    save: () => void,
    vestingEventId: string,
}

interface State {
    transactionType: string,
    vestingDate: string,
    transactionDate: string,
    fair_value: string,
}

export interface CreateTransactionData {
    transaction_type: AdjustmentType,
    transaction_date: string,
    vested_date?: string,
    strike?: number,
    fair_value?: number,
}

interface DispatchProps {
    saveTransaction: (payload: CreateTransactionData, vestingEventId: string, redirectAfterSuccessLink?: string) => void,
}

type Props = OwnProps & DispatchProps;

class CreateTransaction extends Component<Props, State> {
    state = {
        transactionType: null,
        vestingDate: "",
        transactionDate: moment().format(norwegianShortDate),
        fair_value: "",
        strike: "",
    };

    render() {
        const { transactionType, vestingDate, fair_value, transactionDate, strike } = this.state;
        return (
            <div>
                <h1>Add transaction</h1>
                <div className="block-m">
                    <CreateTransactionForm
                        handleTextChange={this.handleInputChange}
                        transactionType={transactionType}
                        vestingDate={vestingDate}
                        fair_value={fair_value}
                        strike={strike}
                        transactionDate={transactionDate}
                    />
                </div>
                <div className="text-center">
                    <Button as={Link} to={this.props.backLink}>Back</Button>
                    <Button positive onClick={this.save}>Save</Button>
                </div>
            </div>
        );
    }

    private save = () => {
        if (AdjustmentType[this.state.transactionType] === AdjustmentType.ADJUSTMENT_VESTING_DATE) {
            this.saveAdjustmentVesting();
        } else if (this.state.transactionType === AdjustmentType.ADJUSTMENT_STRIKE) {
            this.saveAdjustmentStrike();
        }
    };

    private saveAdjustmentVesting = () => {
        const transactionDate = moment(this.state.transactionDate, norwegianShortDate);
        const vestingDate = moment(this.state.vestingDate, norwegianShortDate);

        if (!transactionDate.isValid()) {
            throw new Error(`Transaction date invalid. Input: ${this.state.transactionDate}`);
        }

        if (!vestingDate.isValid()) {
            throw new Error(`Vesting date invalid. Input: ${this.state.vestingDate}`);
        }

        const fair_value = parseFloat(changeCommaForPunctuation(this.state.fair_value));

        const data: CreateTransactionData = {
            transaction_type: this.state.transactionType,
            transaction_date: transactionDate.format(apiShortDate),
            vested_date: vestingDate.format(apiShortDate),
            fair_value: isNaN(fair_value) ? null : fair_value,
        };

        this.props.saveTransaction(data, this.props.vestingEventId, this.props.backLink);
    };

    private saveAdjustmentStrike = () => {
        const transactionDate = moment(this.state.transactionDate, norwegianShortDate);
        const strike = parseFloat(changeCommaForPunctuation(this.state.strike));

        if (!transactionDate.isValid()) {
            throw new Error(`Transaction date invalid. Input: ${this.state.transactionDate}`);
        }

        if (isNaN(strike)) {
            throw new Error(`New strike invalid. Input: ${this.state.strike}`);
        }

        const fair_value = parseFloat(changeCommaForPunctuation(this.state.fair_value));

        const data: CreateTransactionData = {
            transaction_type: this.state.transactionType,
            transaction_date: transactionDate.format(apiShortDate),
            strike,
            fair_value: isNaN(fair_value) ? null : fair_value,
        };

        this.props.saveTransaction(data, this.props.vestingEventId, this.props.backLink);
    };


    private handleInputChange = (event, {value, name}) => {
        this.setState({[name]: value})
    };
}

const mapDispatchToProps = (dispatch): DispatchProps => ({
    saveTransaction: (payload: CreateTransactionData, vestingEventId: string, redirectAfterSuccessLink?: string) => dispatch({ type: CREATE_TRANSACTION, payload, vestingEventId, redirectAfterSuccessLink }),
});

export default connect<null, DispatchProps>(null, mapDispatchToProps)(CreateTransaction);

