import React, {Component, StatelessComponent} from 'react';
import { Table, Button, Card } from 'semantic-ui-react'
import { Program } from "./program-reducer";
import moment from 'moment';
import { formatPercentage } from "../utils/utils";
import { SubProgram } from "../subprograms/subprogram-reducer";
import {handleSortFunction, SortState} from "../utils/sort";

interface Props {
    programs: Program[],
    addNewSubProgram: (program: Program) => void,
    editSelectedProgram: (program: Program) => void,
    deleteSelectedProgram: (program: Program) => void,
    editSelectedSubProgram: (program: Program, subProgram: SubProgram) => void,
    deleteSelectedSubProgram: (programId: string, subProgramId: string) => void
}

class ListAllPrograms extends Component<Props, SortState> {

    constructor(props) {
        super(props);
        this.state = {
            column: null,
            data: this.props.programs.map((program) => program.incentive_sub_programs.map((subProgram) => subProgram.incentive_sub_program_template.vesting_event_templates)),
            direction: "ascending"
        }
    }

    handleSort = clickedColumn => () => {
        this.setState(handleSortFunction(clickedColumn, this.state));
    };

    render() {

        const { programs, addNewSubProgram, editSelectedProgram, editSelectedSubProgram, deleteSelectedProgram, deleteSelectedSubProgram } = this.props;

        return (
            <div className='block-s'>
                {
                    programs.map((program) => {
                        return (
                            <div className='form-greyscale block-m width-limit-medium' key={program.id}>
                                <Card fluid>
                                    <Card.Content>
                                        <Card.Header>
                                            <div className="flex-row space-between align-center" style={{ paddingBottom:'0.5rem', paddingTop:'0.5rem' }}>
                                                <span>{program.name}</span>
                                                <span>{program.capacity}</span>
                                                <span>{`${moment(program.startDate).format("DD.MM.YY")}`} - {`${moment(program.endDate).format( "DD.MM.YY")}`}</span>
                                            </div>
                                        </Card.Header>
                                    </Card.Content>
                                </Card>
                                {
                                    program.incentive_sub_programs.map((subProgram) => {
                                        return (
                                            <Card fluid key={subProgram.id}>
                                                <div className='form-white'>
                                                    <Card.Content extra>
                                                        <h3 className="text-center">{subProgram.name}</h3>
                                                        <div className='row-center space-between align-center block-xs'>
                                                            <span><strong>Performance: &nbsp;</strong>{`${subProgram.performance}`}</span>
                                                            <span><strong>Settlement: &nbsp;</strong>{`${subProgram.settlementTypeId}`}</span>
                                                            <span><strong>Instrument: &nbsp;</strong>{`${subProgram.instrumentTypeId}`}</span>
                                                        </div>
                                                    </Card.Content>
                                                    <div className='block-s'>
                                                        <Card.Content extra className='block-xs'>
                                                            <Table sortable celled padded>
                                                                <Table.Header>
                                                                    <Table.Row>
                                                                        <Table.HeaderCell onClick={this.handleSort("grant_date")}>Grant Date</Table.HeaderCell>
                                                                        <Table.HeaderCell onClick={this.handleSort("vestedDate")}>Vested Date</Table.HeaderCell>
                                                                        <Table.HeaderCell onClick={this.handleSort("expiry_date")}>Expiry Date</Table.HeaderCell>
                                                                        <Table.HeaderCell onClick={this.handleSort("quantity")}>Quantity %</Table.HeaderCell>
                                                                        {
                                                                            subProgram.incentive_sub_program_template.vesting_event_templates.some((vs) => !!vs.purchase_price) && <Table.HeaderCell>Purchase price</Table.HeaderCell>
                                                                        }
                                                                        <Table.HeaderCell>Strike</Table.HeaderCell>
                                                                    </Table.Row>
                                                                </Table.Header>
                                                                <Table.Body>
                                                                    {
                                                                        subProgram.incentive_sub_program_template.vesting_event_templates.map((vesting) => {
                                                                            return (
                                                                                <Table.Row key={vesting.id}>
                                                                                    <Table.Cell>{`${moment(vesting.grant_date).format("DD.MM.YY")}`}</Table.Cell>
                                                                                    <Table.Cell>{`${moment(vesting.vestedDate).format("DD.MM.YY")}`}</Table.Cell>
                                                                                    <Table.Cell>{`${moment(vesting.expiry_date).format("DD.MM.YY")}`}</Table.Cell>
                                                                                    <Table.Cell>{formatPercentage(parseFloat(vesting.quantityPercentage))}</Table.Cell>
                                                                                    {
                                                                                        subProgram.incentive_sub_program_template.vesting_event_templates.some((vs) => !!vs.purchase_price) && <Table.Cell>{vesting.purchase_price}</Table.Cell>
                                                                                    }
                                                                                    <Table.Cell>{vesting.strike.toString().replace('.', ',')}</Table.Cell>
                                                                                </Table.Row>
                                                                            )
                                                                        })
                                                                    }
                                                                </Table.Body>
                                                            </Table>
                                                        </Card.Content>
                                                    </div>
                                                    <div className='text-center'>
                                                        <Card.Content>
                                                            <Button basic onClick={editSelectedSubProgram.bind(this, program, subProgram)}>Edit Subprogram</Button>
                                                            <Button basic onClick={deleteSelectedSubProgram.bind(this, program.id, subProgram.id)}>Delete Subprogram</Button>
                                                        </Card.Content>
                                                    </div>
                                                </div>
                                            </Card>
                                        )
                                    })
                                }
                                <div className='text-center'>
                                    <Card  fluid>
                                        <Card.Content>
                                            <div className='flex-row space-between align-center'>
                                                <Button onClick={editSelectedProgram.bind(this, program)}>Edit Program</Button>
                                                <Button onClick={deleteSelectedProgram.bind(this, program)}>Delete Program</Button>
                                                <Button onClick={addNewSubProgram.bind(this, program)}>
                                                    <i className="plus icon" />
                                                    New Subprogram
                                                </Button>

                                            </div>
                                        </Card.Content>
                                    </Card>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}

export default ListAllPrograms;
