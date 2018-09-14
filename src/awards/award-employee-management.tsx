import React, { Component } from 'react';
import { Button, Form, Dropdown, DropdownItemProps, Modal, Table } from 'semantic-ui-react';
import {Award, VestingEvent, VestingEventApi} from "./award-reducer";
import moment, { Moment } from "moment";
import numeral from "numeral";
import AwardVestingModal from "./award-vesting-modal";
import { SubProgram, VestingEventTemplate } from "../subprograms/subprogram-reducer";
import { norwegianShortDate, yesOrNo } from "../utils/utils";
import { wasPurchased } from "./list-subprogram-awards";

interface Props {
    closeForm: () => void
    employeeOptions: DropdownItemProps[]
    postAward: (award: Award) => void
    subProgram: SubProgram
    selectedAward?: Award
}

interface State {
    modalOpen: boolean,
    employee: string,
    quantity: number,
    vesting_events: VestingEventInput[],
}

const templateToVestingEventInput = (template: VestingEventTemplate): VestingEventInput => ({
    grant_date: moment(template.grant_date).format(norwegianShortDate),
    vestedDate: moment(template.vestedDate).format(norwegianShortDate),
    expiry_date: moment(template.expiry_date).format(norwegianShortDate),
    quantity: 0,
    strike: template.strike,
    purchase_price: template.purchase_price,
    is_dividend: template.is_dividend,
});

const vestingEventToVestingEventInput = (vesting: VestingEvent): VestingEventInput => ({
    grant_date: vesting.grant_date.format(norwegianShortDate),
    vestedDate: vesting.vestedDate.format(norwegianShortDate),
    expiry_date: vesting.expiry_date.format(norwegianShortDate),
    quantity: 0,
    strike: vesting.strike,
    purchase_price: vesting.purchase_price,
    is_dividend: vesting.is_dividend,
});

const toVestingEvent = (vesting: VestingEventInput): VestingEvent => ({
    grant_date: moment(vesting.grant_date, norwegianShortDate),
    vestedDate: moment(vesting.vestedDate, norwegianShortDate),
    expiry_date: moment(vesting.expiry_date, norwegianShortDate),
    quantity: 0,
    strike: vesting.strike,
    purchase_price: vesting.purchase_price,
    is_dividend: vesting.is_dividend,
});

export interface VestingEventInput {
    id?: string,
    quantity: number,
    strike: string,
    vestedDate: string,
    grant_date: string,
    expiry_date: string,
    purchase_price?: string,
    is_dividend: boolean,
}



class  AwardEmployeeManagement extends Component<Props, State> {

    state = {
        modalOpen: false,
        employee: this.props.selectedAward ? this.props.selectedAward.employee_id : '',
        quantity: this.props.selectedAward ? this.props.selectedAward.quantity : 0,
        vesting_events: this.props.selectedAward ? this.props.selectedAward.vesting_events.map(vestingEventToVestingEventInput) : this.props.subProgram.incentive_sub_program_template.vesting_event_templates.map(templateToVestingEventInput)
    };

    render() {
        return (
            <div className='form-greyscale'>
                <div className='block-s'>
                    <h2>{this.props.subProgram.name}</h2>
                </div>
                <div>
                    <Form size={"large"} as={'form'}>
                        <div className='block-m'>
                            <Form.Field width={9}>
                                <label>Employee to grant awards to</label>
                                <Dropdown placeholder='Search employees...' fluid search selection
                                          options={this.props.employeeOptions}
                                          value={this.state.employee}
                                          onChange={this.handleSelectEmployee}/>
                            </Form.Field>
                            <Form.Field width={9}>
                                <Form.Input
                                            placeholder={'Quantity'}
                                            value={this.state.quantity}
                                            onChange={this.onChange} label='Quantity'/>
                            </Form.Field>
                            <div className="block-m">
                                <div className='form-white text-center'>
                                    <div className='flex-row space-between align-center'>
                                        <h3 className={"text-center program-title"}>Vesting</h3>
                                        <Button type='button' onClick={this.openAwardVestingModal}>Change vesting schedule</Button>
                                    </div>
                                    <Table celled>
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.HeaderCell>Grant Date</Table.HeaderCell>
                                                <Table.HeaderCell>Vested Date</Table.HeaderCell>
                                                <Table.HeaderCell>Expiry Date</Table.HeaderCell>
                                                <Table.HeaderCell>Strike</Table.HeaderCell>
                                                {
                                                    this.state.vesting_events.some(wasPurchased) && <Table.HeaderCell>Purchase price</Table.HeaderCell>
                                                }
                                                {
                                                    this.state.vesting_events.some((ve) => !!ve.is_dividend) && <Table.HeaderCell>Is dividend?</Table.HeaderCell>
                                                }
                                                <Table.HeaderCell>Quantity</Table.HeaderCell>
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                            {
                                                this.state.vesting_events.map(this.renderVestingRow)
                                            }
                                        </Table.Body>
                                    </Table>
                                </div>
                            </div>
                        </div>
                        <Modal open={this.state.modalOpen}>
                            <i className="close icon" onClick={() => this.setState({ modalOpen: false })}/>
                            <AwardVestingModal saveVesting={this.saveAwardVesting} vesting_events={this.state.vesting_events.map(toVestingEvent)} />
                        </Modal>
                        <div className="text-center">
                            <Button.Group>
                                <Button type='button' onClick={this.props.closeForm}>Cancel</Button>
                                <Button.Or/>
                                <Button positive type='button' onClick={this.onClick}>Save Award</Button>
                            </Button.Group>
                        </div>
                    </Form>
                </div>
            </div>
        )
    }

    private renderVestingRow = (vesting: VestingEventInput, index) => {
        return (
            <Table.Row key={index}>
                <Table.Cell>
                    <Form.Field>
                        <Form.Input width={10} name={'grant_date'} placeholder={norwegianShortDate}
                               onChange={this.handleInputChange.bind(this, index)}
                               value={vesting.grant_date}/>
                    </Form.Field>
                </Table.Cell>
                <Table.Cell>
                    <Form.Input width={10} name={'vestedDate'} placeholder={norwegianShortDate}
                                onChange={this.handleInputChange.bind(this, index)}
                                value={vesting.vestedDate}/>
                </Table.Cell>
                <Table.Cell>
                    <Form.Input width={10} name={'expiry_date'} placeholder={norwegianShortDate}
                                onChange={this.handleInputChange.bind(this, index)}
                                value={vesting.expiry_date}/>
                </Table.Cell>
                <Table.Cell>
                    <Form.Input width={10} name={'strike'}
                                onChange={this.handleInputChange.bind(this, index)}
                                value={vesting.strike.replace('.', ',')}/>
                </Table.Cell>
                {
                    this.state.vesting_events.some(wasPurchased) &&
                    <Table.Cell>
                        <Form.Input width={10} name={'purchase_price'}
                                    value={vesting.purchase_price ? vesting.purchase_price.replace('.', ',') : "N/A"}
                                    disabled={!vesting.purchase_price}
                                    onChange={this.handleInputChange.bind(this, index)}/>
                    </Table.Cell>
                }
                {
                    this.state.vesting_events.some((ve) => ve.is_dividend) &&
                    <Table.Cell>
                        {yesOrNo(vesting.is_dividend)}
                    </Table.Cell>
                }
                <Table.Cell>
                    <Form.Input width={10} name={'quantity'}
                                value={numeral(vesting.quantity).format('0,0')}
                                onChange={this.handleInputChange.bind(this, index)}/>
                </Table.Cell>
            </Table.Row>
        )
    };

    private onChange = (event, { value }) => {
        const vesting_event_templates = this.props.subProgram.incentive_sub_program_template.vesting_event_templates;
        const updatedVestingEvents = this.state.vesting_events.map((vesting, index) => ({ ...vesting, ...{ quantity: parseInt(value) * parseFloat(vesting_event_templates[index].quantityPercentage) }}));

        this.setState({ quantity: value, vesting_events: updatedVestingEvents });
    };

    private handleSelectEmployee = (event, { value }) => {
        this.setState({ employee: value });
    };

    private handleInputChange = (index, event, { name, value }) => {
        const vesting_events = this.state.vesting_events.map((ve, i) => index === i ? { ...ve, [name]: value } : ve);

        this.setState({ vesting_events });
    };

    private openAwardVestingModal = () => {
        this.setState({ modalOpen: true });
    };

    private saveAwardVesting = (vesting_events: VestingEvent[]) => {
        this.setState({
            vesting_events: vesting_events.map(vestingEventToVestingEventInput),
            modalOpen: false
        });
    };

    private onClick = () => {

        const award: Award = {
            incentive_sub_program_id: this.props.subProgram.id,
            quantity: this.state.quantity,
            employee_id: this.state.employee,
            vesting_events: this.state.vesting_events.map((ve) => ({
                quantity: ve.quantity,
                vestedDate: moment(ve.vestedDate, norwegianShortDate),
                grant_date: moment(ve.grant_date, norwegianShortDate),
                expiry_date: moment(ve.expiry_date, norwegianShortDate),
                purchase_price: ve.purchase_price,
                strike: ve.strike,
                is_dividend: ve.is_dividend,
            }))
        };

        this.props.postAward(award)

    }
}

export default AwardEmployeeManagement;