import React, { Component, StatelessComponent } from "react";
import { Form, Dropdown, Button, Icon, Header, Modal, DropdownItemProps } from "semantic-ui-react";
import { Employee } from "../../employees/employee-reducer";

interface OwnProps {
    employeeOptions: DropdownItemProps[],
    employees: Employee[],
}

class PurchasePage extends Component<OwnProps> {
    state = {
        modalOpen: false,
        employeeOptions: [],
        employee: '',
        maximumAmount: '',
        grantDate: '',
        expiryDate: '',
        vesting: []
    };

    render() {
        const { maximumAmount, grantDate, expiryDate } = this.state;
        return (
            <Modal open>
                <Header content="Create purchase opportunity for employee" textAlign={"center"}/>
                <Modal.Content>
                    <Form>
                        <Form.Field width={10}>
                            <label>Employee</label>
                            <div className="relative">
                                <Dropdown placeholder='Search employees...' fluid search selection
                                          options={this.props.employeeOptions}
                                          value={this.state.employee} onChange={this.handleSelect}>
                                </Dropdown>
                            </div>
                        </Form.Field>
                        <Form.Field>
                            <Form.Input placeholder={'Amount'} width={10} name={'maximumAmount'} value={maximumAmount}
                                        onChange={this.inputChange} label='Maximum purchase amount' />
                        </Form.Field>
                        <Form.Input placeholder={'DD.MM.YY'} width={10} name={'grantDate'}
                                    value={grantDate}
                                    onChange={this.inputChange}
                                    label='Grant date' />
                        <Form.Input placeholder={'DD.MM.YY'} width={10} name={'expiryDate'}
                                    value={expiryDate}
                                    onChange={this.inputChange}
                                    label='Expiry date' />
                    </Form>
                </Modal.Content>
                <Modal.Actions >
                    <Button
                        color='green'
                        inverted>
                        <Icon name='checkmark' /> Save
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }

    private handleSelect = (event, { value }) => this.setState({ employee: value });
    private inputChange = (event, { name, value }) => this.setState({  [name]: value });
}

export default PurchasePage;
