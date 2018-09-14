import React, { Component } from 'react';
import { Button, Form, Dropdown, DropdownItemProps, Checkbox } from 'semantic-ui-react';
import { countryOptions } from "../data/common";
import {Employee, MobilityEntry} from "./employee-reducer";
import {
    apiShortDate,
    changeCommaForPunctuation,
    changePunctuationForComma,
    norwegianLongDate,
    norwegianShortDateLongYear
} from "../utils/utils";
import moment from "moment";

interface Props {
    entityOptions: DropdownItemProps[],
    saveEmployee: (employee: Employee) => void,
    onCloseForm: () => void,
    selectedEmployee: Employee
}

interface MobilityEntryInput {
    key: string,
    from_date: string,
    to_date: string,
    override_entity_soc_sec: string,
    should_override_soc_sec: boolean,
    entity_id: string,
}

interface State {
    firstName: string,
    lastName: string,
    email: string,
    residence: string,
    entity_id: string,
    soc_sec: string,
    internal_identification: string,
    insider: boolean,
    mobility_entries: MobilityEntryInput[],
}

class EmployeeForm extends Component<Props, State>  {

    state = {
        firstName: this.props.selectedEmployee ? this.props.selectedEmployee.firstName : '',
        lastName: this.props.selectedEmployee ? this.props.selectedEmployee.lastName : '',
        email: this.props.selectedEmployee ? this.props.selectedEmployee.email : '',
        residence: this.props.selectedEmployee ? this.props.selectedEmployee.residence : '',
        entity_id: this.props.selectedEmployee ? this.props.selectedEmployee.entity_id : '',
        soc_sec: this.props.selectedEmployee ? this.props.selectedEmployee.soc_sec : '',
        internal_identification: this.props.selectedEmployee ? this.props.selectedEmployee.internal_identification : '',
        insider: this.props.selectedEmployee ? this.props.selectedEmployee.insider : false,
        mobility_entries: this.props.selectedEmployee ? this.props.selectedEmployee.mobility_entries.map(toMobilityEntryInput) : [],
    };

    render() {

        console.log(this.props.selectedEmployee);

        return (
            <div className="form-greyscale width-limit width-limit-medium">
                <Form size={"large"}>
                    <Form.Field width={9}>
                        <label>First Name</label>
                        <input placeholder='First Name' value={this.state.firstName}
                               onChange={this.handleChange.bind(this, 'firstName')} />

                    </Form.Field>
                    <Form.Field width={9}>
                        <label>Last Name</label>
                        <input placeholder='Last Name' value={this.state.lastName}
                               onChange={this.handleChange.bind(this, 'lastName')} />
                    </Form.Field>
                    <Form.Field width={9}>
                        <label>Company Email (will be used for login)</label>
                        <input placeholder='Email' value={this.state.email}
                               onChange={this.handleChange.bind(this, 'email')} />
                    </Form.Field>
                    <Form.Field width={9}>
                        <label>Internal Id</label>
                        <input placeholder='Internal id' value={this.state.internal_identification}
                               onChange={this.handleChange.bind(this, 'internal_identification')} />
                    </Form.Field>
                    <Form.Field width={9}>
                        <label>Residence</label>
                        <Dropdown placeholder='Search countries...' fluid search selection
                                  options={countryOptions}
                                  value={this.state.residence} onChange={this.handleCountrySelect}>
                        </Dropdown>
                    </Form.Field>
                    <div className="block-m">
                        <Form.Field>
                            <div className="block-m">
                                <Form.Field inline width={9}>
                                    <Checkbox label='Insider' checked={this.state.insider}
                                              onChange={this.handleToggleChange}/>
                                </Form.Field>
                            </div>
                        </Form.Field>
                    </div>
                    <div className="block-xl">
                        <h3>Mobility</h3>
                        {
                            this.state.mobility_entries.length === 0 ?
                            <div>
                                <Form.Field width={9}>
                                    <label>Which entity does the employee belong to?</label>
                                    <div className="relative">
                                        <Dropdown placeholder='Search entities...' fluid search selection
                                                  options={this.props.entityOptions}
                                                  value={this.state.entity_id} onChange={this.handleEntitySelect}>
                                        </Dropdown>
                                    </div>
                                </Form.Field>
                                <Form.Field width={9}>
                                    <label>Soc Sec (overrides the soc sec specified in the entity)</label>
                                    <Form.Input placeholder='Soc sec' value={this.state.soc_sec} name="soc_sec"
                                                onChange={this.inputDecimalChange} />
                                </Form.Field>
                            </div>
                                :
                            this.state.mobility_entries.map((mobility: MobilityEntryInput, index) => (
                                <div className="flex-row" key={mobility.key}>
                                    <div style={{ flex: 9 }}>
                                        <Form.Group>
                                            <Form.Select width={6} fluid label='Entity' options={this.props.entityOptions} placeholder='Select entity' value={mobility.entity_id} name={"entity_id"} onChange={this.handleMobilityChange(index)} />
                                            <Form.Input width={3} fluid label='From Date (dd.mm.yyyy)' value={mobility.from_date} placeholder='From Date' onChange={this.handleMobilityChange(index)} name={'from_date'} />
                                            <Form.Input width={3} fluid label='To Date (dd.mm.yyyy)' value={mobility.to_date} placeholder='To Date' onChange={this.handleMobilityChange(index)} name={'to_date'} />
                                            <Form.Input width={4} fluid label='Soc sec (blank for entity soc sec)' value={mobility.override_entity_soc_sec} placeholder='0,14 for 14%' onChange={this.handleMobilityChange(index)} name={'override_entity_soc_sec'} />
                                        </Form.Group>
                                    </div>
                                    <div style={{ flex: 1 }} className="center-center">
                                        <a href="javascript:void(0)" onClick={this.removeMobilityRow.bind(this, index)}>Remove row</a>
                                    </div>
                                </div>
                            ))
                        }
                        <a href="javascript:void(0)" onClick={this.addAnotherMobilityRow}>Add mobility row</a>
                    </div>
                    <div className="text-center">
                        <Button.Group>
                            <Button type='button' onClick={this.props.onCloseForm}>Cancel</Button>
                            <Button.Or />
                            <Button positive type='submit' onClick={this.addEmployee}>Save employee</Button>
                        </Button.Group>
                    </div>
                </Form>
            </div>
        );
    }

    private handleChange = (key, event) => {
        let updateObject = {};
        updateObject[key] = event.target.value;
        this.setState(updateObject);
    };

    private inputDecimalChange = (event, { name, value }) => this.setState({  [name]: changeCommaForPunctuation(value) });

    private handleCountrySelect = (event, { value }) => {
        this.setState({ residence: value });
    };

    private handleEntitySelect = (event, { value }) => {
        this.setState({ entity_id: value });
    };

    private handleToggleChange = () => {
        this.setState({ insider: !this.state.insider })
    };

    private handleMobilityChange = (index: number) => (event, { name, value }) => {
        this.setState((prevState: State, props) => ({
            mobility_entries: prevState.mobility_entries.map((m, i) => i === index ? { ...m, [name]: value } : m)
        }));
    };

    private addAnotherMobilityRow = () => {
        this.setState((prevState: State, props) => ({ mobility_entries: [...prevState.mobility_entries, createDefaultMobilityEntry(null)] }));
    };

    private removeMobilityRow = (index) => {
        this.setState((prevState: State, props) => ({ mobility_entries: prevState.mobility_entries.filter((m, i) => i !== index) }));
    };

    private addEmployee = () => {
        const mobility_entries: MobilityEntry[] = this.state.mobility_entries.length === 0 ?
            [createDefaultMobilityEntry(this.state.entity_id)] :
            this.state.mobility_entries.map(toMobilityEntry);

        const employee: Employee = {
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            email: this.state.email,
            residence: this.state.residence,
            entity_id: this.state.entity_id,
            soc_sec: this.state.soc_sec,
            internal_identification: this.state.internal_identification,
            insider: this.state.insider,
            mobility_entries
        };

        this.props.saveEmployee(employee);
    }
}

export const createDefaultMobilityEntry = (entityId: string) => ({ from_date: null, to_date: null, entity_id: entityId, override_entity_soc_sec: null });

const toMobilityEntryInput = (me: MobilityEntry, index: number): MobilityEntryInput => ({
    key: `${index}-${new Date().getTime()}`,
    from_date: moment(me.from_date, apiShortDate).isValid() ? moment(me.from_date, apiShortDate).format(norwegianShortDateLongYear) : '',
    to_date: moment(me.to_date, apiShortDate).isValid() ? moment(me.to_date, apiShortDate).format(norwegianShortDateLongYear) : '',
    override_entity_soc_sec: me.override_entity_soc_sec,
    should_override_soc_sec: isNaN(parseFloat(me.override_entity_soc_sec)),
    entity_id: me.entity_id,
});

const toMobilityEntry = (me: MobilityEntryInput): MobilityEntry => ({
    from_date: me.from_date ? moment(me.from_date, norwegianShortDateLongYear).format(apiShortDate)  : null,
    to_date: me.to_date ? moment(me.to_date, norwegianShortDateLongYear).format(apiShortDate) : null,
    override_entity_soc_sec: me.override_entity_soc_sec === '' ? null : me.override_entity_soc_sec,
    entity_id: me.entity_id,
});

export default EmployeeForm;