import React, {StatelessComponent} from "react";
import {
    excelNumber,
    NO_VALUE,
    printNumber,
    ReportInputParams,
    standardLongPrecision,
    TransactionType
} from "../reports";
import {norwegianShortDate} from "../../utils/utils";
import {Table} from 'semantic-ui-react';
import {Moment} from "moment";
import {PrintableReportLine, ReportLine} from "./types";

export const costHeaders = (openingBalanceDate: Moment, closingBalanceDate: Moment) => ([
    "Name",
    "Internal Id",
    "Entity",
    "Program",
    "Subprogram",
    "Transaction Type",
    "Transaction Date",
    "Grant Date",
    "Vested Date",
    "Expiry Date",
    "Strike",
    "Quantity",
    `Share Price OB ${openingBalanceDate.format(norwegianShortDate)}`,
    `Earned OB ${openingBalanceDate.format(norwegianShortDate)}`,
    `OB Cost ${openingBalanceDate.format(norwegianShortDate)}`,
    `Share Price CB ${closingBalanceDate.format(norwegianShortDate)}`,
    "Earned Period",
    "Period Cost",
    `Earned CB ${closingBalanceDate.format(norwegianShortDate)}`,
    `CB Cost ${closingBalanceDate.format(norwegianShortDate)}`,
    "Unamortized Cost",
    "Fair Value",
    "Annual Turnover rate", // 0,05
    "Turnover rate", // 0,1 (grant -> vesting)
    "Turnover Effect OB", // turnover rate - (turnover rate * (days grant -> ob date) / (days grant -> vesting))
    "Cost OB inc. Turn.", // (1 - turnover effect ob) * cost ob
    "Period Cost inc. Turn.", // cost ob inc. turn - cost cb inc. turn
    "Turnover Effect CB", // turnover rate * (days grant -> cb date) / (days grant -> vesting)
    "Cost CB inc. Turn.", // turnover effect cb * cost cb
    "Unamortized Cost inc. Turn.",
    "Total cost",
    "Tranche Id",
]);

export const toCostSpecDataLine = (line: PrintableReportLine) => ([
    line.employeeName,
    line.internal_employee_id,
    line.entityName,
    line.planName,
    line.subplanName,
    line.transactionType,
    line.transactionDate,
    line.grantDate,
    line.vestingDate,
    line.expiryDate,
    line.strikePrice,
    line.quantity,
    line.sharePriceOB,
    line.earnedOB,
    line.openingBalance,
    line.sharePriceCB,
    line.earnedPeriod,
    line.periodCost,
    line.earnedCB,
    line.closingBalance,
    line.unamortized,
    line.fairValue,
    line.annualTurnoverRate,
    line.totalTurnoverRate,
    line.turnoverEffectOB,
    line.costOBIncTurnover,
    line.periodCostIncTurnover,
    line.turnoverEffectCB,
    line.costCBIncTurnover,
    line.costUnamortizedIncTurnover,
    line.totalCost,
    line.integerId
]);


export const toCostSpecDataLineWithNumbers = (sharePriceOB: number, sharePriceCB: number) => (line: ReportLine) => ([
    line.employeeName,
    line.internal_employee_id ? line.internal_employee_id : NO_VALUE,
    line.entityName,
    line.planName,
    line.subplanName,
    line.transactionType.toString(),
    line.transactionDate.format(norwegianShortDate),
    line.grantDate ? line.grantDate.format(norwegianShortDate) : NO_VALUE,
    line.vestingDate ? line.vestingDate.format(norwegianShortDate) : NO_VALUE,
    line.expiryDate ? line.expiryDate.format(norwegianShortDate) : NO_VALUE,
    excelNumber(line.strikePrice),
    excelNumber(line.quantity),
    excelNumber(sharePriceOB, 3),
    excelNumber(line.earnedOB, standardLongPrecision),
    excelNumber(line.openingBalance),
    excelNumber(sharePriceCB, 3),
    excelNumber(line.earnedPeriod, standardLongPrecision),
    excelNumber(line.periodCost),
    excelNumber(line.earnedCB, standardLongPrecision),
    excelNumber(line.closingBalance),
    excelNumber(line.unamortized),
    excelNumber(line.fairValue, standardLongPrecision),
    excelNumber(line.annualTurnoverRate, standardLongPrecision),
    excelNumber(line.totalTurnoverRate, standardLongPrecision),
    excelNumber(line.turnoverEffectOB, standardLongPrecision),
    excelNumber(line.costOBIncTurnover),
    excelNumber(line.periodCostIncTurnover),
    excelNumber(line.turnoverEffectCB, standardLongPrecision),
    excelNumber(line.costCBIncTurnover),
    excelNumber(line.costUnamortizedIncTurnover),
    excelNumber(line.totalCost),
    line.integerId
]);


const CostSpecReport: StatelessComponent<{ lines: PrintableReportLine[], reportInput: ReportInputParams }> =
    ({lines, reportInput }) => (
        <div className="block-m">
            <h2>Cost Spec</h2>
            <Table celled padded sortable compact={"very"}>
                <Table.Header>
                    <Table.Row>
                        {
                            costHeaders(reportInput.openingBalanceDate, reportInput.closingBalanceDate).map((header) => <Table.HeaderCell>{header}</Table.HeaderCell>)
                        }
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {
                        lines.map((line, index) => (
                            <Table.Row key={index} negative={line.transactionType === TransactionType.TERMINATION}>
                                {
                                    toCostSpecDataLine(line).map(data => <Table.Cell>{data}</Table.Cell>)
                                }
                            </Table.Row>
                        ))
                    }
                </Table.Body>
            </Table>
        </div>
    );

export default CostSpecReport;
