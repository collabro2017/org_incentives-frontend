import React, { Component } from 'react';
import { Program } from "../programs/program-reducer";
import { Table, Card } from 'semantic-ui-react'
import moment, { Moment } from "moment";
import { SubProgram } from "../subprograms/subprogram-reducer";
import ProgramHeader from "./program-header";
import PurchaseConfigPreview from "./purchase/purchase-config-preview";
import AwardsMetaPreview from "./awards-meta-preview";
import {handleSortFunction, SortState} from "../utils/sort";
import { awardsRoute, subprogramAwardsRoute } from "../menu/menu";
import { wasPurchased } from "./list-subprogram-awards";

interface Props {
    programs: Program[],
    openAwardForm: (subProgram: SubProgram) => void,
    deletePurchaseConfig: (id: string) => void,
    isDeletingPurchaseConfig: boolean,
}

class ViewAllAwards extends Component<Props, SortState> {

    constructor(props) {
        super();
        this.state = {
            column: null,
            data: props.programs.map((program) => program.incentive_sub_programs.map((subProgram) => subProgram.incentive_sub_program_template.vesting_event_templates)),
            direction: "ascending"
        }
    }

    handleSort = clickedColumn => () => {
        this.setState(handleSortFunction(clickedColumn, this.state));
    };

    render() {
        const { programs, openAwardForm, deletePurchaseConfig, isDeletingPurchaseConfig } = this.props;
        return (
            <div className='block-m'>
                {
                    programs.map((program) => {
                        return (
                            <div key={program.id} className='form-greyscale block-m'>
                                <ProgramHeader program={program}/>
                                {
                                    program.incentive_sub_programs.map((subProgram) => {
                                        return (
                                            <Card fluid key={subProgram.id}>
                                                <div className='form-white block-s'>
                                                    <Card.Content>
                                                        <h3 className='text-center'>{subProgram.name}</h3>
                                                        <div className='row-center space-between align-center block-s'>
                                                            <span><strong>Performance: &nbsp;</strong>{`${subProgram.performance}`}</span>
                                                            <span><strong>Settlement: &nbsp;</strong>{`${subProgram.settlementTypeId}`}</span>
                                                            <span><strong>Instrument: &nbsp;</strong>{`${subProgram.instrumentTypeId}`}</span>
                                                        </div>
                                                    </Card.Content>
                                                    <div className='block-m'>
                                                        <div>
                                                            <Table celled padded sortable>
                                                                <Table.Header>
                                                                    <Table.Row>
                                                                        <Table.HeaderCell onClick={this.handleSort("grant_date")}>Grant Date</Table.HeaderCell>
                                                                        <Table.HeaderCell onClick={this.handleSort("vestedDate")}>Vested Date</Table.HeaderCell>
                                                                        <Table.HeaderCell onClick={this.handleSort("expiry_date")}>Expiry Date</Table.HeaderCell>
                                                                        <Table.HeaderCell>Quantity %</Table.HeaderCell>
                                                                        <Table.HeaderCell>Strike</Table.HeaderCell>
                                                                        {
                                                                            subProgram.incentive_sub_program_template.vesting_event_templates.some(wasPurchased) && <Table.HeaderCell>Purchase price</Table.HeaderCell>
                                                                        }
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
                                                                                    <Table.Cell>{parseFloat(vesting.quantityPercentage) * 100}</Table.Cell>
                                                                                    <Table.Cell>{vesting.strike.toString().replace('.', ',')}</Table.Cell>
                                                                                    {
                                                                                        subProgram.incentive_sub_program_template.vesting_event_templates.some(wasPurchased) &&
                                                                                        <Table.Cell>
                                                                                            {vesting.purchase_price ? vesting.purchase_price.replace('.', ',') : "N/A"}
                                                                                        </Table.Cell>
                                                                                    }
                                                                                </Table.Row>
                                                                            )
                                                                        })
                                                                    }
                                                                </Table.Body>
                                                            </Table>
                                                        </div>
                                                    </div>
                                                    <Card.Group className="row-center">
                                                        <AwardsMetaPreview numberOfAwards={subProgram.awards.length} viewDetailsLink={subprogramAwardsRoute(subProgram.id)} awardEmployeeOnClick={() => openAwardForm(subProgram)}/>
                                                        <PurchaseConfigPreview
                                                            purchaseConfig={subProgram.purchase_config}
                                                            editLink={`/admin/awards/purchase/${subProgram.id}/edit`}
                                                            createLink={`/admin/awards/purchase/${subProgram.id}`}
                                                            deleteLink={subProgram.purchase_config && deletePurchaseConfig.bind(this, subProgram.purchase_config.id)}
                                                            isDeleting={isDeletingPurchaseConfig}
                                                        />
                                                    </Card.Group>
                                                </div>
                                            </Card>
                                        )
                                    })
                                }
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}

export default ViewAllAwards;