import React, { Component, StatelessComponent } from 'react';
import { Icon, Label, Menu, Table, Button, Popup, Message } from 'semantic-ui-react';
import { Entity, OptionPlan, VestingEvent, Window } from "../data/data";
import moment, { Moment } from "moment";
import { Link } from 'react-router-dom';
import "../less/box.less";
import { connect, MapStateToProps } from 'react-redux';
import { FlatAward, IndividualInstrumentState } from "../instruments/instruments-reducer";
import './overview.less';
import {removeExpiredAwards, vestedAwards} from "../instruments/instruments-page";
import InstrumentSection, { CompactInstrumentsSection } from "./instrument-section";
import { exerciseRoute, orderRoute } from "../menu/menu";
import { Features } from "../features/features-reducer";
import { sumNumbers } from "../utils/utils";
import { RootState } from "../reducers/all-reducers";
import Content from "../texts/content";

interface StateProps {
    isFetchingInitialData: boolean,
    currentWindow?: Window,
    nextWindow?: Window,
    features: Features,
    errorFetchingWelcomeData?: boolean,
    logoUrl?: string,
    warrant: IndividualInstrumentState,
    rsa: IndividualInstrumentState,
    rsu: IndividualInstrumentState,
    option: IndividualInstrumentState,
}

interface Props {
    companyName: string,
}

export const instrumentQuantity = (accu, current) => accu + current.quantity;

const NotInExerciseWindow: StatelessComponent<{ nextWindow?: Window }> = ({ nextWindow }) => (
    <div className="margin-center margin-top-s">
        <Button size={"big"} disabled content="Start Exercising" icon="right arrow" labelPosition="right" as={Link} to={exerciseRoute}/>
        <div className="margin-top-s">
            {
                nextWindow ?
                    <Content
                        id="overview.exercise.not.in.window.next.window.description"
                        values={{ from: nextWindow.from.format('lll'), to: nextWindow.to.format('lll') }}
                    /> :
                    <Content
                        id="overview.exercise.not.in.window.no.next.window.description"
                    />
            }
        </div>
    </div>
);

const ExerciseButton: StatelessComponent<{ endDate: Moment }> = ({ endDate }) => (
    <div className="margin-center margin-top-s">
        <Button size={"big"} positive content="Start Exercising" icon="right arrow" labelPosition="right" as={Link} to={exerciseRoute}/>
        <div className="margin-top-s">
            <Content id="overview.exercise.in.window.description" values={{ endDate: moment(endDate).format('lll') }}/>
        </div>
    </div>
);

class Home extends Component<Props & StateProps, {}> {
    render() {
        const { currentWindow, features, warrant, rsa, rsu, option, nextWindow } = this.props;

        const totalGainsAllInstruments = option.gain.totalGain + rsu.gain.totalGain + warrant.gain.totalGain + rsa.gain.totalGain;
        const totalGainsVestedInstruments = option.gain.vestedGain + rsu.gain.vestedGain + warrant.gain.vestedGain + rsa.gain.vestedGain;

        const showExerciseButton = option.vestedQuantity + warrant.vestedQuantity > 0 && !!currentWindow;
        const allInstruments = [warrant, rsa, rsu, option];
        const totalNumberOfInstruments = allInstruments.reduce((accu, x) => x.totalQuantity + accu, 0);
        const hasPerformance = allInstruments.some((x) => x.performance);

        if (this.numberOfInstrumentTypes() === 0) {
            return (
                <div className="overview-section text-content-center">
                    <Message
                        header='You have no instruments yet'
                        content='Instruments you purchase and instruments you are granted will show up here.'
                    />
                </div>

            );
        }

        if (this.numberOfInstrumentTypes() > 1) {
            return (
                <div>
                    <div className="overview-section-container">
                        <InstrumentSection
                            title="My Total Outstanding Instruments"
                            totalGains={totalGainsAllInstruments}
                            vestedGains={totalGainsVestedInstruments}
                            linkPath="/instruments"
                            vestedGainsText='ESTIMATED GAIN, VESTED INSTRUMENTS'
                            totalGainText='ESTIMATED GAIN, ALL INSTRUMENTS'
                            performance={hasPerformance}
                            totalNumberOfInstruments={totalNumberOfInstruments}
                            totalNumberOfInstrumentsText="TOTAL NUMBER OF INSTRUMENTS"
                            vestedInstrumentsActionComponent={showExerciseButton ?
                                <ExerciseButton endDate={currentWindow.to} /> :
                                <NotInExerciseWindow nextWindow={nextWindow} />}
                            viewOrdersComponent={features.exercise &&
                            <span className='margin-left-m'><Button content='View orders' as={Link} to={orderRoute} size="big" basic primary /></span>}
                        />
                        <div className="overview-section overview-section-compact">
                            {
                                this.props.option.allAwards.length > 0 &&
                                <CompactInstrumentsSection
                                    title="Employee Stock Options"
                                    linkPath="/instruments/options"
                                    totalGains={option.gain.totalGain}
                                    vestedGains={option.gain.vestedGain}
                                    vestedQuantity={option.vestedQuantity}
                                    totalNumberOfInstruments={option.totalQuantity}
                                    totalNumberOfInstrumentsText="TOTAL NUMBER OF OPTIONS"
                                    vestedGainsText='ESTIMATED GAIN, VESTED OPTIONS'
                                    totalGainText='ESTIMATED GAIN, ALL OPTIONS'
                                    performance={option.performance}
                                    viewOrdersComponent={features.exercise &&
                                    <span className='margin-left-m'><Button content='View orders' as={Link} to={orderRoute} basic primary /></span>}
                                />
                            }

                            {
                                this.props.warrant.allAwards.length > 0 &&
                                <CompactInstrumentsSection
                                    title="Warrants"
                                    linkPath="/instruments/warrants"
                                    totalGains={warrant.gain.totalGain}
                                    vestedGains={warrant.gain.vestedGain}
                                    vestedQuantity={warrant.vestedQuantity}
                                    totalNumberOfInstruments={warrant.totalQuantity}
                                    totalNumberOfInstrumentsText="TOTAL NUMBER OF WARRANTS"
                                    performance={warrant.performance}
                                    vestedGainsText='ESTIMATED GAIN, VESTED WARRANTS'
                                    totalGainText='ESTIMATED GAIN, ALL WARRANTS'
                                    viewOrdersComponent={features.exercise &&
                                    <span className='margin-left-m'><Button content='View orders' as={Link} to={orderRoute} basic primary /></span>}
                                />
                            }

                            {
                                this.props.rsu.allAwards.length > 0 &&
                                <CompactInstrumentsSection
                                    title="Restricted Share Units (RSUs)"
                                    linkPath="/instruments/rsus"
                                    totalGains={rsu.gain.totalGain}
                                    vestedGains={rsu.gain.vestedGain}
                                    vestedQuantity={rsu.vestedQuantity}
                                    totalNumberOfInstruments={rsu.totalQuantity}
                                    totalNumberOfInstrumentsText="TOTAL NUMBER OF RSUS"
                                    vestedGainsText='ESTIMATED GAIN, VESTED RSUS'
                                    totalGainText='ESTIMATED GAIN, ALL RSUS'
                                    performance={rsu.performance}
                                />
                            }

                            {
                                this.props.rsa.allAwards.length > 0 &&
                                <CompactInstrumentsSection
                                    title="My Outstanding Restricted Share Awards (RSAs)"
                                    linkPath="/instruments/rsas"
                                    totalGains={rsa.gain.totalGain}
                                    vestedGains={rsa.gain.vestedGain}
                                    vestedQuantity={rsa.vestedQuantity}
                                    totalNumberOfInstruments={rsa.totalQuantity}
                                    totalNumberOfInstrumentsText="TOTAL NUMBER OF RSAS"
                                    performance={rsa.performance}
                                    vestedGainsText='ESTIMATED GAIN, VESTED RSAS'
                                    totalGainText='ESTIMATED GAIN, ALL RSAS'
                                />
                            }
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div>
                <div className="overview-section-container">
                    {
                        this.numberOfInstrumentTypes() > 1 &&
                        <InstrumentSection
                            title="My Total Outstanding Instruments"
                            totalGains={totalGainsAllInstruments}
                            vestedGains={totalGainsVestedInstruments}
                            linkPath="/instruments"
                            vestedGainsText='ESTIMATED GAIN, VESTED INSTRUMENTS'
                            totalGainText='ESTIMATED GAIN, ALL INSTRUMENTS'
                            performance={hasPerformance}
                            totalNumberOfInstruments={totalNumberOfInstruments}
                            totalNumberOfInstrumentsText="TOTAL NUMBER OF INSTRUMENTS"
                        />
                    }
                    {
                        this.props.option.allAwards.length > 0 &&
                        <InstrumentSection
                            title="My Outstanding Employee Stock Options"
                            linkPath="/instruments/options"
                            totalGains={option.gain.totalGain}
                            vestedGains={option.gain.vestedGain}
                            vestedQuantity={option.vestedQuantity}
                            totalNumberOfInstruments={option.totalQuantity}
                            totalNumberOfInstrumentsText="TOTAL NUMBER OF OPTIONS"
                            vestedGainsText='ESTIMATED GAIN, VESTED OPTIONS'
                            totalGainText='ESTIMATED GAIN, ALL OPTIONS'
                            vestedInstrumentsActionComponent={showExerciseButton ?
                                <ExerciseButton endDate={currentWindow.to} /> :
                                <NotInExerciseWindow nextWindow={nextWindow} />}
                            viewOrdersComponent={features.exercise &&
                            <span className='margin-left-m'><Button content='View orders' as={Link} to={orderRoute}
                                                                    size="big" basic primary /></span>}
                            performance={option.performance}
                        />
                    }

                    {
                        this.props.rsu.allAwards.length > 0 &&
                        <InstrumentSection
                            title="My Outstanding Restricted Share Units (RSUs)"
                            linkPath="/instruments/rsus"
                            totalGains={rsu.gain.totalGain}
                            vestedGains={rsu.gain.vestedGain}
                            vestedQuantity={rsu.vestedQuantity}
                            totalNumberOfInstruments={rsu.totalQuantity}
                            totalNumberOfInstrumentsText="TOTAL NUMBER OF RSUS"
                            vestedGainsText='ESTIMATED GAIN, VESTED RSUS'
                            totalGainText='ESTIMATED GAIN, ALL RSUS'
                            performance={rsu.performance}
                        />
                    }

                    {
                        this.props.warrant.allAwards.length > 0 &&
                        <InstrumentSection
                            title="My Outstanding Warrants"
                            linkPath="/instruments/warrants"
                            totalGains={warrant.gain.totalGain}
                            vestedGains={warrant.gain.vestedGain}
                            vestedQuantity={warrant.vestedQuantity}
                            totalNumberOfInstruments={warrant.totalQuantity}
                            totalNumberOfInstrumentsText="TOTAL NUMBER OF WARRANTS"
                            performance={warrant.performance}
                            vestedInstrumentsActionComponent={showExerciseButton ?
                                <ExerciseButton endDate={currentWindow.to} /> :
                                <NotInExerciseWindow nextWindow={nextWindow} />}
                            viewOrdersComponent={features.exercise &&
                            <span className='margin-left-m'><Button content='View orders' as={Link} to={orderRoute}
                                                                    size="big" basic primary /></span>}
                            vestedGainsText='ESTIMATED GAIN, VESTED WARRANTS'
                            totalGainText='ESTIMATED GAIN, ALL WARRANTS'
                        />
                    }

                    {
                        this.props.rsa.allAwards.length > 0 &&
                        <InstrumentSection
                            title="My Outstanding Restricted Share Awards (RSAs)"
                            linkPath="/instruments/rsas"
                            totalGains={rsa.gain.totalGain}
                            vestedGains={rsa.gain.vestedGain}
                            vestedQuantity={rsa.vestedQuantity}
                            totalNumberOfInstruments={rsa.totalQuantity}
                            totalNumberOfInstrumentsText="TOTAL NUMBER OF RSAS"
                            performance={rsa.performance}
                            vestedGainsText='ESTIMATED GAIN, VESTED RSAS'
                            totalGainText='ESTIMATED GAIN, ALL RSAS'
                        />
                    }
                </div>
            </div>
        );
    }

    private numberOfInstrumentTypes = () => {
        const options = this.props.option.allAwards.length > 0 ? 1 : 0;
        const rsus = this.props.rsu.allAwards.length > 0 ? 1 : 0;
        const rsas = this.props.rsa.allAwards.length > 0 ? 1 : 0;
        const warrants = this.props.warrant.allAwards.length ? 1 : 0;
        return options + rsus + rsas + warrants;
    }
}

export const awardGain = (sharePrice: number, award: FlatAward): number => {
    return award.quantity * Math.max(sharePrice - award.strike, 0)
};

export const calculateGains = (awards: FlatAward[], sharePrice: number) => {
    const totalGain = awards.filter(removeExpiredAwards).map(awardGain.bind(this, sharePrice)).reduce(sumNumbers, 0);

    const vestedGain = awards.filter(vestedAwards).filter(removeExpiredAwards).map(awardGain.bind(this, sharePrice)).reduce(sumNumbers, 0);
    return {
        totalGain,
        vestedGain,
    }
};

export const calculateValue = (awards: FlatAward[], stockPrice: number) => awards.reduce((accu, award) => ({
    valueToday: (award.quantity * stockPrice) + accu.valueToday,
    intristicValue: (award.quantity * award.strike) + accu.intristicValue,
}), { valueToday: 0, intristicValue: 0 });

const mapStateToProps: MapStateToProps<StateProps, Props, RootState> = ({ user, tenant, instrument, features }): StateProps => ({
    isFetchingInitialData: instrument.isFetchingWelcomeData,
    errorFetchingWelcomeData: instrument.errorFetchingWelcomeData,
    currentWindow: user.currentExerciseWindow,
    nextWindow: user.nextExerciseWindow,
    logoUrl: user.tenant && user.tenant.logo_url,
    warrant: instrument.warrant,
    rsa: instrument.rsa,
    rsu: instrument.rsu,
    option: instrument.option,
    features,
});

export default connect<StateProps>(mapStateToProps)(Home);
