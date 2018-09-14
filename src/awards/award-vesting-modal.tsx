import React, { Component } from 'react';
import { Button, Form, Table, Checkbox } from 'semantic-ui-react';
import moment, { Moment } from 'moment';
import DatePicker from 'react-datepicker';
import { VestingEvent } from "./award-reducer";
import { norwegianShortDate, yesOrNo } from '../utils/utils';


interface Props {
    vesting_events: VestingEvent[]
    saveVesting: (vesting_events: VestingEvent[]) => void
}

interface State {
    newVestingSchedule: VestingEvent[],
    grantDate: Moment,
    vestedDate: Moment,
    expiryDate: Moment,
    strike: string,
    purchased: boolean,
    purchase_price: string,
    quantity: number,
    is_dividend: boolean,
}

class AwardVestingModal extends Component<Props, State> {

    state = {
        newVestingSchedule: this.props.vesting_events,
        grantDate: this.props.vesting_events.length > 0 ? moment(this.props.vesting_events[0].grant_date) : moment(),
        vestedDate: this.props.vesting_events.length > 0 ? moment(this.props.vesting_events[0].vestedDate) : moment(),
        expiryDate: this.props.vesting_events.length > 0 ? moment(this.props.vesting_events[0].expiry_date) : moment(),
        purchased: false,
        purchase_price: "0",
        strike: "0",
        quantity: 0,
        is_dividend: false,
    };

    render() {
        return (
            <div className='form-greyscale'>
                <div className='block-s'>
                    <h2>Vesting</h2>
                </div>
                <div>
                    <Form size={'large'} as={'form'}>
                        <div className='block-m'>
                            <Form.Field>
                                <label>Grant Date</label>
                                <DatePicker placeholderText="DD.MM.YY"
                                            dateFormat='DD.MM.YY'
                                            className='vestingDatePickerInput'
                                            selected={this.state.grantDate}
                                            onChange={this.handleDateChange.bind(this, 'grantDate')}/>
                            </Form.Field>
                            <Form.Field>
                                <label>Vested Date</label>
                                <DatePicker placeholderText="DD.MM.YY"
                                            dateFormat='DD.MM.YY'
                                            className='vestingDatePickerInput'
                                            selected={this.state.vestedDate}
                                            onChange={this.handleDateChange.bind(this, 'vestedDate')}/>
                            </Form.Field>
                            <Form.Field>
                                <label>Expiry Date</label>
                                <DatePicker placeholderText="DD.MM.YY"
                                            dateFormat='DD.MM.YY'
                                            className='vestingDatePickerInput'
                                            selected={this.state.expiryDate}
                                            onChange={this.handleDateChange.bind(this, 'expiryDate')}/>
                            </Form.Field>
                            <Form.Field>
                                <label>Strike</label>
                                <Form.Input name={'strike'} width={9} value={this.state.strike} onChange={this.inputChange} placeholder={'Strike'}/>
                            </Form.Field>
                            <Form.Field>
                                <label>Quantity</label>
                                <Form.Input name={'quantity'} width={9} value={this.state.quantity} onChange={this.inputChange} placeholder={'Quantity'}/>
                            </Form.Field>
                            <Form.Field>
                                <Checkbox label='Is dividend' checked={this.state.is_dividend} name={'is_dividend'} onChange={this.handleToggleChange.bind(this, "is_dividend")}/>
                            </Form.Field>
                            <Form.Field>
                                <Checkbox label='Was purchased' checked={this.state.purchased} name={'purchased'} onChange={this.handleToggleChange.bind(this, "purchased")}/>
                            </Form.Field>
                            {
                                this.state.purchased &&
                                <Form.Field>
                                    <label>Purchase price</label>
                                    <Form.Input name={'purchase_price'} width={9} value={this.state.purchase_price} onChange={this.inputChange} placeholder={'Purchase price'}/>
                                </Form.Field>
                            }
                            <div className='block-m text-center'>
                                <Button basic onClick={this.addVesting}>Add Vesting</Button>
                            </div>
                            {
                                this.state.newVestingSchedule.length > 0 &&
                                <div className={'form-white text-center'}>
                                    <Table celled>
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.HeaderCell>Grant Date</Table.HeaderCell>
                                                <Table.HeaderCell>Vested Date</Table.HeaderCell>
                                                <Table.HeaderCell>Strike</Table.HeaderCell>
                                                <Table.HeaderCell>Expiry Date</Table.HeaderCell>
                                                <Table.HeaderCell>Quantity</Table.HeaderCell>
                                                {
                                                    this.state.newVestingSchedule.some((vs) => !!vs.purchase_price) && <Table.HeaderCell>Purchase price</Table.HeaderCell>
                                                }
                                                {
                                                    this.state.newVestingSchedule.some((vs) => vs.is_dividend) && <Table.HeaderCell>Is dividend</Table.HeaderCell>
                                                }
                                                <Table.HeaderCell>Actions</Table.HeaderCell>
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                            {
                                                this.state.newVestingSchedule.map((vesting, index) => {
                                                    return (
                                                        <Table.Row key={index}>
                                                            <Table.Cell>{`${moment(vesting.grant_date).format("DD.MM.YY")}`}</Table.Cell>
                                                            <Table.Cell>{`${moment(vesting.vestedDate).format("DD.MM.YY")}`}</Table.Cell>
                                                            <Table.Cell>{vesting.strike.replace('.', ',')}</Table.Cell>
                                                            <Table.Cell>{`${moment(vesting.expiry_date).format("DD.MM.YY")}`}</Table.Cell>
                                                            <Table.Cell>{vesting.quantity}</Table.Cell>
                                                            {
                                                                this.state.newVestingSchedule.some((vs) => !!vs.purchase_price) && <Table.Cell>{vesting.purchase_price}</Table.Cell>
                                                            }
                                                            {
                                                                this.state.newVestingSchedule.some((vs) => vs.is_dividend) && <Table.Cell>{yesOrNo(vesting.is_dividend)}</Table.Cell>
                                                            }
                                                            <Table.Cell><Button basic type='submit' onClick={this.removeVesting.bind(this, vesting)}>Remove Vesting</Button></Table.Cell>
                                                        </Table.Row>
                                                    )
                                                })
                                            }
                                        </Table.Body>
                                    </Table>
                                    <div className='text-center'>
                                        <Button positive onClick={this.saveAwardVesting}>Save</Button>
                                    </div>
                                </div>
                            }
                        </div>
                    </Form>
                </div>
            </div>
        )
    }

    private inputChange = (event, { name, value }) => {
        this.setState({ [name]: value });
    };

    private handleDateChange = (key, date) => {
        this.setState({ [key]: date });
    };

    private handleToggleChange = (key) => {
        this.setState({ [key]: !this.state[key] })
    };

    private addVesting = () => {
        const vestingEvent = {
            grant_date: this.state.grantDate,
            vestedDate: this.state.vestedDate,
            expiry_date: this.state.expiryDate,
            strike: parseFloat(this.state.strike.replace(',', '.')).toString(),
            quantity: this.state.quantity,
            purchase_price: this.state.purchased && parseFloat(this.state.purchase_price.replace(',', '.')).toString(),
            is_dividend: this.state.is_dividend,
        };

        this.setState({
            newVestingSchedule: [...this.state.newVestingSchedule, vestingEvent],
            grantDate: moment(this.state.grantDate, norwegianShortDate),
            vestedDate: moment(this.state.vestedDate, norwegianShortDate).add(1, 'year'),
            expiryDate: moment(this.state.expiryDate, norwegianShortDate),
            strike: this.state.strike,
            quantity: 0,
            purchased: this.state.purchased,
            purchase_price: this.state.purchase_price,
            is_dividend: false,
        });
    };

    private removeVesting = (vesting) => {
        const vestingItem = this.state.newVestingSchedule.filter((item) => vesting !== item);
        this.setState({ newVestingSchedule: [...vestingItem] });
    };

    private saveAwardVesting = () => {
        this.props.saveVesting(this.state.newVestingSchedule);
    };
}

export default AwardVestingModal;