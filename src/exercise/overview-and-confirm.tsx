import React, { Component, StatelessComponent } from 'react';
import { Table, Button, Message, Icon } from 'semantic-ui-react';
import { ExerciseOrderData, SharePrice, orderExerciseTypeDisplayText, OrderExerciseType } from "./exercise-router";
import { formatCurrency, formatNumber, formatSharePrice } from "../utils/utils";
import numeral from 'numeral';
import { ExercisibleInstrumentsTerm } from "../instruments/instruments-reducer";
import Content from "../texts/content";
import { Moment } from "moment";
import { Window } from "../data/data";

interface PaymentInfoProps {
    bankAccountNumber?: string,
    bic_number?: string,
    iban_number?: string,
    totalPrice: number,
    address?: React.ReactElement<any>,
    paymentDeadline: Moment,
}

export const PaymentAddress: StatelessComponent<{ addressString?: string }> = ({ addressString }) => (
    <div>
        {
            addressString &&
            <div>
                <div className="block-xxxs">Payment address:</div>
                { addressString.split("\n").map((addressLine, index) => <div key={index}>{addressLine}</div>)}
            </div>
        }
    </div>
);

export const BICAndIBAN = ({ bic, iban}) => (
    <div className="block-xxs">
        <div>BIC: {bic}</div>
        <div>IBAN: {iban}</div>
    </div>
);

const PaymentInfo: StatelessComponent<PaymentInfoProps> = ({ totalPrice, bankAccountNumber, bic_number, iban_number, address, paymentDeadline }) => (
    <div className="text-content-center block-m">
        <Message info>
            <Message.Content>
                <Message.Header><Content id="payment.header"/></Message.Header>
                <div className="block-s">
                    <Content
                        id="exercise.confirm.exercise.and.sell.payment.description"
                        values={{
                            totalPrice: numeral(totalPrice).format('0,0.00 $'),
                            transferDeadline: paymentDeadline.format('lll')
                        }}
                    />
                </div>
                <div className="block-s">
                    <div className="block-xxs"><strong><Content id="payment.domestic.account.header"/></strong></div>
                    <div>
                        <Content
                            id={bankAccountNumber ? "payment.domestic.account.description" : 'payment.domestic.noaccount.description'}
                            values={{ bankAccountNumber }}
                        />
                    </div>
                </div>

                <div className="block-s">
                    <div className="block-xxs"><strong><Content id="payment.foreign.account.header"/></strong></div>
                    {
                        bic_number && iban_number ?
                            <BICAndIBAN bic={bic_number} iban={iban_number}/> :
                            <div className="block-xxs"><Content id="payment.foreign.noaccount.description"/></div>
                    }
                    { address }
                </div>
            </Message.Content>
        </Message>
    </div>
);

interface OverviewInfoProps {
    totalCostOfExercise: number,
    totalQuantity: number,
    averageCost: number,
    type: OrderExerciseType,
    instrumentTerm: ExercisibleInstrumentsTerm,
    bankAccountNumber?: string,
    bic_number?: string,
    iban_number?: string,
    sharePrice,
    paymentDeadline: Moment,
    payment_address?: string,
}

const OverviewInfo: StatelessComponent<OverviewInfoProps> = ({ totalQuantity, totalCostOfExercise, averageCost, type, instrumentTerm, bankAccountNumber, bic_number, iban_number, sharePrice, paymentDeadline, payment_address }) => {
    if (type === OrderExerciseType.EXERCISE_AND_HOLD) {
        return (
            <div>
                <p className="text-content text-content-center">
                    <Content
                        id="exercise.confirm.exerciseandhold.body"
                        values={{
                            totalQuantity: formatNumber(totalQuantity),
                            instrumentTerm: instrumentTerm.plural,
                            averageCost: formatCurrency(averageCost),
                            totalCostOfExercise: numeral(totalCostOfExercise).format('0,0.00 $')
                        }}
                    />
                </p>
                <PaymentInfo
                    bankAccountNumber={bankAccountNumber}
                    bic_number={bic_number}
                    iban_number={iban_number}
                    totalPrice={totalCostOfExercise}
                    address={<PaymentAddress addressString={payment_address}/>}
                    paymentDeadline={paymentDeadline}
                />
            </div>
        );
    } else if (type === OrderExerciseType.EXERCISE_AND_SELL) {
        return (
            <div>
                <p className="text-content text-content-center">
                    <Content
                        id="exercise.confirm.exerciseandsell.body"
                        values={{
                            totalQuantity: formatNumber(totalQuantity),
                            instrumentTerm: instrumentTerm.plural,
                            averageCost: formatCurrency(averageCost),
                            totalCostOfExercise: numeral(totalCostOfExercise).format('0,0.00 $')
                        }}
                    />
                </p>
                <p className="text-content text-content-center block-s">
                    <Content
                        id="exercise.confirm.exerciseandsell.body.2"
                        values={{
                            sharePrice: formatSharePrice(sharePrice),
                        }}
                    />
                </p>
            </div>

        );
    }

    return (
        <div>
            <p className="text-content text-content-center">
                <Content
                    id="exercise.confirm.exerciseandselltocover.body"
                    values={{
                        totalQuantity: formatNumber(totalQuantity),
                        instrumentTerm: instrumentTerm.plural,
                        averageCost: formatCurrency(averageCost),
                        totalCostOfExercise: numeral(totalCostOfExercise).format('0,0.00 $')
                    }}
                />
            </p>
            <p className="text-content text-content-center block-s">
                <Content
                    id="exercise.confirm.exerciseandselltocover.body.2"
                    values={{
                        sharePrice: formatSharePrice(sharePrice),
                    }}
                />
            </p>
        </div>
    );
};

interface Props {
    goBack: () => void,
    confirmOrder: () => void,
    paymentBankAccountNumber?: string,
    bic_number?: string,
    iban_number?: string,
    instrumentTerm: ExercisibleInstrumentsTerm,
    exerciseWindow: Window,
    payment_address?: string,
    userBankAccount?: string
    require_share_depository: boolean,
}

class OverviewAndConfirm extends Component<ExerciseOrderData & SharePrice & Props, {}> {
    render() {
        const { paymentBankAccountNumber, instrumentTerm, bic_number, iban_number, exerciseWindow, payment_address } = this.props;
        const totalQuantity = this.props.orderInstruments.reduce((accu, op) => accu + op.orderAmount, 0);
        const totalCostOfExercise = this.props.orderInstruments.reduce((accu, op) => accu + (op.orderAmount * op.costPrice), 0);
        const averageCost = totalCostOfExercise / totalQuantity;
        const estimatedValue = this.props.sharePrice * totalQuantity;
        const estimatedSalesProceeds = estimatedValue - totalCostOfExercise;
        return (
            <div className="block-m">
                <h2 className="text-center"><Content id="exercise.confirm.header"/></h2>
                <OverviewInfo
                    type={this.props.exerciseType}
                    instrumentTerm={instrumentTerm}
                    averageCost={averageCost}
                    totalCostOfExercise={totalCostOfExercise}
                    totalQuantity={totalQuantity}
                    bankAccountNumber={paymentBankAccountNumber}
                    bic_number={bic_number}
                    iban_number={iban_number}
                    sharePrice={this.props.sharePrice}
                    paymentDeadline={exerciseWindow.paymentDeadline}
                    payment_address={payment_address}
                />
                <div className="order-summary-table">
                    <Table className="order-summary-table">
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell colSpan='2'><Content id="exercise.confirm.table.header"/></Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row>
                                <Table.Cell>Number of {instrumentTerm.plural} exercised</Table.Cell>
                                <Table.Cell textAlign={"right"}>{formatNumber(totalQuantity)}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>Average price per {instrumentTerm.singular}</Table.Cell>
                                <Table.Cell textAlign={"right"}>{formatCurrency(averageCost)}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>Total cost</Table.Cell>
                                <Table.Cell textAlign={"right"}>{numeral(totalCostOfExercise).format('0,0.00 $')}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>Exercise type</Table.Cell>
                                <Table.Cell
                                    textAlign={"right"}>{orderExerciseTypeDisplayText(this.props.exerciseType)}</Table.Cell>
                            </Table.Row>
                            {
                                this.displayVPSAccountNumber() &&
                                <Table.Row>
                                    <Table.Cell><Content id="exercise.confirm.table.sharedepositoryaccount.label"/></Table.Cell>
                                    <Table.Cell textAlign={"right"}>{this.props.vpsAccountNumber}</Table.Cell>
                                </Table.Row>
                            }
                            {
                                this.displayBankAccountNumber() &&
                                <Table.Row>
                                    <Table.Cell><Content id="exercise.confirm.table.bankaccount.label"/></Table.Cell>
                                    <Table.Cell textAlign={"right"}>{this.props.userBankAccount}</Table.Cell>
                                </Table.Row>
                            }
                            <Table.Row>
                                <Table.Cell>Share price ({this.props.sharePriceDate.format("DD.MM.YYYY")})</Table.Cell>
                                <Table.Cell textAlign={"right"}>{formatCurrency(this.props.sharePrice)}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell><strong>Estimated net gain</strong></Table.Cell>
                                <Table.Cell
                                    textAlign={"right"}><strong>≈ {numeral(estimatedSalesProceeds).format('0,0 $')}</strong></Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
                    <div className='required text-right'><Content id="exercise.confirm.table.note"/></div>
                </div>
                <div className="section-container page-action-container text-center">
                    <Button size="big" onClick={this.props.goBack}>Back</Button>
                    <Button positive content='Confirm exercise order' icon='right arrow' labelPosition='right' size="big" onClick={this.props.confirmOrder} />
                </div>
            </div>
        );
    }

    private displayVPSAccountNumber = () => (this.props.exerciseType === OrderExerciseType.EXERCISE_AND_SELL_TO_COVER || this.props.exerciseType === OrderExerciseType.EXERCISE_AND_HOLD) && !this.props.vpsNotReady && this.props.require_share_depository;
    private displayBankAccountNumber = () => this.props.exerciseType === OrderExerciseType.EXERCISE_AND_SELL && this.props.exerciseWindow.require_bank_account && !this.props.bankAccountNotReady;
}

export default OverviewAndConfirm;