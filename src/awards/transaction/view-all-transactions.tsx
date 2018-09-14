import React, { StatelessComponent } from 'react';
import {formatCurrency2Decimals, formatNumber, formatShortDate, norwegianShortDate} from "../../utils/utils";
import {Tranche, TrancheTransaction, VestingEvent} from "../award-reducer";
import {Table, Button} from 'semantic-ui-react';
import moment from "moment";
import {Link} from 'react-router-dom';
import {NO_VALUE} from "../../reports/reports";

interface Props {
    addTransactionLink: string,
    transactions: TrancheTransaction[],
    tranche: VestingEvent,
}

export const ViewAllTransactions: StatelessComponent<Props> = ({ transactions, addTransactionLink, tranche }) => (
    <div>
        <h1>Transactions</h1>
        <div className="block-m">
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Transaction Type</Table.HeaderCell>
                        <Table.HeaderCell>Transaction Date</Table.HeaderCell>
                        <Table.HeaderCell>Termination Date</Table.HeaderCell>
                        <Table.HeaderCell>Termination Quantity</Table.HeaderCell>
                        <Table.HeaderCell>Grant</Table.HeaderCell>
                        <Table.HeaderCell>Vesting</Table.HeaderCell>
                        <Table.HeaderCell>Expiry</Table.HeaderCell>
                        <Table.HeaderCell>Quantity</Table.HeaderCell>
                        <Table.HeaderCell>Strike</Table.HeaderCell>
                        <Table.HeaderCell>Fair value</Table.HeaderCell>
                        <Table.HeaderCell>Created by</Table.HeaderCell>
                        <Table.HeaderCell>DB Id</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {
                        transactions.map((t: TrancheTransaction) => {
                            return (
                                <Table.Row key={t.id}>
                                    <Table.Cell>{t.transaction_type}</Table.Cell>
                                    <Table.Cell>{`${moment(t.transaction_date).format("DD.MM.YY")}`}</Table.Cell>

                                    <Table.Cell>{isTerminationTransaction(t) ? `${formatShortDate(t.termination_date)}` : "-"}</Table.Cell>
                                    <Table.Cell>{isTerminationTransaction(t) ? formatNumber(t.termination_quantity) : "-"}</Table.Cell>

                                    <Table.Cell>{t.grant_date ? `${formatShortDate(t.grant_date)}` : "-"}</Table.Cell>
                                    <Table.Cell>{t.vested_date ? `${formatShortDate(t.vested_date)}` : "-"}</Table.Cell>
                                    <Table.Cell>{t.expiry_date ? `${formatShortDate(t.expiry_date)}` : "-"}</Table.Cell>
                                    <Table.Cell>{t.quantity ? formatNumber(t.quantity) : "-"}</Table.Cell>
                                    <Table.Cell>{t.strike ? formatCurrency2Decimals(parseFloat(t.strike)) : "-"}</Table.Cell>
                                    <Table.Cell>{t.fair_value ? parseFloat(t.fair_value) : "-"}</Table.Cell>
                                    <Table.Cell>{t.account_id ? t.account_id : "-"}</Table.Cell>
                                    <Table.Cell>{t.id}</Table.Cell>
                                </Table.Row>
                            )
                        })
                    }
                </Table.Body>
                <Table.Footer>
                    <Table.Row>
                        <Table.HeaderCell>Tranche State:</Table.HeaderCell>
                        <Table.HeaderCell>{NO_VALUE}</Table.HeaderCell>
                        <Table.HeaderCell>{NO_VALUE}</Table.HeaderCell>
                        <Table.HeaderCell>{tranche.termination_quantity}</Table.HeaderCell>
                        <Table.HeaderCell>{formatShortDate(tranche.grant_date)}</Table.HeaderCell>
                        <Table.HeaderCell>{formatShortDate(tranche.vestedDate)}</Table.HeaderCell>
                        <Table.HeaderCell>{formatShortDate(tranche.expiry_date)}</Table.HeaderCell>
                        <Table.HeaderCell>{formatNumber(tranche.quantity)}</Table.HeaderCell>
                        <Table.HeaderCell>{tranche.strike ? formatCurrency2Decimals(parseFloat(tranche.strike)) : NO_VALUE}</Table.HeaderCell>
                        <Table.HeaderCell>{tranche.fair_value ? tranche.fair_value : NO_VALUE}</Table.HeaderCell>
                        <Table.HeaderCell>{NO_VALUE}</Table.HeaderCell>
                        <Table.HeaderCell>{tranche.id}</Table.HeaderCell>
                    </Table.Row>
                </Table.Footer>
            </Table>
        </div>
        <div className="text-center">
            <Button as={Link} to={addTransactionLink}>Add transaction</Button>
        </div>
    </div>
);

const isTerminationTransaction = (t: TrancheTransaction) => t.transaction_type === "TERMINATION";
const isAdjustmentTransaction = (t: TrancheTransaction) => t.transaction_type === "ADJUSTMENT";
const isAdjustmentDividendTransaction = (t: TrancheTransaction) => t.transaction_type === "ADJUSTMENT_DIVIDEND";
