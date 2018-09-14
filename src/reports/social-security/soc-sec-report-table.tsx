import React, {StatelessComponent} from "react";
import {formatNumber, norwegianShortDate} from "../../utils/utils";
import {Table} from 'semantic-ui-react';
import {Moment} from "moment";
import {PrintableSocSecLine, SocSecLine} from "./types";
import {excelNumber, NO_VALUE, ReportInputParams, standardLongPrecision} from "../reports";

export const socSecHeaders = (openingBalanceDate: Moment, closingBalanceDate: Moment) => ([
    "Name",
    "Internal Id",
    "Entity",
    "Program",
    "Subprogram",
    "Grant Date",
    "Vested Date",
    "Expiry Date",
    "Strike",
    "Quantity",
    "Soc Sec",
    `Share Price OB ${openingBalanceDate.format(norwegianShortDate)}`,
    "Intrinsic Value OB",
    `Share Price CB ${closingBalanceDate.format(norwegianShortDate)}`,
    "Intrinsic Value CB",
    `Earned OB ${openingBalanceDate.format(norwegianShortDate)}`,
    `OB Provision ${openingBalanceDate.format(norwegianShortDate)}`,
    "Earned Period",
    "Period Provision",
    `Earned CB ${closingBalanceDate.format(norwegianShortDate)}`,
    `CB Provision ${closingBalanceDate.format(norwegianShortDate)}`,
    "Annual Turnover rate", // 0,05
    "Turnover rate", // 0,1 (grant -> vesting)
    "Turnover Effect OB", // turnover rate - (turnover rate * (days grant -> ob date) / (days grant -> vesting))
    "OB Provision inc. Turn.", // (1 - turnover effect ob) * cost ob
    "Period Provision inc. Turn.", // cost ob inc. turn - cost cb inc. turn
    "Turnover Effect CB", // turnover rate * (days grant -> cb date) / (days grant -> vesting)
    "CB Provision inc. Turn.", // turnover effect cb * cost cb
    "Mobility From", // When the employee started working at the entity
    "Mobility To", // When the employee stopped working at the entity
    "Quantity OB",
    "Quantity CB",
]);

export const toSocSecDataLine = (line: PrintableSocSecLine): string[] => ([
    line.employeeName,
    line.internal_employee_id,
    line.entityName,
    line.planName,
    line.subplanName,
    line.grantDate,
    line.vestedDate,
    line.expiryDate,
    line.strike,
    line.quantity,
    line.socSecRate,
    line.sharePriceOB,
    line.intrinsicValueLastClosingDate,
    line.sharePriceCB,
    line.intrinsicValueAtEndOfPeriod,
    line.earnedRateOB,
    line.costLastClosingDate,
    line.earnedRatePeriod,
    line.costOfPeriod,
    line.earnedRateCB,
    line.costPerEndOfPeriod,
    line.annualTurnoverRate,
    line.totalTurnoverRate,
    line.turnoverEffectOB,
    line.costOBIncTurnover,
    line.periodCostIncTurnover,
    line.turnoverEffectCB,
    line.costCBIncTurnover,
    line.mobilityFrom,
    line.mobilityTo,
    line.quantityOB,
    line.quantityCB
]);

export const toSocSecDataLineWithNumberTypes = (sharePriceOB: number, sharePriceCB: number) => (line: SocSecLine): Array<string | number> => ([
    line.employeeName,
    line.internal_employee_id ? line.internal_employee_id : NO_VALUE,
    line.entityName,
    line.planName,
    line.subplanName,
    line.grantDate ? line.grantDate.format(norwegianShortDate) : NO_VALUE,
    line.vestedDate ? line.vestedDate.format(norwegianShortDate) : NO_VALUE,
    line.expiryDate ? line.expiryDate.format(norwegianShortDate) : NO_VALUE,
    excelNumber(line.strike),
    excelNumber(line.quantity),
    excelNumber(line.socSecRate, standardLongPrecision),
    excelNumber(sharePriceOB, 3),
    excelNumber(line.intrinsicValueLastClosingDate, standardLongPrecision),
    excelNumber(sharePriceCB, 3),
    excelNumber(line.intrinsicValueAtEndOfPeriod, standardLongPrecision),
    excelNumber(line.earnedRateOB, standardLongPrecision),
    excelNumber(line.costLastClosingDate, standardLongPrecision),
    excelNumber(line.earnedRatePeriod, standardLongPrecision),
    excelNumber(line.costOfPeriod, standardLongPrecision),
    excelNumber(line.earnedRateCB, standardLongPrecision),
    excelNumber(line.costPerEndOfPeriod, standardLongPrecision),
    excelNumber(line.annualTurnoverRate, standardLongPrecision),
    excelNumber(line.totalTurnoverRate, standardLongPrecision),
    excelNumber(line.turnoverEffectOB, standardLongPrecision),
    excelNumber(line.costOBIncTurnover, standardLongPrecision),
    excelNumber(line.periodCostIncTurnover, standardLongPrecision),
    excelNumber(line.turnoverEffectCB, standardLongPrecision),
    excelNumber(line.costCBIncTurnover, standardLongPrecision),
    line.mobilityFrom ? line.mobilityFrom.format(norwegianShortDate) : NO_VALUE,
    line.mobilityTo ? line.mobilityTo.format(norwegianShortDate) : NO_VALUE,
    excelNumber(line.quantityOB),
    excelNumber(line.quantityCB),
]);


const SocSecReport: StatelessComponent<{ socSecLines: PrintableSocSecLine[], reportInput: ReportInputParams}> =
    ({socSecLines, reportInput }) => (
        <div className="block-m">
            <h2>Soc Sec Spec</h2>
            <Table celled padded sortable compact={"very"}>
                <Table.Header>
                    <Table.Row>
                        {
                            socSecHeaders(reportInput.openingBalanceDate, reportInput.closingBalanceDate).map((header) => <Table.HeaderCell>{header}</Table.HeaderCell>)
                        }
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {
                        socSecLines.map((line, index) => (
                            <Table.Row key={index}>
                                {
                                    toSocSecDataLine(line).map((data) => <Table.Cell>{data}</Table.Cell>)
                                }
                            </Table.Row>
                        ))
                    }
                </Table.Body>
            </Table>
        </div>
    );

export default SocSecReport;
