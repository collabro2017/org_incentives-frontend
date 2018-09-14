import React, { Component } from 'react';
import { Form, Button, Dropdown, Modal, Checkbox, DropdownItemProps } from 'semantic-ui-react';
import SubProgramVestingModal from "./subprogram-vesting-modal";
import { SubProgram, VestingEventTemplate } from "./subprogram-reducer";
import { Program } from "../programs/program-reducer";
import SubProgramVestingPreview from "./subprogram-vesting-preview";

interface Props {
    program: Program,
    instrumentsOptions: DropdownItemProps[],
    settlementOptions: DropdownItemProps[],
    addSubProgram: (subProgram: SubProgram) => void,
    closeFormClicked: () => void
}

interface State {
    modalOpen: boolean,
    name: string,
    instrumentType: string,
    settlementType: string,
    vesting_event_templates: VestingEventTemplate[],
    performance: boolean,
}

class NewSubprogram extends Component<Props, State> {

    state = {
        modalOpen: false,
        name: '',
        instrumentType: '',
        settlementType: '',
        vesting_event_templates: [],
        performance: false
    };

    render() {
        const { name, instrumentType, settlementType, performance } = this.state;

        return (
            <div>
                <div className='block-s'>
                    <h2>Create subplan</h2>
                </div>
                <div>
                    <Form size={"large"} as={'form'}>
                        <div className='block-m'>
                            <Form.Input placeholder={'name'} width={9} value={name} name={'name'}
                                        onChange={this.handleSubprogramChange} label='Name'/>
                            <Form.Field width={9}>
                                <label>Incentive instrument</label>
                                <Dropdown placeholder='Select instrument' selection
                                          options={this.props.instrumentsOptions}
                                          value={instrumentType}
                                          onChange={this.handleInstrumentTypeSelect}/>
                            </Form.Field>
                            <Form.Field width={9}>
                                <label>Settlement type</label>
                                <Dropdown placeholder='Select settlement type' selection
                                          options={this.props.settlementOptions}
                                          value={settlementType}
                                          onChange={this.handleSettlementTypeSelect}/>
                            </Form.Field>
                            <div className="block-m">
                                <Form.Field inline width={9}>
                                    <Checkbox label='Performance' checked={performance}
                                              onChange={this.handleToggleChange}/>
                                </Form.Field>
                            </div>
                            <div className="block-m">
                                <div className='form-white text-center'>
                                    <div className='flex-row space-between align-center'>
                                        <h3 className={"text-center program-title"}>Vesting</h3>
                                        <Button type={'button'} onClick={this.openVestingModal}>{ this.state.vesting_event_templates.length === 0 ? 'Create vesting schedule' : 'Change vesting schedule' }</Button>
                                    </div>
                                    {
                                        this.state.vesting_event_templates.length > 0 &&
                                            <SubProgramVestingPreview vestingTemplates={this.state.vesting_event_templates}/>
                                    }
                                </div>
                            </div>
                        </div>
                        <Modal open={this.state.modalOpen}>
                            <i className="close icon" onClick={() => this.setState({ modalOpen: false })}/>
                            <SubProgramVestingModal saveVesting={this.saveVesting} vestingEvents={this.state.vesting_event_templates}/>
                        </Modal>
                        <div className="text-center">
                            <Button.Group>
                                <Button type='button' onClick={this.props.closeFormClicked}>Cancel</Button>
                                <Button.Or/>
                                <Button positive type='submit' onClick={this.onSubPlanSave}>Add Subprogram</Button>
                            </Button.Group>
                        </div>
                    </Form>
                </div>
            </div>
        )
    }

    private openVestingModal = () => {
        this.setState({ modalOpen: true });
    };

    private handleInstrumentTypeSelect = (event, { value }) => {
        this.setState({ instrumentType: value });
    };

    private handleSettlementTypeSelect = (event, { value }) => {
        this.setState({ settlementType: value });
    };

    private handleSubprogramChange = (event, { name, value }) => {
        this.setState({ [name]: value });
    };

    private handleToggleChange = () => {
        this.setState({ performance: !this.state.performance })
    };

    private saveVesting = (vesting_event_templates: VestingEventTemplate[]) => {
        this.setState({
            vesting_event_templates: vesting_event_templates,
            modalOpen: false
        });
    };

    private onSubPlanSave = () => {
        const subProgram: SubProgram = {
            name: this.state.name,
            instrumentTypeId: this.state.instrumentType,
            settlementTypeId: this.state.settlementType,
            incentive_sub_program_template: {
                vesting_event_templates: this.state.vesting_event_templates
            },
            performance: this.state.performance,
            awards: []
        };

        this.props.addSubProgram(subProgram);
    }
}

export default NewSubprogram;