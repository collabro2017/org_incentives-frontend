import React, { Component, StatelessComponent } from 'react';
import moment, { Moment } from "moment";
import numeral from "numeral";
import {Icon, Label, Menu, Table, Button, Loader, Popup, Checkbox, Form} from 'semantic-ui-react';
import "./instruments.less";
import { InstrumentsAgreement } from "../data/data";
import { connect, MapStateToProps } from 'react-redux';
import { FlatAward, hasPerformanceCriteria, IndividualInstrumentState } from "./instruments-reducer";
import { SharePrice } from "../exercise/exercise-router";
import { match, Route, Switch } from "react-router";
import { Link } from "react-router-dom";
import { formatCurrency, formatCurrency2Decimals, formatNumber } from "../utils/utils";
import { awardGain, calculateGains, calculateValue } from "../employee-portal/overview";
import { RootState } from "../reducers/all-reducers";
import Content from "../texts/content";


interface Props {
    match: match<{}>,
}

interface StateProps {
    warrant: IndividualInstrumentState,
    rsa: IndividualInstrumentState,
    rsu: IndividualInstrumentState,
    option: IndividualInstrumentState,
    isFetchingWelcomeData: boolean,
    sharePrice?: SharePrice,
    totalQuantity: number,
    totalVestedQuantity: number,
    totalGain: number,
    totalVestedGain: number,
}

export const vestedAwards = (award: FlatAward): boolean => moment().diff(award.vestedDate, 'days') >= 0;
export const removeExpiredAwards = (award: FlatAward): boolean => !hasExpired(award);
export const hasExpired = (award: FlatAward): boolean => moment().isAfter(award.expiryDate);
const sumQuantity = (accu: number, currentAward: FlatAward): number => currentAward.quantity + accu;

const IndividualInstrumentSummaryRow: StatelessComponent<{instrument: IndividualInstrumentState, title: string, linkTo: string }> = ({ instrument, title, linkTo }) => (
    <Table.Row>
        <Table.Cell>{title}</Table.Cell>
        <Table.Cell textAlign="right">{formatNumber(instrument.totalQuantity)}</Table.Cell>
        <Table.Cell textAlign="right">{formatCurrency2Decimals(instrument.gain.totalGain)}</Table.Cell>
        <Table.Cell textAlign="right">{formatNumber(instrument.vestedQuantity)}</Table.Cell>
        <Table.Cell textAlign="right">{formatCurrency2Decimals(instrument.gain.vestedGain)}</Table.Cell>
        <Table.Cell><Button content='View details' as={Link} to={linkTo} size="medium" primary basic /></Table.Cell>
    </Table.Row>
);

const ShowExpiredCheckBox: StatelessComponent<{ checked: boolean, clickHandler: () => void }> = ({ checked, clickHandler }) => (
    <div className='text-right block-xxs'>
        <Form.Field>
            <Checkbox label={"Show expired"}
                      checked={checked}
                      onChange={clickHandler} />
        </Form.Field>
    </div>
);


class InstrumentsPage extends Component<Props & StateProps, { showExpired: boolean }> {
    state = {
        showExpired: false,
    };

    render() {
        if (!this.props.sharePrice) {
            return (
                <div className="loader-container"><Loader active={true} size='big'/></div>
            )
        }

        const { match, option, rsu, rsa, warrant, totalGain, totalQuantity, totalVestedGain, totalVestedQuantity } = this.props;
        const showPerformance = [option, rsu, rsa, warrant].some((x) => x.performance);
        return (
            <Switch>
                <Route path={`${match.path}/options`} render={() =>
                    <div className="main-content">
                        <div className="instruments-header block-m">
                            <h1 className="block-m">My Outstanding Employee Stock Options</h1>
                            <p className="text-content text-content-center block-m">Table below display a detailed overview of information connected to your options. Please note that total value is based on the last known share price and that actual gains will vary based on changes in share price and prices achieved in the market.</p>
                        </div>
                        <div className='instruments-tables-container'>
                            <ShowExpiredCheckBox checked={this.state.showExpired} clickHandler={this.handleShowExpiredToggle}/>
                            { option.allAwards.length > 0 && <Options options={option.allAwards} sharePriceToday={this.props.sharePrice.sharePrice} showExpired={this.state.showExpired}/> }
                        </div>
                    </div>
                }/>

                <Route path={`${match.path}/warrants`} render={() =>
                    <div className="main-content">
                        <div className="instruments-header block-m">
                            <h1 className="block-m">My Outstanding Warrants</h1>
                            <p className="text-content text-content-center block-m">Table below display a detailed overview of information connected to your warrants. Please note that total value is based on the last known share price and that actual gains will vary based on changes in share price and prices achieved in the market.</p>
                        </div>
                        <div className='instruments-tables-container'>
                            <ShowExpiredCheckBox checked={this.state.showExpired} clickHandler={this.handleShowExpiredToggle}/>
                            { warrant.allAwards.length > 0 && <Options options={warrant.allAwards} showPurchasePrice sharePriceToday={this.props.sharePrice.sharePrice} showExpired={this.state.showExpired}/> }
                        </div>
                    </div>
                }/>

                <Route path={`${match.path}/rsus`} render={() =>
                    <div className="main-content">
                        <div className="instruments-header block-m">
                            <h1 className="block-m">My Outstanding Restricted Share Units</h1>
                            <p className="text-content text-content-center block-m">Table below display a detailed overview of information connected to your Restricted Share Units. Please note that total value is based on the last known share price and that acyual gains will vary based on changes in share price and prices achieved in the market.
                            </p>
                        </div>
                        <div className='instruments-tables-container'>
                            <ShowExpiredCheckBox checked={this.state.showExpired} clickHandler={this.handleShowExpiredToggle}/>
                            { rsu.allAwards.length > 0 && <RSUs rsus={rsu.allAwards} sharePriceToday={this.props.sharePrice.sharePrice} showExpired={this.state.showExpired}/> }
                        </div>
                    </div>
                }/>

                <Route path={`${match.path}/rsas`} render={() =>
                    <div className="main-content">
                        <div className="instruments-header block-m">
                            <h1 className="block-m">My Outstanding Restricted Share Awards</h1>
                            <p className="text-content text-content-center block-m">Table below display a detailed overview of information connected to your Restricted Share Awards. Please note that total value is based on the last known share price and that acyual gains will vary based on changes in share price and prices achieved in the market.
                            </p>
                        </div>
                        <div className='instruments-tables-container'>
                            <ShowExpiredCheckBox checked={this.state.showExpired} clickHandler={this.handleShowExpiredToggle}/>
                            { rsa.allAwards.length > 0 && <RSUs rsus={rsa.allAwards} sharePriceToday={this.props.sharePrice.sharePrice} showExpired={this.state.showExpired}/> }
                        </div>
                    </div>
                }/>

                <Route path={match.path} render={() =>
                    <div className="main-content">
                        <div className="instruments-header block-m">
                            <h1 className="block-m">My Outstanding Share Based Instruments</h1>
                            <p className="text-content text-content-center block-m">Table below display a detailed overview of information connected to your share based instruments. Please note that total value is based on the last known share price and that actual gains will vary based on changes in share price and prices achieved in the market</p>
                        </div>
                        <div className='instruments-tables-container'>
                            <Table celled unstackable textAlign="center">
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>Instrument type</Table.HeaderCell>
                                        <Table.HeaderCell>Total quantity</Table.HeaderCell>
                                        <Table.HeaderCell>Total gain</Table.HeaderCell>
                                        <Table.HeaderCell>Vested quantity</Table.HeaderCell>
                                        <Table.HeaderCell>Vested gain</Table.HeaderCell>
                                        <Table.HeaderCell></Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>

                                    {
                                        option.allAwards.length > 0 && <IndividualInstrumentSummaryRow instrument={option} title={'Options'} linkTo={'/instruments/options'}/>
                                    }
                                    {
                                        warrant.allAwards.length > 0 && <IndividualInstrumentSummaryRow instrument={warrant} title={'Warrants'} linkTo={'/instruments/warrants'}/>
                                    }
                                    {
                                        rsu.allAwards.length > 0 && <IndividualInstrumentSummaryRow instrument={rsu} title={'RSUs'} linkTo={'/instruments/rsus'}/>
                                    }
                                    {
                                        rsa.allAwards.length > 0 && <IndividualInstrumentSummaryRow instrument={rsa} title={'RSAs'} linkTo={'/instruments/rsas'}/>
                                    }
                                </Table.Body>
                                <Table.Footer>
                                    <Table.Row>
                                        <Table.HeaderCell>Sum</Table.HeaderCell>
                                        <Table.HeaderCell textAlign="right">{formatNumber(totalQuantity)}</Table.HeaderCell>
                                        <Table.HeaderCell textAlign="right">{formatCurrency(totalGain)}</Table.HeaderCell>
                                        <Table.HeaderCell textAlign="right">{formatNumber(totalVestedQuantity)}</Table.HeaderCell>
                                        <Table.HeaderCell textAlign="right">{formatCurrency(totalVestedGain)}</Table.HeaderCell>
                                        {
                                            showPerformance && <Table.HeaderCell></Table.HeaderCell>
                                        }
                                        <Table.HeaderCell></Table.HeaderCell>
                                    </Table.Row>
                                </Table.Footer>
                            </Table>
                        </div>
                    </div>
                }/>
            </Switch>
        );
    }

    private handleShowExpiredToggle = () => this.setState({ showExpired: !this.state.showExpired })
}

const Options: StatelessComponent<{options: FlatAward[], sharePriceToday: number, showPurchasePrice?: boolean, showExpired: boolean }> = ({ options, sharePriceToday, showPurchasePrice, showExpired }) => {
    const showExercisedQuantity = options.some((o) => o.exercisedQuantity !== 0);
    const exercisedQuantity = -1 * options.reduce((accu, current) => accu + current.exercisedQuantity, 0);
    const optionQuantity = options.filter(removeExpiredAwards).reduce((accu, current) => accu + current.quantity, 0);
    const hasPerformance = options.some(hasPerformanceCriteria);
    const totalExercisePrice = options.filter(removeExpiredAwards).reduce((accu, o) => (o.quantity * o.strike) + accu, 0);

    const shownOptions = showExpired ? options : options.filter(removeExpiredAwards);
    return (
        <div className="section-container block-l">
            <Table celled unstackable textAlign="center">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Program</Table.HeaderCell>
                        <Table.HeaderCell>Grant date</Table.HeaderCell>
                        <Table.HeaderCell>Vesting date</Table.HeaderCell>
                        <Table.HeaderCell>Expiry date</Table.HeaderCell>
                        <Table.HeaderCell>Quantity</Table.HeaderCell>
                        {
                            showExercisedQuantity &&
                            <Table.HeaderCell>Exercised quantity</Table.HeaderCell>
                        }
                        {
                            showPurchasePrice &&
                            <Table.HeaderCell>Purchase price <Popup trigger={<Icon name='question circle outline' />} content="The price you paid to purchase this warrant."/></Table.HeaderCell>
                        }
                        <Table.HeaderCell>Strike</Table.HeaderCell>
                        <Table.HeaderCell>Total strike <Popup trigger={<Icon name='question circle outline' />} content="The price of exercising all the remaining instruments in each table row."/></Table.HeaderCell>
                        <Table.HeaderCell>Total value</Table.HeaderCell>
                        {
                            hasPerformance && <Table.HeaderCell>Performance</Table.HeaderCell>
                        }
                    </Table.Row>
                </Table.Header>
                <Table.Body>

                    {
                        shownOptions.map((award: FlatAward) =>
                            <OptionLine
                                { ...award }
                                key={award.vestingEventId}
                                showExercisedQuantity={showExercisedQuantity}
                                totalGain={awardGain(sharePriceToday, award)}
                                showPerformance={hasPerformance}
                                showPurchasePrice={showPurchasePrice}
                                purchasePrice={award.purchasePrice}
                                hasExpired={hasExpired(award)}
                            />
                        )
                    }

                </Table.Body>
                <Table.Footer>
                    <Table.Row>
                        <Table.HeaderCell>Sum</Table.HeaderCell>
                        <Table.HeaderCell textAlign="right"/>
                        <Table.HeaderCell textAlign="right"/>
                        <Table.HeaderCell textAlign="right"/>
                        <Table.HeaderCell textAlign="right">{numeral(optionQuantity).format()}</Table.HeaderCell>
                        { showExercisedQuantity && <Table.HeaderCell textAlign="right">{numeral(exercisedQuantity).format()}</Table.HeaderCell> }
                        { showPurchasePrice && <Table.HeaderCell textAlign="right"/>}
                        <Table.HeaderCell textAlign="right"/>
                        <Table.HeaderCell textAlign="right">{formatCurrency2Decimals(totalExercisePrice)}</Table.HeaderCell>
                        <Table.HeaderCell textAlign="right">{formatCurrency2Decimals(calculateGains(options.filter(removeExpiredAwards), sharePriceToday).totalGain)}</Table.HeaderCell>
                        {
                            hasPerformance && <Table.HeaderCell textAlign="right"/>
                        }
                    </Table.Row>
                </Table.Footer>
            </Table>
        </div>
    )
};


interface OptionLineProps {
    programName: string,
    subProgramName: string,
    quantity: number,
    exercisedQuantity: number,
    showExercisedQuantity: boolean,
    grantDate: Moment,
    vestedDate: Moment,
    expiryDate: Moment,
    strike: number,
    purchasePrice?: number,
    totalGain: number,
    performance: boolean,
    showPerformance: boolean,
    showPurchasePrice: boolean,
    hasExpired: boolean,
}

const OptionLine: StatelessComponent<OptionLineProps> = ({ programName, subProgramName, quantity,  exercisedQuantity, showExercisedQuantity, grantDate, vestedDate, expiryDate, strike, totalGain, showPerformance, performance, showPurchasePrice, purchasePrice, hasExpired }) => (
    <Table.Row negative={hasExpired}>
        <Table.Cell> <div>{programName}</div><div>{subProgramName}</div></Table.Cell>
        <Table.Cell>{moment(grantDate).format("DD.MM.YYYY")}</Table.Cell>
        <Table.Cell>{vestedDate.format("DD.MM.YYYY")}</Table.Cell>
        <Table.Cell>{expiryDate.format("DD.MM.YYYY")}</Table.Cell>
        <Table.Cell textAlign="right">{numeral(quantity).format()}</Table.Cell>
        {
            showExercisedQuantity && <Table.Cell textAlign="right">{numeral(-1 * exercisedQuantity).format()}</Table.Cell>
        }
        {
            showPurchasePrice &&
            <Table.Cell textAlign="right">{purchasePrice ? numeral(purchasePrice).format('0,0.00 $') : "N/A"}</Table.Cell>
        }
        <Table.Cell textAlign="right">{numeral(strike).format('0,0.00 $')}</Table.Cell>
        <Table.Cell textAlign="right">{numeral(hasExpired ? 0 : strike * quantity).format('0,0.00 $')}</Table.Cell>
        <Table.Cell textAlign="right">{numeral(hasExpired ? 0 : totalGain).format('0,0.00 $')}</Table.Cell>
        {
            showPerformance &&
            <Table.Cell>{performance ? <span>Yes <PerformanceYesPopup/></span> : 'No'}</Table.Cell>
        }
    </Table.Row>
);

const RSUs: StatelessComponent<{rsus: FlatAward[], sharePriceToday: number, showExpired: boolean }> = ({ rsus, sharePriceToday, showExpired }) => {
    const hasPerformance = rsus.some(hasPerformanceCriteria);
    const shownRsus = showExpired ? rsus : rsus.filter(removeExpiredAwards);
    return (
        <div className="section-container block-l">
            <Table celled unstackable textAlign="center">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Program</Table.HeaderCell>
                        <Table.HeaderCell>Grant date</Table.HeaderCell>
                        <Table.HeaderCell>Vesting date</Table.HeaderCell>
                        <Table.HeaderCell>Expiry date</Table.HeaderCell>
                        <Table.HeaderCell>Quantity</Table.HeaderCell>
                        <Table.HeaderCell>Total value</Table.HeaderCell>
                        {
                            hasPerformance && <Table.HeaderCell>Performance</Table.HeaderCell>
                        }
                    </Table.Row>
                </Table.Header>
                <Table.Body>

                    {
                        shownRsus.map((i) => (
                            <RSULine
                                award={i}
                                stockPriceToday={sharePriceToday}
                                key={i.vestingEventId}
                                showPerformance={hasPerformance}
                                hasExpired={hasExpired(i)}
                            />
                        ))
                    }

                </Table.Body>
                <Table.Footer>
                    <Table.Row>
                        <Table.HeaderCell>Sum</Table.HeaderCell>
                        <Table.HeaderCell textAlign="right"/>
                        <Table.HeaderCell textAlign="right"/>
                        <Table.HeaderCell textAlign="right"/>
                        <Table.HeaderCell textAlign="right">{formatNumber(rsus.filter(removeExpiredAwards).reduce((accu, current) => accu + current.quantity, 0))}</Table.HeaderCell>
                        <Table.HeaderCell textAlign="right">{formatCurrency(rsus.filter(removeExpiredAwards).reduce((accu, current) => accu + (current.quantity * sharePriceToday), 0))}</Table.HeaderCell>
                        {
                            hasPerformance && <Table.HeaderCell textAlign="right"/>
                        }
                    </Table.Row>
                </Table.Footer>
            </Table>
        </div>
    );
};

const RSULine: StatelessComponent<{ award: FlatAward, stockPriceToday: number, showPerformance: boolean, hasExpired: boolean }> = ({ award, stockPriceToday, showPerformance, hasExpired }) => (
    <Table.Row negative={hasExpired}>
        <Table.Cell> <div>{award.programName}</div><div>{award.subProgramName}</div></Table.Cell>
        <Table.Cell>{moment(award.grantDate).format("DD.MM.YYYY")}</Table.Cell>
        <Table.Cell
            textAlign="right">{award.vestedDate.format("DD.MM.YYYY")}</Table.Cell>
        <Table.Cell textAlign="right">{award.expiryDate.format("DD.MM.YYYY")}</Table.Cell>
        <Table.Cell textAlign="right">{numeral(award.quantity).format()}</Table.Cell>
        <Table.Cell
            textAlign="right">{numeral(hasExpired ? 0 : stockPriceToday * award.quantity).format('0,0.00 $')}</Table.Cell>
        {
            showPerformance &&
            <Table.Cell>{award.performance ? <span>Yes <PerformanceYesPopup/></span> : 'No'}</Table.Cell>
        }
    </Table.Row>
);


export const PerformanceYesPopup = () => (
    <Popup trigger={<Icon name='question circle outline' />}>
        <Popup.Content>
            <Content id="performace.information.question"/>
        </Popup.Content>
    </Popup>
);

const mapStateToProps: MapStateToProps<StateProps, Props, RootState> = ({ instrument }): StateProps => ({
    warrant: instrument.warrant,
    rsa: instrument.rsa,
    rsu: instrument.rsu,
    option: instrument.option,
    totalGain: instrument.totalGain,
    totalVestedGain: instrument.totalVestedGain,
    totalQuantity: instrument.totalQuantity,
    totalVestedQuantity: instrument.totalVestedQuantity,
    isFetchingWelcomeData: instrument.isFetchingWelcomeData,
    sharePrice: instrument.sharePrice
});

export default connect<StateProps>(mapStateToProps)(InstrumentsPage);
