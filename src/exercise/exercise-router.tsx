import React, { Component } from 'react';
import moment, { Moment } from "moment";
import { Window } from "../data/data";
import { Button } from 'semantic-ui-react';
import { connect, MapStateToProps } from 'react-redux';
import ExerciseTypeRoute from './exercise-type';
import Exercise from "./exercise";
import OverviewAndConfirm from "./overview-and-confirm";
import Terms from "./exercise-terms";
import { ExercisibleInstrumentsTerm, FlatAward } from "../instruments/instruments-reducer";
import { vestedAwards } from "../instruments/instruments-page";
import { ExerciseOrder, ExerciseOrderLine } from "./order/order-saga";
import { ErrorModal } from "../error/general-error-modal";
import ExerciseNotPossiblePage, { ExerciseNotPossibleReason } from "./exercise-not-possible-page";
import StepIndicator, { ExerciseStepPage, stepFromCurrentPage } from "./exercise-step-indicator";
import FormattedMessageWrapper from "../texts/content";
import { RootState } from "../reducers/all-reducers";
import SpinnerFullScreen from "../common/components/spinner-full-screen";
import numeral from "numeral";

export enum OrderExerciseType {
    EXERCISE_AND_SELL = 'EXERCISE_AND_SELL',
    EXERCISE_AND_SELL_TO_COVER = 'EXERCISE_AND_SELL_TO_COVER',
    EXERCISE_AND_HOLD = 'EXERCISE_AND_HOLD',
}

export const orderExerciseTypeDisplayText = (type: OrderExerciseType) => {
    if (type === OrderExerciseType.EXERCISE_AND_SELL) {
        return "Exercise & Sell";
    } else if (type === OrderExerciseType.EXERCISE_AND_SELL_TO_COVER) {
        return "Exercise & Sell to cover";
    } else if (type === OrderExerciseType.EXERCISE_AND_HOLD) {
        return "Exercise & Hold";
    }
};

export interface SharePrice {
    sharePrice: number,
    sharePriceDate: Moment,
}

export interface ExerciseOrderData {
    orderInstruments?: OrderInstrument[],
    exerciseType?: OrderExerciseType,
    vpsAccountNumber?: string,
    bankAccountNumber?: string,
    vpsNotReady: boolean,
    bankAccountNotReady: boolean,
    exerciseTypeFormHasErrors: boolean,
}

interface OrderInstrument {
    planId: string,
    vestingEventId: string,
    orderAmount: number,
    costPrice: number,
    lastClosePrice: number,
}

interface Props {
    window: Window,
    match: any,
    sharePrice: SharePrice,
}

interface StateProps {
    exercisibleAwards: FlatAward[],
    exercisibleInstrumentsTerm: ExercisibleInstrumentsTerm,
    isPlacingOrder: boolean,
    orderError?: string,
    bankAccountNumberForExercise?: string,
    bicNumberForExercise?: string,
    ibanNumberForExercise?: string,
    employeeName: string,
    companyName: string,
    payment_address?: string,
}

interface DispatchProps {
    placeOrder: (order: ExerciseOrder, window_id: string) => void
    removeOrderError: () => void
}

interface State {
    currentPage: ExerciseStepPage,
    redirectToStart: boolean,
}

const findDefaultSelectedExerciseType = (types: OrderExerciseType[]) => {
    if (types.includes(OrderExerciseType.EXERCISE_AND_HOLD)) {
        return OrderExerciseType.EXERCISE_AND_HOLD;
    } else if (types.includes(OrderExerciseType.EXERCISE_AND_SELL)) {
        return OrderExerciseType.EXERCISE_AND_SELL;
    } else {
        return OrderExerciseType.EXERCISE_AND_SELL_TO_COVER;
    }
};

class ExerciseRouter extends Component<Props & StateProps & DispatchProps, ExerciseOrderData & State> {
    constructor(props) {
        super(props);
        const orderInstruments = this.props.exercisibleAwards.filter(vestedAwards).map((award) => {
            return {
                planId: award.programId,
                vestingEventId: award.vestingEventId,
                orderAmount: award.quantity,
                costPrice: award.strike,
                lastClosePrice: this.props.sharePrice.sharePrice
            };
        });

        const type = findDefaultSelectedExerciseType(this.props.window.allowed_exercise_types.map(s => OrderExerciseType[s]));
        const vpsAccountNumber = '';
        const bankAccountNumber = '';
        const vpsNotReady = false;
        const bankAccountNotReady = false;
        this.state = {
            orderInstruments: orderInstruments,
            exerciseType: type,
            exerciseTypeFormHasErrors: !this.exerciseTypeFormValid(type, vpsAccountNumber, vpsNotReady, bankAccountNumber, bankAccountNotReady),
            vpsAccountNumber,
            bankAccountNumber,
            currentPage: ExerciseStepPage.QUANTITY,
            redirectToStart: false,
            vpsNotReady,
            bankAccountNotReady,
        };

    }

    render() {
        const { match, exercisibleAwards, window, exercisibleInstrumentsTerm } = this.props;

        if (exercisibleAwards.length === 0) {
            return <ExerciseNotPossiblePage reason={ExerciseNotPossibleReason.NO_EXERCISIBLE_OPTIONS} />
        }

        if (!window) {
            return <ExerciseNotPossiblePage reason={ExerciseNotPossibleReason.NOT_IN_AN_EXERCISE_WINDOW} />
        }

        const totalQuantity = this.state.orderInstruments.reduce((accu, op) => accu + op.orderAmount, 0);
        const totalCost = this.state.orderInstruments.reduce((accu, op) => accu + (op.orderAmount * op.costPrice), 0);
        const averageCost = totalCost / totalQuantity;
        const commission = window.commission_percentage ? numeral(window.commission_percentage / 100).format('0.00 %') : "1,70 %";
        return (
            <div className="main-content">
                {
                    this.props.orderError &&
                    <ErrorModal message={this.props.orderError} renderActions={() =>
                        <Button primary basic size={"big"} content="OK" onClick={this.props.removeOrderError} />
                    } />
                }
                <h1 className="block-m">
                    <FormattedMessageWrapper id="exercise.title" values={{ instrumentName: exercisibleInstrumentsTerm.plural }} />
                </h1>
                <div className="col-center block-l">
                    <StepIndicator step={stepFromCurrentPage(this.state.currentPage)} path={this.props.match.path}
                                   onClick={this.handleStepIndicatorClick} />
                </div>
                {
                    this.props.isPlacingOrder && <SpinnerFullScreen text="Placing order" active />
                }
                {
                    this.state.currentPage === ExerciseStepPage.QUANTITY &&
                    <Exercise window={this.props.window}
                              exercisibleAwards={exercisibleAwards}
                              instrumentTerm={exercisibleInstrumentsTerm}
                              sharePrice={this.props.sharePrice.sharePrice}
                              quantities={this.state.orderInstruments.map((op) => op.orderAmount.toString())}
                              quantityForPlan={this.setQuantityForPlan}
                              nextPath={`${this.props.match.path}/type`}
                              goBack={() => history.back()}
                              goForward={() => this.setState({ currentPage: ExerciseStepPage.TYPE })}
                              match={match} />
                }
                {
                    this.state.currentPage === ExerciseStepPage.TYPE &&
                    <ExerciseTypeRoute window={this.props.window}
                                       selectOrderExerciseType={this.selectOrderExerciseType}
                                       instrumentTerm={exercisibleInstrumentsTerm}
                                       orderExerciseType={this.state.exerciseType}
                                       nextPath={`${this.props.match.path}/terms`}
                                       vpsAccountNumber={this.state.vpsAccountNumber}
                                       onVPSAccountNumberChanged={this.onVPSAccountNumberChanged}
                                       goBack={() => this.setState({ currentPage: ExerciseStepPage.QUANTITY })}
                                       goForward={() => this.setState({ currentPage: ExerciseStepPage.TERMS })}
                                       hasErrors={this.state.exerciseTypeFormHasErrors}
                                       userInstruments={[]}
                                       vpsNotReady={this.state.vpsNotReady}
                                       handleVpsToggle={this.handleVpsToggle}
                                       onBankAccountNumberChanged={this.onBankAccountNumberChanged}
                                       bankAccountNumber={this.state.bankAccountNumber}
                                       bankAccountNotReady={this.state.bankAccountNotReady}
                                       handleBankAccountToggle={this.handleBankAccountToggle}
                    />
                }
                {
                    this.state.currentPage === ExerciseStepPage.TERMS &&
                    <Terms window={this.props.window} userInstruments={[]}
                           nextPath={`${this.props.match.path}/confirm`}
                           goBack={() => this.setState({ currentPage: ExerciseStepPage.TYPE })}
                           goForward={() => this.setState({ currentPage: ExerciseStepPage.CONFIRM })}
                           orderExerciseType={this.state.exerciseType}
                           match={match}
                           employeeName={this.props.employeeName}
                           companyName={this.props.companyName}
                           dateOfAgreement={moment()}
                           instrumentsToExercise={this.state.orderInstruments.reduce((accu, op) => accu + op.orderAmount, 0)}
                           averageStrikePrice={averageCost}
                           commission={commission}
                           vpsAccount={this.state.vpsAccountNumber}
                           bankAccount={this.props.bankAccountNumberForExercise}
                    />

                }
                {
                    this.state.currentPage === ExerciseStepPage.CONFIRM &&
                    <OverviewAndConfirm
                        {...this.state}
                        {...this.props.sharePrice}
                        instrumentTerm={exercisibleInstrumentsTerm}
                        paymentBankAccountNumber={this.props.bankAccountNumberForExercise}
                        bic_number={this.props.bicNumberForExercise}
                        iban_number={this.props.ibanNumberForExercise}
                        goBack={() => this.setState({ currentPage: ExerciseStepPage.TERMS })}
                        confirmOrder={this.confirmOrder}
                        exerciseWindow={window}
                        payment_address={this.props.payment_address}
                        userBankAccount={this.state.bankAccountNumber}
                        require_share_depository={window.require_share_depository}
                    />
                }
            </div>
        );
    }

    private confirmOrder = () => {
        const orderLines: ExerciseOrderLine[] = this.state.orderInstruments.map((option) => ({
            vestingEventId: option.vestingEventId,
            exerciseQuantity: option.orderAmount
        }));

        const vpsAccount = this.requireVps(this.state.exerciseType) ? { vps_account: this.state.vpsAccountNumber } : {};
        const bankAccount = this.requireBankAccount() ? { bank_account: this.state.bankAccountNumber } : {};

        const order: ExerciseOrder = {
            exerciseType: OrderExerciseType[this.state.exerciseType],
            exercise_order_lines: orderLines,
            ...vpsAccount,
            ...bankAccount,
        };

        this.props.placeOrder(order, this.props.window.id);
    }

    private requireVps = (type: OrderExerciseType) => (type === OrderExerciseType.EXERCISE_AND_HOLD || type === OrderExerciseType.EXERCISE_AND_SELL_TO_COVER) && this.props.window.require_share_depository;
    private requireBankAccount = () => this.state.exerciseType === OrderExerciseType.EXERCISE_AND_SELL && this.props.window.require_bank_account && !this.state.bankAccountNotReady;
    private handleVpsToggle = () => {
        this.setState({
            vpsNotReady: !this.state.vpsNotReady,
            exerciseTypeFormHasErrors: !this.exerciseTypeFormValid(this.state.exerciseType, this.state.vpsAccountNumber, !this.state.vpsNotReady, this.state.bankAccountNumber, this.state.bankAccountNotReady)
        })
    };

    private handleBankAccountToggle = () => {
        const newValue = !this.state.bankAccountNotReady;
        this.setState({
            bankAccountNotReady: newValue,
            exerciseTypeFormHasErrors: !this.exerciseTypeFormValid(this.state.exerciseType, this.state.vpsAccountNumber, !this.state.vpsNotReady, this.state.bankAccountNumber, newValue)
        })
    };

    private onVPSAccountNumberChanged = (vpsAccountNumber: string) => this.setState({
        vpsAccountNumber,
        exerciseTypeFormHasErrors: !this.exerciseTypeFormValid(this.state.exerciseType, vpsAccountNumber, this.state.vpsNotReady, this.state.bankAccountNumber, this.state.bankAccountNotReady)
    });

    private onBankAccountNumberChanged = (bankAccountNumber: string) => this.setState({
        bankAccountNumber,
        exerciseTypeFormHasErrors: !this.exerciseTypeFormValid(this.state.exerciseType, this.state.vpsAccountNumber, this.state.vpsNotReady, bankAccountNumber, this.state.bankAccountNotReady)
    });

    private setQuantityForPlan = (quantities: string[]) => {
        const updatedPlans = this.state.orderInstruments.map((p, i) => {
            return Object.assign({}, p, { orderAmount: parseInt(quantities[i], 10) });
        });

        this.setState({ orderInstruments: updatedPlans });
    };

    private selectOrderExerciseType = (type: OrderExerciseType) => this.setState({
        exerciseType: type,
        exerciseTypeFormHasErrors: !this.exerciseTypeFormValid(type, this.state.vpsAccountNumber, this.state.vpsNotReady, this.state.bankAccountNumber, this.state.bankAccountNotReady)
    });

    private exerciseTypeFormValid = (type: OrderExerciseType, vps: string, vpsNotReady: boolean, bankAccountNumber: string, bankAccountNotReady: boolean) => {
        if (this.requireVps(type)) {
            return vpsNotReady || (vps && vps.length && vps.length >= 3);
        }

        if (type === OrderExerciseType.EXERCISE_AND_SELL && this.props.window.require_bank_account && !bankAccountNotReady) {
            return bankAccountNumber && bankAccountNumber.length && bankAccountNumber.length >= 3;
        }

        return true;
    }

    private handleStepIndicatorClick = (desitnationPage: ExerciseStepPage) => this.setState({ currentPage: desitnationPage });
}

const mapDispatchToProps = (dispatch) => ({
    placeOrder: (order, window_id: string) => dispatch({ type: 'PLACE_ORDER', order, window_id }),
    removeOrderError: () => dispatch({ type: 'REMOVE_ORDER_ERROR' }),
});

const mapStateToProps: MapStateToProps<StateProps, null, RootState> = ({ order, user, instrument }): StateProps => ({
    isPlacingOrder: order.isPlacingOrder,
    orderError: order.error,
    exercisibleAwards: instrument.exercisibleAwards.filter((award) => award.quantity > 0),
    exercisibleInstrumentsTerm: instrument.exercisibleInstrumentsTerm,
    bankAccountNumberForExercise: user.tenant && user.tenant.bank_account_number,
    bicNumberForExercise: user.tenant && user.tenant.bic_number,
    ibanNumberForExercise: user.tenant && user.tenant.iban_number,
    payment_address: user.tenant && user.tenant.payment_address,
    employeeName: user.name,
    companyName: user.tenant && user.tenant.name,
});

export default connect<StateProps, DispatchProps, Props>(mapStateToProps, mapDispatchToProps)(ExerciseRouter);
