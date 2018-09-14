import React, { Component, StatelessComponent } from 'react';
import moment, { Moment } from "moment";
import { Window, InstrumentsAgreement } from "../data/data";
import { match } from "react-router";
import { Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { OrderExerciseType, orderExerciseTypeDisplayText } from "./exercise-router";
import BrokerTerms from "./exercise-broker-terms";
import { link } from "../entity/entity-workflow";
import Content from "../texts/content";

interface Props {
    goBack: () => void,
    goForward: () => void,
    nextPath: string,
    userInstruments: InstrumentsAgreement[],
    window: Window,
    match: match<any>,
    orderExerciseType: OrderExerciseType,
    employeeName: string,
    companyName: string,
    dateOfAgreement: Moment,
    instrumentsToExercise: number,
    averageStrikePrice: number,
    commission: string,
    bankAccount: string,
    vpsAccount?: string,
}

class Terms extends Component<Props, {}> {
    render() {
        const { employeeName, commission, companyName, dateOfAgreement, window, instrumentsToExercise, averageStrikePrice, bankAccount, vpsAccount} = this.props;
        return (
            <div>
                <div className="block-m">
                    <h2 className="text-center">Terms for {orderExerciseTypeDisplayText(this.props.orderExerciseType)}</h2>
                    {
                        this.props.orderExerciseType === OrderExerciseType.EXERCISE_AND_HOLD &&
                        <p className="text-content text-content-center"><Content id={"exercise.type.exerciseandhold.terms"}/></p>
                    }
                    {
                        this.props.orderExerciseType === OrderExerciseType.EXERCISE_AND_SELL &&
                        <BrokerTerms
                            averageStrikePrice={averageStrikePrice}
                            employeeName={employeeName}
                            companyName={companyName}
                            dateOfAgreement={dateOfAgreement}
                            exerciseWindow={window}
                            instrumentsToExercise={instrumentsToExercise}
                            bankAccount={bankAccount}
                            commission={commission}
                            brokerMinimumAmount={350}
                            bufferPercentage={"30 %"}
                        />
                    }
                    {
                        this.props.orderExerciseType === OrderExerciseType.EXERCISE_AND_SELL_TO_COVER &&
                        <BrokerTerms
                            averageStrikePrice={averageStrikePrice}
                            employeeName={employeeName}
                            companyName={companyName}
                            dateOfAgreement={dateOfAgreement}
                            exerciseWindow={window}
                            instrumentsToExercise={instrumentsToExercise}
                            bankAccount={bankAccount}
                            commission={commission}
                            brokerMinimumAmount={350}
                            bufferPercentage={"30 %"}
                            sellToCoverSection={
                                <li>
                                    <p>The Employee may choose to use all of the consideration to purchase shares in {companyName} by indicating this in the system. DNB will carry out the share purchase on behalf of the Employee at best possible price. DNB will not charge commission for this transaction. The purchase sum the Employee shall pay for the shares will be set off against the consideration ref. 4. above. The residual sum (consideration less purchase sum for the shares and related fees) will be transferred to the Employee ref. 6. above. The shares will be transferred to the Employee's VPS account no: {vpsAccount} no later than ten business days after they have been purchased or DNB has received newly issued shares. If DNB is not account operator for the VPS account (i.e. not starting with 7, 5 or 1) the Employee must fill out and submit a signed a customer registration form . If the Employee does not have a share deposit account (VPS), such can be established in a DNB branch office. The Employee will receive contract note from DNB and/or registrar documenting the share purchase. The Employee must inform of any errors in such contract note immediately.</p>
                                </li>
                            }
                        />
                    }
                </div>
                <div className="section-container page-action-container text-center">
                    <Button size="big" onClick={this.props.goBack}>Back</Button>
                    <Button positive content='I hereby accept and proceed' icon='right arrow' labelPosition='right' size="big" onClick={this.props.goForward}/>
                </div>
            </div>
        );
    }
}

export default Terms;