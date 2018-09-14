import React, {Component} from 'react';
import {connect, MapStateToProps} from 'react-redux';
import {FETCH_TENANT_AWARDS} from "../award-saga";
import {ExcelSheetAwardLine, Tranche, TrancheTransaction} from "../award-reducer";
import {countryEntry} from "../../data/common";
import {Button, Checkbox, FlagProps, Menu} from "semantic-ui-react";
import {Table, Flag, Loader} from 'semantic-ui-react';
import {
    changePunctuationForComma, flatten,
    formatNumber,
    formatSharePrice,
    norwegianShortDate,
    sumNumbers, yesOrNo
} from "../../utils/utils";
import {handleSortFunction, sortMultipleLevels, SortState} from "../../utils/sort";
import {wasPurchased} from "../list-subprogram-awards";
import SpinnerFullScreen from "../../common/components/spinner-full-screen";
import {NO_VALUE, TransactionType} from "../../reports/reports";
import {RootState} from "../../reducers/all-reducers";
import {sortedTranches, toExcelSheetAwardLine, trancheDataArray} from "../award-selectors";
import moment from "moment";
import XLSX from "xlsx";

interface StateProps {
    allTenantAwards: Tranche[],
    trancheData: Array<Array<string | number>>,
    excelSheetAwardLines: ExcelSheetAwardLine[],
    isFetchingTenantAwards: boolean,
    companyName: string,
}

interface DispatchProps {
    fetchAllAwards: () => void,
}

type Props = StateProps & DispatchProps;

const keepGrantsAndTerminations = (a: ExcelSheetAwardLine) =>
    TransactionType[a.transaction_type] === TransactionType.GRANT ||
    TransactionType[a.transaction_type] === TransactionType.TERMINATION;

interface State extends SortState {
    oldRouteActive: boolean,
    data: DataEntry[],
}

interface DataEntry extends Tranche {
    selected: boolean,
}

class AwardsPage extends Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            column: null,
            data: this.props.allTenantAwards.map(t => ({ ...t, selected: false })),
            direction: "ascending",
            oldRouteActive: false,
        }
    }

    componentDidMount() {
        this.props.fetchAllAwards();
    }

    componentWillReceiveProps(props: Props) {
        if (this.props.allTenantAwards !== props.allTenantAwards) {
            const data = props.allTenantAwards.map(t => ({ ...t, selected: false }));
            this.setState({ data });
        }
    }

    handleSort = clickedColumn => () => {
        this.setState(handleSortFunction(clickedColumn, this.state));
    };

    render() {
        const {data} = this.state;

        if (this.props.isFetchingTenantAwards) {
            return <SpinnerFullScreen active/>;
        }

        return (
            <div>
                {
                    !this.state.oldRouteActive &&
                    <div className="sideways-scrollable">
                        <div className="block-m"/>
                        <div className="text-center">
                            <Button onClick={this.toExcel}>Excel export</Button>
                        </div>
                        <Table celled padded sortable compact={"very"}>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell></Table.HeaderCell>
                                    <Table.HeaderCell onClick={this.handleSort("employeeName")}>Name</Table.HeaderCell>
                                    <Table.HeaderCell onClick={this.handleSort("entityName")}>Entity</Table.HeaderCell>
                                    <Table.HeaderCell onClick={this.handleSort("country")}>Country</Table.HeaderCell>
                                    <Table.HeaderCell onClick={this.handleSort("programName")}>Program</Table.HeaderCell>
                                    <Table.HeaderCell
                                        onClick={this.handleSort("subProgramName")}>Subprogram</Table.HeaderCell>
                                    <Table.HeaderCell onClick={this.handleSort("transaction_type")}>Tx
                                        type</Table.HeaderCell>
                                    <Table.HeaderCell onClick={this.handleSort("instrumentName")}>Instrument
                                        Type</Table.HeaderCell>
                                    <Table.HeaderCell onClick={this.handleSort("settlementName")}>Settlement
                                        Type</Table.HeaderCell>
                                    <Table.HeaderCell
                                        onClick={this.handleSort("performance")}>Performance</Table.HeaderCell>
                                    <Table.HeaderCell>Purchase price</Table.HeaderCell>
                                    <Table.HeaderCell onClick={this.handleSort("strike")}>Strike</Table.HeaderCell>
                                    <Table.HeaderCell onClick={this.handleSort("quantity")}>Quantity</Table.HeaderCell>
                                    <Table.HeaderCell onClick={this.handleSort("exercisedQuantity")}>Exercised</Table.HeaderCell>
                                    <Table.HeaderCell onClick={this.handleSort("exercisedQuantity")}>Terminated</Table.HeaderCell>
                                    <Table.HeaderCell>Expired</Table.HeaderCell>
                                    <Table.HeaderCell onClick={this.handleSort("grantDate")}>Grant Date</Table.HeaderCell>
                                    <Table.HeaderCell onClick={this.handleSort("vestedDate")}>Vested Date</Table.HeaderCell>
                                    <Table.HeaderCell onClick={this.handleSort("expiryDate")}>Expiry Date</Table.HeaderCell>
                                    <Table.HeaderCell onClick={this.handleSort("is_dividend")}>Is
                                        dividend?</Table.HeaderCell>
                                    <Table.HeaderCell onClick={this.handleSort("fair_value")}>Fair value</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {
                                    data.map((tranche, index) => flatten([
                                        [(
                                            <Table.Row key={tranche.id}>
                                                <Table.Cell>{<Checkbox onChange={this.toggleSelect.bind(this, index)} checked={tranche.selected} />}</Table.Cell>
                                                <Table.Cell>{tranche.employeeName}</Table.Cell>
                                                <Table.Cell>{tranche.entityName}</Table.Cell>
                                                <Table.Cell><Flag {...{name: countryEntry(tranche.country).flag} as FlagProps} />{countryEntry(tranche.country).text}</Table.Cell>
                                                <Table.Cell>{tranche.programName}</Table.Cell>
                                                <Table.Cell>{tranche.subProgramName}</Table.Cell>
                                                <Table.Cell>{NO_VALUE}</Table.Cell>
                                                <Table.Cell>{tranche.instrumentName}</Table.Cell>
                                                <Table.Cell>{tranche.settlementName}</Table.Cell>
                                                <Table.Cell>{yesOrNo(tranche.performance)}</Table.Cell>
                                                <Table.Cell>
                                                    {tranche.purchase_price ? tranche.purchase_price.replace('.', ',') : NO_VALUE}
                                                </Table.Cell>
                                                <Table.Cell>{tranche.strike ? tranche.strike.toString().replace('.', ',') : NO_VALUE}</Table.Cell>
                                                <Table.Cell>{formatNumber(tranche.quantity)}</Table.Cell>
                                                <Table.Cell>{formatNumber(-1 * tranche.exercisedQuantity)}</Table.Cell>
                                                <Table.Cell>{formatNumber(-1 * tranche.transactions.map(x => x.termination_quantity || 0).reduce(sumNumbers, 0))}</Table.Cell>
                                                <Table.Cell>{tranche.expiryDate && tranche.expiryDate.isBefore(moment()) ? formatNumber(tranche.quantity) : 0}</Table.Cell>
                                                <Table.Cell>{tranche.grantDate ? tranche.grantDate.format(norwegianShortDate) : NO_VALUE}</Table.Cell>
                                                <Table.Cell>{tranche.vestedDate ? tranche.vestedDate.format(norwegianShortDate) : NO_VALUE}</Table.Cell>
                                                <Table.Cell>{tranche.expiryDate ? tranche.expiryDate.format(norwegianShortDate) : NO_VALUE}</Table.Cell>
                                                <Table.Cell>{yesOrNo(tranche.is_dividend)}</Table.Cell>
                                                <Table.Cell>{tranche.fair_value ? tranche.fair_value : NO_VALUE}</Table.Cell>
                                            </Table.Row>
                                        )],
                                        tranche.selected ? tranche.transactions.map((transaction) => this.renderTransactionRow(transaction, tranche)) : [null]
                                    ]))
                                }
                            </Table.Body>
                        </Table>
                    </div>
                }
            </div>
        );
    }

    private toggleSelect = (index) => {
        const newSelectedState = this.state.data.map((value, i) => index === i ? { ...value, selected: !value.selected } : value);
        this.setState({ data: newSelectedState });
    }

    private toExcel = () => {
        const wb = XLSX.utils.book_new();
        const workSheet = XLSX.utils.aoa_to_sheet(this.props.trancheData);
        XLSX.utils.book_append_sheet(wb, workSheet, "Tranches");
        XLSX.writeFile(wb, `Optio-Tranches-${this.props.companyName}-${moment().format(norwegianShortDate)}.xlsx`);
    }

    private renderTransactionRow = (transaction: TrancheTransaction, tranche: Tranche) => (
        <Table.Row key={transaction.id} active>
            <Table.Cell></Table.Cell>
            <Table.Cell>{tranche.employeeName}</Table.Cell>
            <Table.Cell>{tranche.entityName}</Table.Cell>
            <Table.Cell><Flag {...{name: countryEntry(tranche.country).flag} as FlagProps} />{countryEntry(tranche.country).text}</Table.Cell>
            <Table.Cell>{tranche.programName}</Table.Cell>
            <Table.Cell>{tranche.subProgramName}</Table.Cell>
            <Table.Cell>{transaction.transaction_type}</Table.Cell>
            <Table.Cell>{tranche.instrumentName}</Table.Cell>
            <Table.Cell>{tranche.settlementName}</Table.Cell>
            <Table.Cell>{`${tranche.performance}`}</Table.Cell>
            <Table.Cell>
                {transaction.purchase_price ? transaction.purchase_price.replace('.', ',') : "N/A"}
            </Table.Cell>
            <Table.Cell>{transaction.strike ? transaction.strike.toString().replace('.', ',') : NO_VALUE}</Table.Cell>
            <Table.Cell>{formatNumber(transaction.quantity)}</Table.Cell>
            <Table.Cell>{transaction.transaction_type === TransactionType.EXERCISE ? -1 * transaction.quantity : NO_VALUE}</Table.Cell>
            <Table.Cell>{transaction.transaction_type === TransactionType.TERMINATION ? -1 * transaction.termination_quantity : NO_VALUE}</Table.Cell>
            <Table.Cell>{transaction.grant_date ? moment(transaction.grant_date).format(norwegianShortDate) : NO_VALUE}</Table.Cell>
            <Table.Cell>{transaction.vested_date ? moment(transaction.vested_date).format(norwegianShortDate) : NO_VALUE}</Table.Cell>
            <Table.Cell>{transaction.expiry_date ? moment(transaction.expiry_date).format(norwegianShortDate) : NO_VALUE}</Table.Cell>
            <Table.Cell>{NO_VALUE}</Table.Cell>
            <Table.Cell>{transaction.fair_value}</Table.Cell>
        </Table.Row>
    )
}

const mapStateToProps: MapStateToProps<StateProps, null, RootState> = (state) => ({
    allTenantAwards: sortedTranches(state),
    trancheData: trancheDataArray(state),
    companyName: state.tenant.selectedTenant && state.tenant.selectedTenant.name,
    excelSheetAwardLines: toExcelSheetAwardLine(state),
    isFetchingTenantAwards: state.award.isFetchingTenantAwards
});

const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchAllAwards: () => dispatch({type: FETCH_TENANT_AWARDS})
});

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(AwardsPage);
