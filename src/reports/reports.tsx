import React, { Component, StatelessComponent } from 'react';
import moment, {isMoment, Moment} from 'moment';
import { Form, Button} from 'semantic-ui-react';
import numeral from "numeral";
import "numeral/locales/no.js";
import { RootState } from "../reducers/all-reducers";
import {Award, ExcelSheetAwardLine, Tranche} from "../awards/award-reducer";
import { MapStateToProps, connect } from "react-redux";
import {
    changeCommaForPunctuation,
    changePunctuationForComma, flatten, formatLongDate, formatNumber, formatSharePrice, formatShortDate,
    norwegianShortDate
} from "../utils/utils";
import {FETCH_TENANT_AWARDS, toTranches} from "../awards/award-saga";
import ActivityReport from "./activity-report";
import FairValueInput, {FairValueInputLineState} from "./fair-value-input";
import {UPDATE_TRANSACTION} from "../awards/transaction/transaction-actions";
import SocSecReport, {
    socSecHeaders,
    toSocSecDataLine,
    toSocSecDataLineWithNumberTypes
} from "./social-security/soc-sec-report-table";
import CostSpecReport, {
    costHeaders,
    toCostSpecDataLine,
    toCostSpecDataLineWithNumbers
} from "./ifrs-cost-spec/cost-spec-report-table";
import XLSX from 'xlsx';
import {PrintableSocSecLine, SocSecLine} from "./social-security/types";
import {PrintableReportLine, ReportLine} from "./ifrs-cost-spec/types";
import {calcCostSpecForTerminationTransactions} from "./ifrs-cost-spec/cost-spec-calc";
import {toPrintableReportLine, toReportLines} from "./ifrs-cost-spec/cost-spec-mappers";
import {generateSocSecLines} from "./social-security/soc-sec-calc";
import {toPrintableSocSecLines} from "./social-security/soc-sec-mappers";
import overviewSheet from "./report-overview/overview-sheet";
import {toExcelSheetAwardLine} from "../awards/award-selectors";

numeral.locale('no');
export const standardLongPrecision = 4;
interface StockPrice {
    date: Moment;
    price: number;
}

interface State {
    reportStart: string,
    reportEnd: string,
    sharePriceLastClosing: string,
    sharePriceAtEndOfPeriod: string,
    annualTurnover: string,
    periodName: string,
    requiresInput: boolean,
}

interface StateProps {
    awards: ExcelSheetAwardLine[],
    tranches: Tranche[],
    companyName: string,
}

export enum TransactionType {
    GRANT = "GRANT",
    TERMINATION = "TERMINATION",
    ADJUSTMENT_DIVIDEND = "ADJUSTMENT_DIVIDEND",
    EXERCISE = "EXERCISE",
    ADJUSTMENT_VESTING_DATE = "ADJUSTMENT_VESTING_DATE",
    ADJUSTMENT_STRIKE = "ADJUSTMENT_STRIKE"
}

interface DispatchProps {
    fetchAllAwards: () => void,
    updateFairValues: (transactions: UpdateTransaction[]) => void,
}

export const NO_VALUE = "-";

export const printNumber = (number: string | number | null) => {
    if (typeof number === "number") {
        return changePunctuationForComma(number.toString());
    } else if (typeof number === "string") {
        return changePunctuationForComma(number)
    }

    return NO_VALUE
};

export const excelNumber = (number: string | number | null, precision?: number): string | number => {
    if (typeof number === "number" && !isNaN(number)) {
        return precision ? parseFloat(number.toFixed(precision)) : number;
    } else if (typeof number === "string") {
        const parsedNumber = parseFloat(changeCommaForPunctuation(number));
        return precision ? parseFloat(parsedNumber.toFixed(precision)) : parsedNumber;
    }

    return NO_VALUE
};


export const printDecimalNumber = (number: string | number | null) => {
    if (typeof number === "number") {
        return changePunctuationForComma(number.toFixed(standardLongPrecision));
    } else if (typeof number === "string") {
        return changePunctuationForComma(parseFloat(number).toFixed(standardLongPrecision))
    }

    return NO_VALUE
};

const activitiesInPeriod = (lines: ReportLine[], reportStart: Moment, reportEnd: Moment) =>
    lines.filter((line) => line.transactionDate.isBetween(reportStart, reportEnd, null, "[]"));

export interface ReportInputParams {
    openingBalanceDate: Moment,
    closingBalanceDate: Moment,
    openingBalanceSharePrice: number,
    closingBalanceSharePrice: number,
    annualTurnover: number,
    periodName: string,
}

class ReportsManagementPage extends Component<StateProps & DispatchProps, State> {
    constructor() {
        super();
        this.state = {
            reportStart: "01.06.18",
            reportEnd: "30.09.18",
            sharePriceLastClosing: null,
            sharePriceAtEndOfPeriod: null,
            requiresInput: true,
            annualTurnover: "0,05",
            periodName: moment().subtract(1, "quarter").format("[Q]Q-YYYY"),
        };
    }

    componentDidMount() {
        this.props.fetchAllAwards();
    }

    render() {
        const grantsMissingFairVale = this.props.awards.filter((line) => !line.fair_value && TransactionType[line.transaction_type] == TransactionType.GRANT);
        if (grantsMissingFairVale.length > 0) {
            const unique = grantsMissingFairVale.reduce<ExcelSheetAwardLine[]>((accu, current) => {
                const exists = accu.some((x) =>
                    x.grantDate.isSame(current.grantDate) &&
                    x.vestedDate.isSame(current.vestedDate) &&
                    x.expiryDate.isSame(current.expiryDate)
                );
                if (exists) {
                    return accu;
                } else {
                    return accu.concat(current);
                }
            }, []);
            return <FairValueInput lines={unique} updateFairValues={this.updateFairValues.bind(this, grantsMissingFairVale)}/>
        }

        if (this.state.requiresInput) {
            return (
                <Form size={"large"}>
                    <Form.Field width={8}>
                        <label>Period Name</label>
                        <input value={this.state.periodName}
                               onChange={this.handleChange.bind(this, 'periodName')}/>
                    </Form.Field>
                    <Form.Field width={8}>
                        <label>Report start</label>
                        <input placeholder='Report start' value={this.state.reportStart}
                               onChange={this.handleChange.bind(this, 'reportStart')}/>
                    </Form.Field>
                    <Form.Field width={8}>
                        <label>Report end</label>
                        <input placeholder='Report end' value={this.state.reportEnd}
                               onChange={this.handleChange.bind(this, 'reportEnd')}/>
                    </Form.Field>
                    <Form.Field width={8}>
                        <label>Share price OB</label>
                        <input placeholder='share price' value={this.state.sharePriceLastClosing}
                               onChange={this.handleChange.bind(this, 'sharePriceLastClosing')}/>
                    </Form.Field>
                    <Form.Field width={8}>
                        <label>Share price CB</label>
                        <input placeholder='share price' value={this.state.sharePriceAtEndOfPeriod}
                               onChange={this.handleChange.bind(this, 'sharePriceAtEndOfPeriod')}/>
                    </Form.Field>
                    <Form.Field width={8}>
                        <label>Expected annual turnover rate (0,05 for 5%)</label>
                        <input placeholder='E.g. 0,05 for 5%' value={this.state.annualTurnover}
                               onChange={this.handleChange.bind(this, 'annualTurnover')}/>
                    </Form.Field>
                    <div className="text-center">
                        <Button positive type='submit' onClick={() => this.inputValid() && this.setState({ requiresInput: false })}>Proceed</Button>
                    </div>
                </Form>
            )
        }

        const {
            reportStart,
            reportEnd,
            sharePriceLastClosing,
            sharePriceAtEndOfPeriod,
            annualTurnover,
            periodName
        } = this.parseInput();

        const reportInput: ReportInputParams = {
            openingBalanceDate: reportStart,
            closingBalanceDate: reportEnd,
            openingBalanceSharePrice: sharePriceLastClosing,
            closingBalanceSharePrice: sharePriceAtEndOfPeriod,
            annualTurnover,
            periodName,
        };

        const costLines: ReportLine[] = flatten(
            this.props.awards
                .filter(removeFutureTransactions.bind(this, reportEnd))
                .map(toReportLines(reportInput))
        );//.map(calcCostSpecForTerminationTransactions(reportInput));

        const printableCostLines = costLines.map(toPrintableReportLine(sharePriceLastClosing, sharePriceAtEndOfPeriod));

        const activities: ReportLine[] = activitiesInPeriod(costLines, reportStart, reportEnd);
        const socSecLines: SocSecLine[] = generateSocSecLines(this.props.tranches, reportInput);
        const printableSocSecLines = socSecLines.map(toPrintableSocSecLines(sharePriceLastClosing, sharePriceAtEndOfPeriod));

        return (
            <div style={{ overflowX: 'scroll', paddingLeft: '32px', paddingRight: '32px' }}>
                <h1>Reporting</h1>
                <div className={"block-m"}>
                    <h2>Input</h2>
                    <div>Period start: {formatShortDate(reportStart)}</div>
                    <div>Period end: {formatShortDate(reportEnd)}</div>
                    <div>Share price {formatShortDate(moment(reportStart).subtract(1, 'days'))}: {sharePriceLastClosing}</div>
                    <div>Share price {formatShortDate(reportEnd)}: {sharePriceAtEndOfPeriod}</div>
                    <div>
                        <Button onClick={this.generateExcel(this.props.awards, costLines, printableCostLines, socSecLines, printableSocSecLines, reportStart, reportEnd, sharePriceLastClosing, sharePriceAtEndOfPeriod, periodName, this.props.companyName)}>To Excel</Button>
                    </div>
                </div>
                <CostSpecReport
                    lines={printableCostLines}
                    reportInput={reportInput}
                />
                <SocSecReport
                    socSecLines={printableSocSecLines}
                    reportInput={reportInput}
                />
                <ActivityReport lines={activities} />

            </div>
        );
    }

    private generateExcel = (awards: ExcelSheetAwardLine[], costLines: ReportLine[], printableCostLines: PrintableReportLine[], socSecLines: SocSecLine[], printableSocSecLines: PrintableSocSecLine[], openingBalanceDate: Moment, closingBalanceDate: Moment, sharePriceOB: number, sharePriceCB: number, periodName: string, companyName: string) => () => {
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, overviewSheet(awards, costLines, socSecLines, openingBalanceDate, closingBalanceDate, periodName, sharePriceOB, sharePriceCB, companyName), "Overview");
        XLSX.utils.book_append_sheet(wb, costSheet(costLines, openingBalanceDate, closingBalanceDate, sharePriceOB, sharePriceCB), "Optio IFRS");
        XLSX.utils.book_append_sheet(wb, socSecSheet(socSecLines, openingBalanceDate, closingBalanceDate, sharePriceOB, sharePriceCB), "Optio SocSec");
        XLSX.writeFile(wb, `Optio Report-${moment().format(norwegianShortDate)}.xlsx`);
    };

    private updateFairValues = (linesMissingFairValue: ExcelSheetAwardLine[], values: FairValueInputLineState[]) => {
        const findFairValue = (line: ExcelSheetAwardLine): string =>
            values.filter((v) => {
                return v.grantDate.isSame(line.grantDate) && v.vestedDate.isSame(line.vestedDate) && v.expiryDate.isSame(line.expiryDate)
            })[0].fair_value;

        const updateObjects = linesMissingFairValue.map((line) => ({
            transactionId: line.id,
            fair_value: findFairValue(line)
        }));

        this.props.updateFairValues(updateObjects);
    }

    private inputValid = () => {
        const {
            reportStart,
            reportEnd,
            sharePriceLastClosing,
            sharePriceAtEndOfPeriod,
            annualTurnover
        } = this.parseInput();

        return  reportStart.isValid() &&
            reportEnd.isValid() &&
            !isNaN(sharePriceLastClosing) &&
            !isNaN(annualTurnover) && annualTurnover >= 0 && annualTurnover <= 1 &&
            !isNaN(sharePriceAtEndOfPeriod)
    };

    private handleChange = (key, event) => {
        let updateObject = {};
        updateObject[key] = event.target.value;
        this.setState(updateObject);
    };

    private parseInput = () => ({
        reportStart: moment(this.state.reportStart, norwegianShortDate),
        reportEnd: moment(this.state.reportEnd, norwegianShortDate),
        sharePriceLastClosing: parseFloat(changeCommaForPunctuation(this.state.sharePriceLastClosing)),
        sharePriceAtEndOfPeriod: parseFloat(changeCommaForPunctuation(this.state.sharePriceAtEndOfPeriod)),
        annualTurnover: parseFloat(changeCommaForPunctuation(this.state.annualTurnover)),
        periodName: this.state.periodName,
    });
}


const costSheet = (costLines: ReportLine[], openingBalanceDate: Moment, closingBalanceDate: Moment, sharePriceOB: number, sharePriceCB: number) => {
    const costData = costLines.map(toCostSpecDataLineWithNumbers(sharePriceOB, sharePriceCB));
    const data = [
        costHeaders(openingBalanceDate, closingBalanceDate),
        ...costData
    ];

    return XLSX.utils.aoa_to_sheet(data);
}

const socSecSheet = (lines: SocSecLine[], openingBalanceDate: Moment, closingBalanceDate: Moment, sharePriceOB: number, sharePriceCB: number) => {
    const socSecData = lines.map(toSocSecDataLineWithNumberTypes(sharePriceOB, sharePriceCB));
    const data = [
        socSecHeaders(openingBalanceDate, closingBalanceDate),
        ...socSecData
    ];
    return XLSX.utils.aoa_to_sheet(data);
}

const removeFutureTransactions = (reportEnd: Moment, award: ExcelSheetAwardLine): boolean => award.transaction_date.isSameOrBefore(reportEnd);

const mapStateToProps: MapStateToProps<StateProps, null, RootState> = (state): StateProps => {
    return ({
        awards: toExcelSheetAwardLine(state),
        tranches: state.award.allTenantAwards,
        companyName: state.tenant.selectedTenant && state.tenant.selectedTenant.name,
    });
};

export interface UpdateTransaction {
    transactionId: string,
    fair_value: string,
}

const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchAllAwards: () => dispatch({ type: FETCH_TENANT_AWARDS }),
    updateFairValues: (transactions: UpdateTransaction[]) => dispatch({ type: UPDATE_TRANSACTION, transactions })
});
export default connect(mapStateToProps, mapDispatchToProps)(ReportsManagementPage);
