import React, { Component, StatelessComponent } from 'react';
import { FormattedMessage } from 'react-intl';
import moment, { Moment } from "moment";
import { Window, InstrumentsAgreement } from "../data/data";
import { Table, Button, Form, Checkbox, Message } from 'semantic-ui-react';
import numeral from "numeral";
import { ExercisibleInstrumentsTerm, FlatAward } from "../instruments/instruments-reducer";
import { vestedAwards } from "../instruments/instruments-page";
import { formatCurrency, formatSharePrice } from "../utils/utils";
import { Link } from 'react-router-dom';
import Content from "../texts/content";

interface VestedOption {
    planName: string;
    expiryDate: Moment;
    price: number,
    amount: number;
    vestedDate: Moment
}

interface Props {
    window: Window,
    match: any;
    quantities: string[];
    quantityForPlan: (quantities: string[]) => void;
    sharePrice: number;
    exercisibleAwards: FlatAward[];
    instrumentTerm: ExercisibleInstrumentsTerm,
    goBack: () => void;
    goForward: () => void;
    nextPath: string;
}


class Exercise extends Component<Props, { vestedOptions: FlatAward[], quantities: string[], quantitiesValid: boolean[] }> {
    constructor(props) {
        super(props);
        const vestedOptions = this.props.exercisibleAwards.filter(vestedAwards);

        this.state = {
            vestedOptions,
            quantities: this.props.quantities,
            quantitiesValid: this.props.quantities.map(() => true)
        };
    }

    render() {
        const estimatedGainSum = this.state.quantities.reduce((accu, q, i) => accu + ((parseInt(q, 10) * (this.props.sharePrice - this.state.vestedOptions[i].strike)) || 0), 0);
        const { instrumentTerm } = this.props;
        return (
            <div>
                <div className="section-container block-l">
                    <h2 className="text-center block-m">
                        <Content
                            id="exercise.quantity.title"
                            values={{ instrumentTerm: instrumentTerm.plural }}
                        />
                    </h2>
                    <p className="text-content text-content-center block-m">
                        <Content
                            id="exercise.quantity.body"
                            values={{ sharePrice: formatSharePrice(this.props.sharePrice) }}
                        />
                    </p>
                    {
                        this.hasErrors() &&
                        <div className="text-content-center block-m">
                            <Message
                                header='Errors'
                                error
                                content='Order quantity must be a number less than or equal to the exercisible quantity'
                            />
                        </div>
                    }
                    <Form>
                        <div className="col-center">
                            <div>
                                <Table celled textAlign="center" className="block-m" collapsing padded unstackable>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Program</Table.HeaderCell>
                                            <Table.HeaderCell>Strike/Price</Table.HeaderCell>
                                            <Table.HeaderCell>Vested Date</Table.HeaderCell>
                                            <Table.HeaderCell>Expiry Date</Table.HeaderCell>
                                            <Table.HeaderCell>Exercisible</Table.HeaderCell>
                                            <Table.HeaderCell>Order quantity</Table.HeaderCell>
                                            <Table.HeaderCell>Estimated gain</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {
                                            this.state.vestedOptions.map(this.renderRow)
                                        }
                                    </Table.Body>
                                    <Table.Footer>
                                        <Table.Row>
                                            <Table.HeaderCell colSpan='6' textAlign='left'>
                                                Total estimated gain
                                            </Table.HeaderCell>
                                            <Table.HeaderCell textAlign='right' colSpan='1'>
                                                ≈ {numeral(estimatedGainSum).format('0,0 $')}
                                            </Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Footer>
                                </Table>
                                <div className='required text-right'><Content id="exercise.exercise.note"/></div>
                            </div>
                        </div>
                    </Form>
                </div>
                <div className="section-container page-action-container text-center">
                    <Button size="big" onClick={this.props.goBack}>Back</Button>
                    <Button positive content='Next' icon='right arrow' labelPosition='right' size="big"
                            disabled={this.hasErrors()} onClick={this.props.goForward} />
                </div>
            </div>
        );
    }

    private renderRow = (vested: FlatAward, index) => {
        const amount = parseInt(this.state.quantities[index], 10);
        const value = amount * (this.props.sharePrice - vested.strike);
        return (
            <Table.Row key={vested.vestingEventId}>
                <Table.Cell>
                    <div>{vested.programName}</div>
                    <div>{vested.subProgramName}</div>
                </Table.Cell>
                <Table.Cell>{formatCurrency(vested.strike)}</Table.Cell>
                <Table.Cell>{vested.vestedDate.format("DD.MM.YYYY")}</Table.Cell>
                <Table.Cell>{vested.expiryDate.format("DD.MM.YYYY")}</Table.Cell>
                <Table.Cell>{numeral(vested.quantity).format('0,0')}</Table.Cell>
                <Table.Cell>
                    <Form.Field control='input'
                                error={!this.state.quantitiesValid[index]}
                                value={this.state.quantities[index]}
                                onChange={this.quantityChanged.bind(this, index)} />
                </Table.Cell>
                <Table.Cell textAlign='right'>≈ {numeral(value).format('0,0 $')}</Table.Cell>
            </Table.Row>
        );

    };

    private hasErrors = () => this.state.quantitiesValid.some((isValid) => !isValid);

    private quantityChanged = (index, event) => {
        const newQuantities = this.state.quantities.map((q, i) => i === index ? event.target.value.replace(/\D/g, '') : q);
        this.props.quantityForPlan(newQuantities);
        const newQuantitiesValid = this.state.quantitiesValid.map((valid, i) => typeof parseInt(newQuantities[i], 10) === 'number' && parseInt(newQuantities[i], 10) <= this.state.vestedOptions[i].quantity);
        this.setState({ quantities: newQuantities, quantitiesValid: newQuantitiesValid });
    };
    //private quantityChanged = (index, event) => this.setState({ quantities: this.state.quantities.map((q, i) => i === index ? event.target.value : q) });
}

export default Exercise;