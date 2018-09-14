import React, { Component, StatelessComponent } from 'react';
import moment, { Moment } from "moment";
import { Window, InstrumentsAgreement } from "../data/data";
import { Form, Button, Checkbox } from 'semantic-ui-react';
import { OrderExerciseType } from "./exercise-router";
import { ExercisibleInstrumentsTerm } from "../instruments/instruments-reducer";
import Content from "../texts/content";
import { injectIntl, InjectedIntlProps } from "react-intl";
import ShareDepository from "../purchase/steps/share-depository";

interface VestedOption {
    planName: string;
    expiryDate: Moment;
    price: number,
    amount: number;
    vestedDate: Moment
}

interface Props {
    userInstruments: InstrumentsAgreement[],
    orderExerciseType: OrderExerciseType,
    instrumentTerm: ExercisibleInstrumentsTerm,
    selectOrderExerciseType: (type: OrderExerciseType) => void,
    vpsAccountNumber?: string,
    onVPSAccountNumberChanged: (value: string) => void,
    onBankAccountNumberChanged: (value: string) => void,
    window: Window,
    goBack: () => void,
    goForward: () => void,
    nextPath: string,
    hasErrors: boolean,
    handleVpsToggle: () => void,
    handleBankAccountToggle: () => void,
    vpsNotReady: boolean,
    bankAccountNotReady: boolean,
    bankAccountNumber: string,
}

class ExerciseTypeRoute extends Component<Props & InjectedIntlProps, {}> {
    render() {
        const { formatMessage } = this.props.intl;
        return (
            <div>
                <div className="exercise-type-container">
                    <h2 className="text-center block-m"><Content id="exercise.type.title"/></h2>
                    <ExerciseType selected={this.props.orderExerciseType}
                                  onChange={this.props.selectOrderExerciseType}
                                  onVPSAccountNumberChanged={this.props.onVPSAccountNumberChanged}
                                  instrumentTerm={this.props.instrumentTerm}
                                  allowedExerciseTypes={this.props.window.allowed_exercise_types}
                                  vpsAccountNumber={this.props.vpsAccountNumber} />
                </div>
                {
                    this.requireShareDepository() &&
                    <div className='block-l'>
                        <h2 className="text-center block-s"><Content id="exercise.type.sharedepositoryaccount.header"/></h2>
                        <p className="text-center block-s"><Content id="exercise.type.sharedepositoryaccount.description"/></p>
                        <div className='vps-number'>
                            <Form size={"large"}>
                                <Form.Field>
                                    <label><Content id="exercise.type.sharedepositoryaccount.label"/></label>
                                    <input placeholder={formatMessage({ id: "exercise.type.sharedepositoryaccount.placeholder"})}
                                           value={this.props.vpsAccountNumber}
                                           disabled={this.props.vpsNotReady}
                                           onChange={this.handleVPSChange} />
                                </Form.Field>
                                <Form.Field>
                                    <Checkbox label={formatMessage({ id: "exercise.type.sharedepositoryaccount.checkbox.label"})}
                                              checked={this.props.vpsNotReady}
                                              onChange={this.props.handleVpsToggle} />
                                </Form.Field>
                            </Form>
                        </div>
                    </div>
                }
                {
                    (this.props.orderExerciseType === OrderExerciseType.EXERCISE_AND_SELL && this.props.window.require_bank_account) &&
                    <div className='block-l'>
                        <h2 className="text-center block-s"><Content id="exercise.type.bankaccount.header"/></h2>
                        <p className="text-center block-s"><Content id="exercise.type.bankaccount.description"/></p>
                        <div className='vps-number'>
                            <Form size={"large"}>
                                <Form.Field>
                                    <label><Content id="exercise.type.bankaccount.label"/></label>
                                    <input placeholder={formatMessage({ id: "exercise.type.bankaccount.placeholder"})}
                                           value={this.props.bankAccountNumber}
                                           disabled={this.props.bankAccountNotReady}
                                           onChange={this.handleBankAccountChange} />
                                </Form.Field>
                                <Form.Field>
                                    <Checkbox label={formatMessage({ id: "exercise.type.bankaccount.checkbox.label"})}
                                              checked={this.props.bankAccountNotReady}
                                              onChange={this.props.handleBankAccountToggle} />
                                </Form.Field>
                            </Form>
                        </div>
                    </div>
                }
                <div className="section-container page-action-container text-center">
                    <Button size="big" onClick={this.props.goBack}>Back</Button>
                    <Button positive content='Next' icon='right arrow' labelPosition='right' size="big"
                            disabled={this.props.hasErrors} onClick={this.props.goForward} />
                </div>
            </div>

        );
    }

    private handleVPSChange = (event) => {
        this.props.onVPSAccountNumberChanged(event.target.value);
    };

        private handleBankAccountChange = (event) => {
        this.props.onBankAccountNumberChanged(event.target.value);
    };

    private requireShareDepository = () => (this.props.orderExerciseType === OrderExerciseType.EXERCISE_AND_HOLD || this.props.orderExerciseType === OrderExerciseType.EXERCISE_AND_SELL_TO_COVER) &&
        this.props.window.require_share_depository
}

interface ExerciseTypeProps {
    selected: OrderExerciseType,
    onChange: (selected: OrderExerciseType) => void
    onVPSAccountNumberChanged: (value: string) => void,
    vpsAccountNumber?: string,
    instrumentTerm: ExercisibleInstrumentsTerm,
    allowedExerciseTypes: string[],
}

class ExerciseType extends Component<ExerciseTypeProps, {}> {
    render() {
        const { instrumentTerm, allowedExerciseTypes } = this.props;
        return (
            <div className="excercise-box-container">
                {
                    allowedExerciseTypes.includes(OrderExerciseType.EXERCISE_AND_HOLD) &&
                    <ExerciseTypeBox
                        headerId='exercise.type.exerciseandhold.header'
                        descriptionId="exercise.type.exerciseandhold.description"
                        selected={this.props.selected === OrderExerciseType.EXERCISE_AND_HOLD}
                        onClick={this.props.onChange.bind(this, OrderExerciseType.EXERCISE_AND_HOLD)}
                        instrumentName={instrumentTerm}
                    />
                }
                {
                    allowedExerciseTypes.includes(OrderExerciseType.EXERCISE_AND_SELL) &&
                    <ExerciseTypeBox
                        headerId="exercise.type.exerciseandsell.header"
                        descriptionId="exercise.type.exerciseandsell.description"
                        selected={this.props.selected === OrderExerciseType.EXERCISE_AND_SELL}
                        onClick={this.props.onChange.bind(this, OrderExerciseType.EXERCISE_AND_SELL)}
                        instrumentName={instrumentTerm}
                    />
                }
                {
                    allowedExerciseTypes.includes(OrderExerciseType.EXERCISE_AND_SELL_TO_COVER) &&
                    <ExerciseTypeBox
                        headerId="exercise.type.exerciseandselltocover.header"
                        descriptionId="exercise.type.exerciseandselltocover.description"
                        selected={this.props.selected === OrderExerciseType.EXERCISE_AND_SELL_TO_COVER}
                        onClick={this.props.onChange.bind(this, OrderExerciseType.EXERCISE_AND_SELL_TO_COVER)}
                        instrumentName={instrumentTerm}
                    />
                }
            </div>
        );
    }
}

const ExerciseTypeBox: StatelessComponent<{ headerId: string, descriptionId: string, selected: boolean, onClick: () => void, instrumentName: ExercisibleInstrumentsTerm }> =
    ({ headerId, descriptionId, selected, onClick, instrumentName }) => (
        <div className={`excercise-box block-l ${selected ? "excercise-box-selected" : ""}`} onClick={onClick}>
            <h3 className="excercise-box-header"><Content id={headerId} /></h3>
            <p className="excercise-box-description"><Content id={descriptionId}
                                                              values={{ instrumentName: instrumentName.plural }} /></p>
        </div>
    );

export default injectIntl<Props>(ExerciseTypeRoute);