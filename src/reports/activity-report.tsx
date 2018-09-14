import React, {StatelessComponent} from "react";
import {NO_VALUE, printNumber, TransactionType} from "./reports";
import {formatNumber, norwegianShortDate} from "../utils/utils";
import { Table } from 'semantic-ui-react';
import {ReportLine} from "./ifrs-cost-spec/types";

const ActivityReport: StatelessComponent<{lines: ReportLine[]}> = ({ lines }) => (
    <div className="block-m">
        <h2>Activity report (grants and terminations in reporting period)</h2>
        <Table celled padded sortable compact={"very"}>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Entity</Table.HeaderCell>
                    <Table.HeaderCell>Program</Table.HeaderCell>
                    <Table.HeaderCell>Subprogram</Table.HeaderCell>
                    <Table.HeaderCell>Transaction Type</Table.HeaderCell>
                    <Table.HeaderCell>Transaction Date</Table.HeaderCell>
                    <Table.HeaderCell>Grant Date</Table.HeaderCell>
                    <Table.HeaderCell>Vested Date</Table.HeaderCell>
                    <Table.HeaderCell>Expiry Date</Table.HeaderCell>
                    <Table.HeaderCell>Strike</Table.HeaderCell>
                    <Table.HeaderCell>Quantity</Table.HeaderCell>
                    <Table.HeaderCell>Fair Value</Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {
                    lines.map((line, index) => (
                        <Table.Row key={index} negative={line.transactionType === TransactionType.TERMINATION}>
                            <Table.Cell>{line.employeeName}</Table.Cell>
                            <Table.Cell>{line.entityName}</Table.Cell>
                            <Table.Cell>{line.planName}</Table.Cell>
                            <Table.Cell>{line.subplanName}</Table.Cell>
                            <Table.Cell>{line.transactionType}</Table.Cell>
                            <Table.Cell>{line.transactionDate.format(norwegianShortDate)}</Table.Cell>
                            <Table.Cell>{line.grantDate ? line.grantDate.format(norwegianShortDate) : NO_VALUE}</Table.Cell>
                            <Table.Cell>{line.vestingDate ? line.vestingDate.format(norwegianShortDate) : NO_VALUE}</Table.Cell>
                            <Table.Cell>{line.expiryDate ? line.expiryDate.format(norwegianShortDate) : NO_VALUE}</Table.Cell>
                            <Table.Cell>{printNumber(line.strikePrice)}</Table.Cell>
                            <Table.Cell>{formatNumber(line.quantity)}</Table.Cell>
                            <Table.Cell>{printNumber(line.fairValue)}</Table.Cell>
                        </Table.Row>
                    ))
                }
            </Table.Body>
        </Table>
    </div>
);

export default ActivityReport;
