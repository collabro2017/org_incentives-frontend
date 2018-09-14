import React, { StatelessComponent } from "react";
import { Program } from "./program-reducer";
import { Table } from "semantic-ui-react";
import { Employee } from "../employees/employee-reducer";
import { employeeNameFromId } from "./program-import";
import { Award } from "../awards/award-reducer";
import {flatten, norwegianShortDate, sum, sumNumbers, yesOrNo} from "../utils/utils";

interface Props {
    programs: Program[],
    employees: Employee[],
    awards: Award[]
}

const ProgramsPreview: StatelessComponent<Props> = ({ programs, employees, awards }) => {

    const allQuantities = flatten(awards.map((award) => award.vesting_events.map((vesting) => vesting.quantity)));
    const sumQuantity = allQuantities.reduce(sumNumbers);
    const tranchecQuantities = flatten(awards.map((a) => a.vesting_events.length));
    const numberOfTranches = tranchecQuantities.reduce(sumNumbers);
    return (
        <div className='block-m'>
            <div className="block-s">
                <Table celled padded>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Program Name</Table.HeaderCell>
                            <Table.HeaderCell>Subprogram Name</Table.HeaderCell>
                            <Table.HeaderCell>Instrument Type</Table.HeaderCell>
                            <Table.HeaderCell>Settlement Type</Table.HeaderCell>
                            <Table.HeaderCell>Performance</Table.HeaderCell>
                            <Table.HeaderCell>Employee ID</Table.HeaderCell>
                            <Table.HeaderCell>Grant Date</Table.HeaderCell>
                            <Table.HeaderCell>Vested Date</Table.HeaderCell>
                            <Table.HeaderCell>Expiry Date</Table.HeaderCell>
                            <Table.HeaderCell>Quantity</Table.HeaderCell>
                            <Table.HeaderCell>Strike</Table.HeaderCell>
                            <Table.HeaderCell>Purchase Price</Table.HeaderCell>
                            <Table.HeaderCell>FV</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {
                            programs.map((program) => program.incentive_sub_programs.map((subProgram) => subProgram.awards.map((award) => award.vesting_events.map((vestingEvent) => {
                                return (
                                    <Table.Row key={program.id}>
                                        <Table.Cell>{program.name}</Table.Cell>
                                        <Table.Cell>{subProgram.name}</Table.Cell>
                                        <Table.Cell>{subProgram.instrumentTypeId}</Table.Cell>
                                        <Table.Cell>{subProgram.settlementTypeId}</Table.Cell>
                                        <Table.Cell>{yesOrNo(subProgram.performance)}</Table.Cell>
                                        <Table.Cell>{employeeNameFromId(employees, award.employee_id)}</Table.Cell>
                                        <Table.Cell>{vestingEvent.grant_date.format(norwegianShortDate)}</Table.Cell>
                                        <Table.Cell>{vestingEvent.vestedDate.format(norwegianShortDate)}</Table.Cell>
                                        <Table.Cell>{vestingEvent.expiry_date.format(norwegianShortDate)}</Table.Cell>
                                        <Table.Cell>{vestingEvent.quantity}</Table.Cell>
                                        <Table.Cell>{vestingEvent.strike}</Table.Cell>
                                        <Table.Cell>{vestingEvent.purchase_price}</Table.Cell>
                                        <Table.Cell>{vestingEvent.fair_value}</Table.Cell>
                                    </Table.Row>
                                );
                            }))))
                        }
                    </Table.Body>
                </Table>
            </div>
            <div className="block-s">
                <Table celled padded>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell/>
                            <Table.HeaderCell>Awards</Table.HeaderCell>
                            <Table.HeaderCell>Tranches</Table.HeaderCell>
                            <Table.HeaderCell>Quantity</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>Total</Table.Cell>
                            <Table.Cell>{awards.length}</Table.Cell>
                            <Table.Cell>{numberOfTranches}</Table.Cell>
                            <Table.Cell>{sumQuantity}</Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            </div>
        </div>
    )
};

export default ProgramsPreview;