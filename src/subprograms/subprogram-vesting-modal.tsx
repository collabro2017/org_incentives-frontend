import React, { Component } from 'react';
import { Button, Form, Table, Checkbox } from 'semantic-ui-react';
import moment, {Moment} from 'moment';
import DatePicker from 'react-datepicker';
import { VestingEventTemplate } from "./subprogram-reducer";
import { formatPercentage } from "../utils/utils";


interface Props {
    vestingEvents: VestingEventTemplate[],
    saveVesting: (vesting_event_templates: VestingEventTemplate[]) => void
}

interface State {
    newVestingSchedule: any[],
    grantDate: Moment,
    vestedDate: Moment,
    expiryDate: Moment,
    strike: string,
    quantityPercentage: string,
    purchased: boolean,
    purchase_price: string,
}

class SubprogramVestingModal extends Component<Props, State> {

    state = {
        newVestingSchedule: this.props.vestingEvents ? this.props.vestingEvents : [],
        grantDate: moment(),
        vestedDate: moment().add(1,'year'),
        expiryDate: moment().add(3,'year'),
        strike: "0",
        quantityPercentage: "0",
        purchased: false,
        purchase_price: "0",
    };

    render() {

        console.log(this.props.vestingEvents);

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
                                <label>Quantity %</label>
                                <Form.Input name={'quantityPercentage'} width={9} input="number" value={this.state.quantityPercentage} onChange={this.inputChange} placeholder={'Quantity %'} />
                            </Form.Field>
                            <Form.Field>
                                <Checkbox label='Was purchased' checked={this.state.purchased} name={'purchased'} onChange={this.handleToggleChange}/>
                            </Form.Field>
                            {
                                this.state.purchased &&
                                <Form.Field>
                                    <label>Purchase price</label>
                                    <Form.Input name={'purchase_price'} width={9} value={this.state.purchase_price} onChange={this.inputChange} placeholder={'Purchase price'}/>
                                </Form.Field>
                            }
                        </div>
                        <div className='block-s text-center'>
                            <Button onClick={this.addVesting}>Add Vesting</Button>
                        </div>
                        {
                            this.state.newVestingSchedule.length > 0 &&
                            <div className={'form-white text-center'}>
                                <Table>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Grant Date</Table.HeaderCell>
                                            <Table.HeaderCell>Vested Date</Table.HeaderCell>
                                            <Table.HeaderCell>Expiry Date</Table.HeaderCell>
                                            <Table.HeaderCell>Strike</Table.HeaderCell>
                                            <Table.HeaderCell>Quantity %</Table.HeaderCell>
                                            {
                                                this.state.newVestingSchedule.some((vs) => !!vs.purchase_price) && <Table.HeaderCell>Purchase price</Table.HeaderCell>
                                            }
                                            <Table.HeaderCell>Actions</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {
                                            this.state.newVestingSchedule.map((vesting, index) => {
                                                console.log(vesting);
                                                return (
                                                    <Table.Row key={index}>
                                                        <Table.Cell>{`${moment(vesting.grant_date).format("DD.MM.YY")}`}</Table.Cell>
                                                        <Table.Cell>{`${moment(vesting.vestedDate).format("DD.MM.YY")}`}</Table.Cell>
                                                        <Table.Cell>{`${moment(vesting.expiry_date).format("DD.MM.YY")}`}</Table.Cell>
                                                        <Table.Cell>{vesting.strike.replace('.', ',')}</Table.Cell>
                                                        <Table.Cell>{formatPercentage(vesting.quantityPercentage)}</Table.Cell>
                                                        {
                                                            this.state.newVestingSchedule.some((vs) => !!vs.purchase_price) && <Table.Cell>{vesting.purchase_price}</Table.Cell>
                                                        }
                                                        <Table.Cell><Button basic type='submit' onClick={this.removeVesting.bind(this, vesting)}>Remove Vesting</Button></Table.Cell>
                                                    </Table.Row>
                                                )
                                            })
                                        }
                                    </Table.Body>
                                </Table>
                                <div className='text-center'>
                                    <Button positive onClick={this.saveVesting}>Save</Button>
                                </div>
                            </div>
                        }
                    </Form>
                </div>
            </div>
        )
    }

    private inputChange = (event, { name, value }) => {
        this.setState({
            [name]: value
        });
    };

    private handleDateChange = (key, date) => {
        this.setState({
            [key]: date
        });
    };

    private addVesting = () => {

        const quantityPercentage = parseFloat(this.state.quantityPercentage) / 100;

        const data = {
            grant_date: this.state.grantDate,
            vestedDate: this.state.vestedDate,
            expiry_date: this.state.expiryDate,
            strike: parseFloat(this.state.strike.replace(',', '.')).toString(),
            quantityPercentage: quantityPercentage.toString(),
            purchase_price: this.state.purchased && parseFloat(this.state.purchase_price.replace(',', '.')).toString(),
        };

        console.log(data);

        this.setState({
            newVestingSchedule: [...this.state.newVestingSchedule, data],
            vestedDate: moment(this.state.vestedDate).add(1, 'year'),
            strike: "0",
            quantityPercentage: "0",
            purchased: this.state.purchased,
            purchase_price: this.state.purchase_price,
        });
    };

    private removeVesting = (vesting) => {
        const vestingItem = this.state.newVestingSchedule.filter((item) => {
            return vesting !== item;
        });

        this.setState({
            newVestingSchedule: [...vestingItem]
        });
    };

    private saveVesting = () => {
        this.props.saveVesting(this.state.newVestingSchedule);
    };

    private handleToggleChange = () => {
        this.setState({ purchased: !this.state.purchased })
    };
}

export default SubprogramVestingModal;