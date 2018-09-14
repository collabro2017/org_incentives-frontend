import React, { StatelessComponent } from 'react';
import { Button, Table} from 'semantic-ui-react';
import { Program } from "./program-reducer";
import moment from 'moment';

interface Props {
    program: Program
    saveProgram: () => void,
    closeProgram: () => void
}

const ViewProgram: StatelessComponent<Props> =  ({ program, saveProgram, closeProgram }) => {
    return (
        <div>
            <div key={program.name} className="flex-row space-between align-center">
                <span>{program.name}</span>
                <span>{program.capacity}</span>
                <span>{program.startDate.format("DD.MM.YY")} - {program.endDate.format("DD.MM.YY")}</span>
            </div>
            <div className="divider-m" />
            {
                program.incentive_sub_programs.map((subProgram, index) => {
                    return (
                        <div key={index}>
                            <div className='row-center space-between align-center'>
                                <span className='text-content'>{`${subProgram.name}`}</span>
                                <span>{`Settlement: ${subProgram.settlementTypeId}`}</span>
                                <span>{`Instrument: ${subProgram.instrumentTypeId}`}</span>
                            </div>
                            <div className={'block-m'}>
                                <Table>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Grant Date</Table.HeaderCell>
                                            <Table.HeaderCell>Vested Date</Table.HeaderCell>
                                            <Table.HeaderCell>Expiry Date</Table.HeaderCell>
                                            <Table.HeaderCell>Quantity %</Table.HeaderCell>
                                            <Table.HeaderCell>Strike</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {
                                            subProgram.incentive_sub_program_template.vesting_event_templates.map((vesting, index) => {
                                                return (
                                                    <Table.Row key={index}>
                                                        <Table.Cell>{`${moment(vesting.grant_date).format("DD.MM.YY")}`}</Table.Cell>
                                                        <Table.Cell>{`${moment(vesting.vestedDate).format("DD.MM.YY")}`}</Table.Cell>
                                                        <Table.Cell>{`${moment(vesting.expiry_date).format("DD.MM.YY")}`}</Table.Cell>
                                                        <Table.Cell>{vesting.quantityPercentage}</Table.Cell>
                                                        <Table.Cell>{vesting.strike.toString().replace('.', ',')}</Table.Cell>
                                                    </Table.Row>
                                                )
                                            })
                                        }
                                    </Table.Body>
                                </Table>
                            </div>
                        </div>
                    )
                })
            }
            {
                program.incentive_sub_programs.length > 0 &&
                <div className="text-center button-wrapper">
                    <Button.Group>
                        <Button type='button' onClick={closeProgram}>Cancel</Button>
                        <Button.Or />
                        <Button positive type='submit' onClick={saveProgram}>Save Program</Button>
                    </Button.Group>
                </div>
            }
        </div>
    );
};


export default ViewProgram;