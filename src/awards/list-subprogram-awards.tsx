import React, { StatelessComponent } from 'react';
import moment from "moment";
import { DropdownItemProps, Table, Button, Card } from 'semantic-ui-react';
import { SubProgram } from "../subprograms/subprogram-reducer";
import { Award, VestingEvent } from "./award-reducer";
import { Link } from "react-router-dom";
import { yesOrNo } from "../utils/utils";
import { VestingEventInput } from "./award-employee-management";

interface Props {
    subProgram: SubProgram,
    employeeOptions: DropdownItemProps[],
    openEditForm: (award: Award, subProgram: SubProgram) => void,
    deleteAward: (award: Award) => void,
    createTransactionsLink: (vesting_event_id: string) => string,
}

interface Purchasable {
    purchase_price?: string
}

export const wasPurchased = (ve: Purchasable) => !!ve.purchase_price && parseFloat(ve.purchase_price) !== 0;

const ListSubprogramAwards: StatelessComponent<Props> = ({ subProgram, employeeOptions, openEditForm, deleteAward, createTransactionsLink }) => {
    return (
        <div>
            <div className='form-greyscale'>
                <Card fluid>
                    <Card.Content>
                        <h3 className="text-center">{subProgram.name}</h3>
                        <div className="flex-row space-between align-center" style={{ paddingBottom:'0.5rem' }}>
                            <span><strong>Performance: &nbsp;</strong>{`${subProgram.performance}`}</span>
                            <span><strong>Settlement: &nbsp;</strong>{`${subProgram.settlementTypeId}`}</span>
                            <span><strong>Instrument: &nbsp;</strong>{`${subProgram.instrumentTypeId}`}</span>
                        </div>
                    </Card.Content>
                </Card>
                {
                    subProgram.awards.map((award) => {
                        const employee = employeeOptions.filter((option) => option.value === award.employee_id)[0];


                        return (
                            <Card fluid key={award.id}>
                                <div className='form-white block-s'>
                                    <div className='align-center block-s'>
                                        <p><strong>{employee.text}</strong></p>
                                    </div>
                                    <div className='block-m'>
                                        <Table celled>
                                            <Table.Header>
                                                <Table.Row>
                                                    <Table.HeaderCell>Grant Date</Table.HeaderCell>
                                                    <Table.HeaderCell>Vested Date</Table.HeaderCell>
                                                    <Table.HeaderCell>Expiry Date</Table.HeaderCell>
                                                    <Table.HeaderCell>Quantity</Table.HeaderCell>
                                                    {
                                                        award.vesting_events.some(wasPurchased) && <Table.HeaderCell>Purchase price</Table.HeaderCell>
                                                    }
                                                    {
                                                        award.vesting_events.some((ve) => ve.is_dividend) && <Table.HeaderCell>Is dividend</Table.HeaderCell>
                                                    }
                                                    <Table.HeaderCell>Strike</Table.HeaderCell>
                                                    <Table.HeaderCell>DD Id</Table.HeaderCell>
                                                    <Table.HeaderCell/>
                                                </Table.Row>
                                            </Table.Header>
                                            <Table.Body>
                                                {
                                                    award.vesting_events.map((vesting) => {
                                                        return (
                                                            <Table.Row key={vesting.id}>
                                                                <Table.Cell>{`${moment(vesting.grant_date).format("DD.MM.YY")}`}</Table.Cell>
                                                                <Table.Cell>{`${moment(vesting.vestedDate).format("DD.MM.YY")}`}</Table.Cell>
                                                                <Table.Cell>{`${moment(vesting.expiry_date).format("DD.MM.YY")}`}</Table.Cell>
                                                                <Table.Cell>{vesting.quantity}</Table.Cell>
                                                                {
                                                                    award.vesting_events.some(wasPurchased) &&
                                                                    <Table.Cell>
                                                                        {vesting.purchase_price ? vesting.purchase_price.replace('.', ',') : "N/A"}
                                                                    </Table.Cell>
                                                                }
                                                                {
                                                                    award.vesting_events.some((ve) => ve.is_dividend) &&
                                                                    <Table.Cell>
                                                                        {yesOrNo(vesting.is_dividend)}
                                                                    </Table.Cell>
                                                                }

                                                                <Table.Cell>{vesting.strike && vesting.strike.replace('.', ',')}</Table.Cell>
                                                                <Table.Cell>{vesting.id}</Table.Cell>
                                                                <Table.Cell><Link to={createTransactionsLink(vesting.id)}>View transactions ({vesting.transactions.length})</Link></Table.Cell>
                                                            </Table.Row>
                                                        )
                                                    })
                                                }
                                            </Table.Body>
                                        </Table>
                                    </div>
                                    <div>
                                        <div className="text-center ui two buttons">
                                            <Button basic color='green' onClick={openEditForm.bind(this, award, subProgram)}>Edit</Button>
                                            <Button basic color='red' onClick={deleteAward.bind(this, award)}>Delete</Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )
                    })
                }
            </div>

        </div>
    )
};

export default ListSubprogramAwards;