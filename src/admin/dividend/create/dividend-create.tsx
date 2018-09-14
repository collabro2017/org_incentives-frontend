import React, { Component, StatelessComponent } from 'react';
import { Button } from 'semantic-ui-react';
import { Link } from "react-router-dom";
import CreateDividendForm, { DividendEffect, DividendEffectItem } from "./dividend-create-form";
import { MapStateToProps } from "react-redux";
import {
    apiShortDate,
    changeCommaForPunctuation, flatten,
    norwegianShortDate
} from "../../../utils/utils";
import moment from "moment";
import { Dividend } from "../dividend-reducer";
import { RootState } from "../../../reducers/all-reducers";
import { connect } from "react-redux";
import SpinnerFullScreen from "../../../common/components/spinner-full-screen";
import { Program } from "../../../programs/program-reducer";
import { CreateDividendBody } from "../dividend-management-page";
import DividendCreateTutorial from "./dividend-create-tutorial";

interface OwnProps {
    createDividend: (dividend: CreateDividendBody) => void,
    backLink: string,
}

interface StateProps {
    isFetching: boolean,
    programs: Program[],
}

interface DispatchProps {
    fetchEmployeesAndPrograms: () => void,
}

type Props = OwnProps & StateProps & DispatchProps;

interface State {
    dividend_per_share: string,
    share_price_at_dividend_date: string,
    dividend_date: string,
    effects: DividendEffectItem[],
    allSelected: boolean,
}

class CreateDividend extends Component<Props, State> {
    state = {
        dividend_date: moment().format(norwegianShortDate),
        dividend_per_share: '',
        share_price_at_dividend_date: '',
        effects: [],
        allSelected: false,
    };

    componentDidMount() {
        this.props.fetchEmployeesAndPrograms();
    }

    componentWillReceiveProps(newProps: Props) {
        if (this.props.programs !== newProps.programs) {
            this.setState({ effects: toEffects(newProps.programs) })
        }
    }

    render() {
        if (this.props.isFetching) {
            return <SpinnerFullScreen active />
        }

        const { dividend_date, dividend_per_share, share_price_at_dividend_date } = this.state;
        console.log(this.state);
        return (
            <div className="width-limit-small">
                <h1>Create dividend</h1>
                <div className="block-m">
                    <DividendCreateTutorial/>
                </div>
                <div className="block-m">
                    <CreateDividendForm
                        dividend_date={dividend_date}
                        dividend_per_share={dividend_per_share}
                        share_price_at_dividend_date={share_price_at_dividend_date}
                        handleDateChange={this.handleTextChange}
                        handleTextChange={this.handleTextChange}
                        effects={this.state.effects}
                        allSelected={this.state.allSelected}
                        effectChanged={this.effectChanged}
                        effectToggle={this.effectToggle}
                        toggleSelectAll={this.toggleSelectAll}
                    />
                </div>
                <div className='text-center'>
                    <BackButton path={this.props.backLink} />
                    <Button onClick={this.createDividend} positive>Save</Button>
                </div>
            </div>
        );
    }

    private handleTextChange = (event, { name, value }) => {
        this.setState({ [name]: value })
    };

    private createDividend = () => {
        const dividend: CreateDividendBody = {
            dividend_date: moment(this.state.dividend_date, norwegianShortDate).format(apiShortDate),
            dividend_per_share: parseFloat(changeCommaForPunctuation(this.state.dividend_per_share)).toString(),
            share_price_at_dividend_date: parseFloat(changeCommaForPunctuation(this.state.share_price_at_dividend_date)).toString(),
            dividend_transactions: this.state.effects.filter(e => e.selected).map(e => ({
                sub_program_id: e.sub_program_id,
                dividend_transaction_type: e.dividendEffect
            })),
        };

        this.props.createDividend(dividend)
    }

    private effectToggle = (index) => {
        const updated: DividendEffectItem[] = this.state.effects.map((e, i) => index === i ? { ...e, selected: !e.selected } : e );
        this.setState({ effects: updated });
    }

    private effectChanged = (index, event, { value }) => {
        const updated: DividendEffectItem[] = this.state.effects.map((e, i) => index === i ? { ...e, dividendEffect: value } : e );
        this.setState({ effects: updated });
    }

    private toggleSelectAll = () => this.setState({ allSelected: !this.state.allSelected });
}

const toEffects = (programs: Program[]): DividendEffectItem[] => flatten(programs.map((p) => p.incentive_sub_programs.map((sp) => ({
    selected: true,
    programName: p.name,
    subprogramName: sp.name,
    sub_program_id: sp.id,
    instrumentType: sp.instrumentTypeId,
    dividendEffect: sp.instrumentTypeId === 'option' || sp.instrumentTypeId === 'warrant' ? DividendEffect.STRIKE_ADJUSTMENT : DividendEffect.GENERATE_DIVIDEND_INSTRUMENTS
}))));

const BackButton: StatelessComponent<{ path: string }> = ({ path }) => (
    <Link to={path}>
        <Button>Back to dividends</Button>
    </Link>
);


const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state): StateProps => {
    return ({
        isFetching: state.award.isFetching,
        programs: state.program.allPrograms,
    })
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchEmployeesAndPrograms: () => dispatch ({ type: 'FETCH_EMPLOYEES_AND_PROGRAMS' }),
});

const ConnectedComponent = connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(CreateDividend);

export default ConnectedComponent;
