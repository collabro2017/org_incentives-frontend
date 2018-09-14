import React, { Component } from 'react';
import { DropdownItemProps, Button, Form, Dropdown } from 'semantic-ui-react';
import { Employee } from "./entity-workflow";
import { Link } from 'react-router-dom';
import { countryOptions } from "../data/common";

interface Props {
    addEmployee: (employee: Employee) => void,
    entityOptions: DropdownItemProps[]
}

interface State {
    firstName: string,
    lastName: string,
    email: string,
    entity_id: string,
    residence: string,
    socialSecurity
}

class NewEmployee extends Component<Props> {
    state = {
        firstName: '',
        lastName: '',
        email: '',
        entity: '',
        residence: '',
        socialSecurity: 'no',
        insider: false,
    };

    render() {
        return (
            <div className={"form-greyscale"}>
                <Form size={"large"}>
                    <Form.Field width={10}>
                        <label>First Name</label>
                        <input placeholder='First Name' value={this.state.firstName}
                               onChange={this.handleChange.bind(this, 'firstName')} />

                    </Form.Field>
                    <Form.Field width={10}>
                        <label>Last Name</label>
                        <input placeholder='Last Name' value={this.state.lastName}
                               onChange={this.handleChange.bind(this, 'lastName')} />
                    </Form.Field>
                    <Form.Field width={10}>
                        <label>Company Email (will be used for login)</label>
                        <input placeholder='Email' value={this.state.email}
                               onChange={this.handleChange.bind(this, 'email')} />
                    </Form.Field>
                    <Form.Field width={10}>
                        <label>Which entity does the employee belong to?</label>
                        <div className="relative">
                            <Dropdown placeholder='Search entities...' fluid search selection
                                      options={this.props.entityOptions}
                                      value={this.state.entity} onChange={this.handleEntitySelect}>
                            </Dropdown>
                            <Link to={"/modal"} className="add-another-entity-link">Add another entity</Link>
                        </div>
                    </Form.Field>
                    <div className="block-m">
                        <Form.Field width={10}>
                            <label>Residence</label>
                            <Dropdown placeholder='Search countries...' fluid search selection
                                      options={countryOptions}
                                      value={this.state.residence} onChange={this.handleCountrySelect}>
                            </Dropdown>
                        </Form.Field>
                    </div>
                    <div className="text-center">
                        <Button.Group>
                            <Button>Cancel</Button>
                            <Button.Or />
                            <Button positive type='submit' onClick={this.onClick}>Save employee</Button>
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

    private handleCountrySelect = (event, { value }) => this.setState({ residence: value });
    private handleEntitySelect = (event, { value }) => this.setState({ entity: value });

    private onClick = () => {
        this.props.addEmployee(this.state);
        this.setState({
            firstName: '',
            lastName: '',
            email: '',
            residence: '',
            entity: '',
            socialSecurity: '',
            insider: false,
        });
    }
}

export default NewEmployee;
