import React, { Component } from 'react';
import { Form, Button, Input } from 'semantic-ui-react';
import { Program } from "./program-reducer";
import DatePicker from "react-datepicker";
import moment, { Moment } from "moment";
import { SubProgram } from "../subprograms/subprogram-reducer";
import { norwegianShortDate } from "../utils/utils";

interface Props {
    addProgram: (program: Program) => void
    closeFormClicked: () => void
    selectedProgram?: Program
}

interface State {
    name: string,
    startDate: string,
    endDate: string,
    capacity: number,
    incentive_sub_programs: SubProgram[]
}

class NewProgram extends Component<Props, State> {

    state = {
        name: this.props.selectedProgram ? this.props.selectedProgram.name : '',
        startDate: this.props.selectedProgram ? moment(this.props.selectedProgram.startDate).format('DD.MM.YY') : '',
        endDate: this.props.selectedProgram ? moment(this.props.selectedProgram.endDate).format('DD.MM.YY') : '',
        capacity: this.props.selectedProgram ? this.props.selectedProgram.capacity : 0,
        incentive_sub_programs: this.props.selectedProgram ? this.props.selectedProgram.incentive_sub_programs : []
    };

    render() {
        return (
            <Form size={"large"}>
                <Form.Field width={8}>
                    <label>Program name</label>
                    <input placeholder='Program name' value={this.state.name}
                           onChange={this.handleChange.bind(this, 'name')}/>
                </Form.Field>
                <Form.Field width={8}>
                    <label>Program start</label>
                    <Form.Input  name={'startDate'} placeholder='Program start (dd.mm.yy)' maxLength={8} value={this.state.startDate}
                            onChange={this.handleDateChange}/>
                </Form.Field>
                <Form.Field width={8}>
                    <label>Program end</label>
                    <Form.Input name={'endDate'} placeholder='Program end (dd.mm.yy)' maxLength={8} value={this.state.endDate}
                           onChange={this.handleDateChange}/>
                </Form.Field>
                <div className="block-m">
                    <Form.Field width={8}>
                        <label>Capacity (maximum number of instruments available)</label>
                        <input placeholder='Capacity' value={this.state.capacity}
                               onChange={this.handleChange.bind(this, 'capacity')}/>
                    </Form.Field>
                </div>
                <div className="text-center">
                    <Button.Group>
                        <Button type='button' onClick={this.props.closeFormClicked}>Cancel</Button>
                        <Button.Or/>
                        <Button positive type='submit' onClick={this.onClick}>Add program</Button>
                    </Button.Group>
                </div>
            </Form>

        )
    }

    private handleDateChange = (event, {name, value }) => {
        if (value.length === 10) {
            // dd.mm.yyyy -> dd.mm.yy
            this.setState({ [name]: moment(value).format("DD.MM.YY") });

        } else if (value.length <= 8) {
            this.setState({ [name]: value });
        }
    };

    private handleChange = (key, event) => {
        let updateObject = {};
        updateObject[key] = event.target.value;
        this.setState(updateObject);
    };

    private onClick = () => {
        const program = {
            name: this.state.name,
            startDate: moment(this.state.startDate, norwegianShortDate),
            endDate: moment(this.state.endDate, norwegianShortDate),
            capacity: this.state.capacity,
            incentive_sub_programs: this.state.incentive_sub_programs
        };

        this.props.addProgram(program);
    }
}

export default NewProgram;

