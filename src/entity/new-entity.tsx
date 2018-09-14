import React, { Component } from 'react';
import { Button, Form, Dropdown } from 'semantic-ui-react';
import { Entity} from "./entity-reducer";
import { countryOptions } from "../data/common";
import {changeCommaForPunctuation} from "../utils/utils";

interface Props {
    postEntity: (entity: Entity) => void,
    editEntity: (entity: Entity) => void,
    closeFormClicked: () => void,
    selectedEntity: Entity
}

interface State {
    name: string,
    identification: string,
    countryCode: string
    soc_sec: string
}

class NewEntity extends Component<Props, State> {

    state = {
        name: this.props.selectedEntity ? this.props.selectedEntity.name : '',
        identification: this.props.selectedEntity ? this.props.selectedEntity.identification : '',
        countryCode: this.props.selectedEntity ? this.props.selectedEntity.countryCode : '',
        soc_sec: this.props.selectedEntity ? this.props.selectedEntity.soc_sec : '',
    };

    render() {
        return (
            <div className="form-greyscale">
                <Form size={"large"}>
                    <Form.Field width={9}>
                        <label>Entity name</label>
                        <input placeholder='Entity name' value={this.state.name}
                               onChange={this.handleChange.bind(this, 'name')} />
                    </Form.Field>
                    <Form.Field width={9}>
                        <label>Entity id</label>
                        <input placeholder='Entity id' value={this.state.identification}
                               onChange={this.handleChange.bind(this, 'identification')} />
                    </Form.Field>
                    <Form.Field width={9}>
                        <label>Soc Sec</label>
                        <Form.Input placeholder='Soc sec' value={this.state.soc_sec} name="soc_sec"
                                    onChange={this.inputDecimalChange} />
                    </Form.Field>
                    <div className="block-m">
                        <Form.Field width={9}>
                            <label>Country</label>
                            <Dropdown placeholder='Select Country' fluid search selection options={countryOptions}
                                      value={this.state.countryCode} onChange={this.handleCountrySelect} />
                        </Form.Field>
                    </div>
                    <div className="text-center">
                        <Button.Group>
                            <Button type='button' onClick={this.props.closeFormClicked}>Cancel</Button>
                            <Button.Or />
                            <Button positive type='submit' onClick={this.addEntity}>Save entity</Button>
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

    private handleCountrySelect = (event, { value }) => {
        this.setState({ countryCode: value });
    };

    private inputDecimalChange = (event, { name, value }) => this.setState({  [name]: changeCommaForPunctuation(value) });

    private addEntity = () => {
        const entity: Entity = {
            name: this.state.name,
            identification: this.state.identification,
            countryCode: this.state.countryCode,
            soc_sec: this.state.soc_sec
        };

        this.props.selectedEntity ? this.props.editEntity(entity) : this.props.postEntity(entity);
    };

}

export default NewEntity;
