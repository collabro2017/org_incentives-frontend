import React, {Component, SyntheticEvent} from 'react';
import {Dropdown, DropdownItemProps, Button, Form, Checkbox, Modal, Icon, Header} from 'semantic-ui-react';
import moment, {Moment} from 'moment';
import DatePicker from 'react-datepicker';
import {Window, WindowType} from "./window-reducer";
import {changeCommaForPunctuation, changePunctuationForComma, norwegianLongDate} from "../utils/utils";
import SelectEmployeesForm from "./select-employees-form";
import {dividendEffectOptions} from "../admin/dividend/create/dividend-create-form";
import {OrderExerciseType} from "../exercise/exercise-router";

interface Props {
    editWindow: (window: Window) => void,
    postWindow: (window: Window) => void,
    closeForm: () => void,
    selectedWindow: Window
}

const windowTypeOptions: DropdownItemProps[] = [
    {
        key: WindowType.EXERCISE.toString(),
        value: WindowType.EXERCISE.toString(),
        text: WindowType.EXERCISE.toString(),
    },
    {
        key: WindowType.PURCHASE.toString(),
        value: WindowType.PURCHASE.toString(),
        text: WindowType.PURCHASE.toString(),
    }
];

interface State {
    selectDate: boolean,
    start_time: string,
    end_time: string,
    payment_deadline: string,
    window_type: WindowType,
    exercise_and_hold: boolean,
    exercise_and_sell: boolean,
    exercise_and_sell_to_cover: boolean,
    restricted: boolean,
    restricted_employees: string[]
    selectEmployeesModalOpen: boolean,
    require_share_depository: boolean,
    require_bank_account: boolean,
    commission_percentage: string,
}

export interface EmployeeSelection {
    employee_id: string,
    selected: boolean,
}

class WindowForm extends Component<Props, State> {

    state = {
        selectDate: false,
        start_time: this.props.selectedWindow ? moment(this.props.selectedWindow.start_time).format("DD.MM.YY HH:mm") : moment().format("DD.MM.YY HH:mm"),
        end_time: this.props.selectedWindow ? moment(this.props.selectedWindow.end_time).format("DD.MM.YY HH:mm") : moment().format("DD.MM.YY HH:mm"),
        payment_deadline: this.props.selectedWindow ? moment(this.props.selectedWindow.payment_deadline).format("DD.MM.YY HH:mm") : moment().format("DD.MM.YY HH:mm"),
        window_type: this.props.selectedWindow ? this.props.selectedWindow.window_type : WindowType.EXERCISE,
        restricted: this.props.selectedWindow ? this.props.selectedWindow.restricted_employees.length > 0 : false,
        restricted_employees: this.props.selectedWindow ? this.props.selectedWindow.restricted_employees : [],
        selectEmployeesModalOpen: false,
        exercise_and_hold: this.props.selectedWindow ? this.props.selectedWindow.allowed_exercise_types.includes(OrderExerciseType.EXERCISE_AND_HOLD) : true,
        exercise_and_sell: this.props.selectedWindow ? this.props.selectedWindow.allowed_exercise_types.includes(OrderExerciseType.EXERCISE_AND_SELL) : true,
        exercise_and_sell_to_cover: this.props.selectedWindow ? this.props.selectedWindow.allowed_exercise_types.includes(OrderExerciseType.EXERCISE_AND_SELL_TO_COVER) : true,
        require_share_depository: this.props.selectedWindow ? this.props.selectedWindow.require_share_depository : true,
        require_bank_account: this.props.selectedWindow ? this.props.selectedWindow.require_bank_account : true,
        commission_percentage: this.props.selectedWindow ? (this.props.selectedWindow.commission_percentage ? changePunctuationForComma(this.props.selectedWindow.commission_percentage.toString()) : '' ) : "1,7",
    };

    render() {
        const {
            start_time, end_time, payment_deadline, window_type, restricted, selectEmployeesModalOpen,
            exercise_and_hold, exercise_and_sell, exercise_and_sell_to_cover, require_share_depository,
            require_bank_account, commission_percentage
        } = this.state;
        return (
            <div className="form-greyscale">
                <Form size={"large"}>
                    <Form.Field width={5}>
                        <label>Window Type</label>
                        <Dropdown placeholder='Select window type' fluid selection
                                  options={windowTypeOptions}
                                  value={window_type} onChange={this.handleWindowTypeSelect}>
                        </Dropdown>
                    </Form.Field>
                    {
                        window_type === WindowType.EXERCISE &&
                            <div className="block-m">
                                <div className="block-s">
                                    <Form.Group inline>
                                        <Form.Field width={7}>
                                            <Checkbox label='Hold' checked={exercise_and_hold} name={'exercise_and_hold'}
                                                      onChange={this.handleToggleChange}/>
                                        </Form.Field>
                                        <Form.Field width={7}>
                                            <Checkbox label='Sell' checked={exercise_and_sell} name={'exercise_and_sell'}
                                                      onChange={this.handleToggleChange}/>
                                        </Form.Field>
                                        <Form.Field width={7}>
                                            <Checkbox label='Sell to cover' checked={exercise_and_sell_to_cover} name={'exercise_and_sell_to_cover'}
                                                      onChange={this.handleToggleChange}/>
                                        </Form.Field>
                                    </Form.Group>
                                </div>
                                <Form.Field width={7}>
                                    <label>Commission Percentage</label>
                                    <Form.Input
                                        placeholder={'E.g 1,7'}
                                        value={commission_percentage}
                                        name="commission_percentage"
                                        onChange={this.handleInputChange.bind(this, 'commission_percentage')}/>
                                </Form.Field>
                            </div>

                    }
                    <div className={"block-m"}>
                        <Form.Field width={7}>
                            <Checkbox label='Require Bank Account Input' checked={require_bank_account} name={'require_bank_account'}
                                      onChange={this.handleToggleChange}/>
                        </Form.Field>
                        <Form.Field width={7}>
                            <Checkbox label='Require Share Depository Input' checked={require_share_depository} name={'require_share_depository'}
                                      onChange={this.handleToggleChange}/>
                        </Form.Field>
                    </div>
                    <div className="block-m">
                        <Form.Field width={7}>
                            <label>Start Time (dd.mm.yy hh:mm)</label>
                            <Form.Input
                                placeholder={'Start time (dd.mm.yy hh:mm)'}
                                value={start_time}
                                name="start_time"
                                onChange={this.handleInputChange.bind(this, 'start_time')}/>
                            <span>{moment(start_time, norwegianLongDate).format('lll')}</span>
                        </Form.Field>
                    </div>
                    <div className="block-m">
                        <Form.Field width={7}>
                            <label>End time (dd.mm.yy hh:mm)</label>
                            <Form.Input
                                placeholder={'End time (dd.mm.yy hh:mm)'}
                                value={end_time}
                                name="end_time"
                                onChange={this.handleInputChange.bind(this, 'end_time')}/>
                            <span>{moment(end_time, norwegianLongDate).format('lll')}</span>
                        </Form.Field>
                    </div>
                    <div className="block-l">
                        <Form.Field width={7}>
                            <label>Payment Deadline (dd.mm.yy hh:mm)</label>
                            <Form.Input
                                placeholder={'Payment Deadline (dd.mm.yy hh:mm)'}
                                value={payment_deadline}
                                name="payment_deadline"
                                onChange={this.handleInputChange.bind(this, 'payment_deadline')}/>
                            <span>{moment(payment_deadline, norwegianLongDate).format('lll')}</span>
                        </Form.Field>
                    </div>
                    <div>
                        <div className={"block-m"}>
                            <Form.Field width={7}>
                                <Checkbox label='Restricted window' checked={restricted} name={'restricted'}
                                          onChange={this.handleToggleChange}/>
                            </Form.Field>
                        </div>
                        {
                            restricted &&
                                <div className={"block-m"}>
                                    <p>{this.state.restricted_employees.length} employees selected for this window</p>
                                    <Button onClick={() => this.setState({ selectEmployeesModalOpen: true })}>View / Edit Employees</Button>
                                    {
                                        selectEmployeesModalOpen && <SelectEmployeesForm closeModal={this.closeModal} confirmSelection={this.confirmEmployeeSelection} selectedEmployees={this.state.restricted_employees}/>
                                    }
                                </div>
                        }
                    </div>
                    <div className="text-center">
                        <Button.Group>
                            <Button type='button' onClick={this.props.closeForm}>Cancel</Button>
                            <Button.Or/>
                            <Button positive type='button' onClick={this.addWindow}>Save Window</Button>
                        </Button.Group>
                    </div>
                </Form>
                <div>

                </div>
            </div>
        )
    }

    private handleInputChange = (key, event, {value}) => {
        this.setState({[key]: value})
    };

    private handleWindowTypeSelect = (event, {value}) => {
        this.setState({window_type: value});
    };

    private handleToggleChange = (event, { name, value }) => {
        this.setState({ [name]: !this.state[name] })
    };

    private closeModal = () => {
        this.setState({ selectEmployeesModalOpen: false })
    };

    private confirmEmployeeSelection = (selectedEmployeeIds: string[]) => {
        this.setState({ selectEmployeesModalOpen: false, restricted_employees: selectedEmployeeIds })
    };

    // private onModalClose = (event: SyntheticEvent<any>) => {
    //     event.preventDefault();
    //     this.props.history.push(this.props.match.path)
    // }

    private addWindow = () => {
        const window: Window = {
            start_time: moment(this.state.start_time, norwegianLongDate),
            end_time: moment(this.state.end_time, norwegianLongDate),
            payment_deadline: moment(this.state.payment_deadline, norwegianLongDate),
            window_type: WindowType[this.state.window_type],
            restricted_employees: this.state.restricted ? this.state.restricted_employees : null,
            allowed_exercise_types: this.allowedExerciseTypes(),
            require_bank_account: this.state.require_bank_account,
            require_share_depository: this.state.require_share_depository,
        };

        console.log(window);
        const commission = window.window_type === WindowType.EXERCISE ? { commission_percentage: parseFloat(changeCommaForPunctuation(this.state.commission_percentage)) } : {};
        console.log(commission);
        this.props.selectedWindow ? this.props.editWindow({ ...window, ...commission }) : this.props.postWindow({ ...window, ...commission });
    }

    private allowedExerciseTypes = () => {
        let allowed_exercise_types = [];
        if (this.state.exercise_and_hold) {
            allowed_exercise_types.push(OrderExerciseType.EXERCISE_AND_HOLD)
        }
        if (this.state.exercise_and_sell) {
            allowed_exercise_types.push(OrderExerciseType.EXERCISE_AND_SELL)
        }
        if (this.state.exercise_and_sell_to_cover) {
            allowed_exercise_types.push(OrderExerciseType.EXERCISE_AND_SELL_TO_COVER)
        }
        return allowed_exercise_types;
    }
}

export default WindowForm