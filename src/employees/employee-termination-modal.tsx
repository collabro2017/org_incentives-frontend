import React, {Component, StatelessComponent} from "react";
import { Button, Modal, Icon, Header, Form } from 'semantic-ui-react'
import { Employee } from "./employee-reducer";
import moment, { Moment } from "moment";
import {employeeName, norwegianShortDate} from "../utils/utils";
import {handleStringChange} from "../utils/input-handlers";

interface Props {
    closeModal: () => void
    confirm: (employeeId: string, terminationDate: Moment) => void,
    employee: Employee,
}

class EmployeeTermination extends Component<Props> {
    state = {
        termination_date: moment().format(norwegianShortDate),
    };

    render() {
        const { closeModal, confirm, employee } = this.props;
        const { termination_date } = this.state;
        return (
            <Modal open>
                <i className="close icon" onClick={closeModal}/>
                <Header content='Terminate employee'/>
                <Modal.Content>
                    <p>Are you sure you want to terminate {employeeName(employee)}?</p>
                    <Form.Field width={7}>
                        <label>Termination date (dd.mm.yy)</label>
                        <Form.Input
                            placeholder={'Date'}
                            value={termination_date}
                            name="termination_date"
                            onChange={this.handleDateChange.bind(this, 'termination_date')}/>
                        <span>{moment(termination_date, norwegianShortDate).format('ll')}</span>
                    </Form.Field>
                </Modal.Content>
                <Modal.Actions>
                    <Button basic color='red' onClick={closeModal}>
                        <Icon name='remove' /> No
                    </Button>
                    <Button color='green' inverted onClick={confirm.bind(this, employee.id, moment(termination_date, norwegianShortDate))}>
                        <Icon name='checkmark' /> Yes
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }

    private handleDateChange = handleStringChange(this)
};


export default EmployeeTermination;
