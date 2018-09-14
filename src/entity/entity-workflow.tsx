import React, { Component, StatelessComponent } from 'react';
import {
    Route,
    Redirect,
    withRouter,
    RouteComponentProps,
    Switch, Link
} from 'react-router-dom';
import moment, { Moment } from 'moment';
import {
    Table,
    Step,
    DropdownItemProps,
    Flag,
    Button,
    Modal,
    Form,
    Dropdown,
    FlagProps,
    Checkbox
} from 'semantic-ui-react';
import { countryOptions } from "../data/common";
import numeral from 'numeral';

import EntityManagementPage from './entity-management-page';
import EmployeeManagementPage from '../employees/employee-management-page';
import ProgramManagementPage from '../programs/program-management-page';
import AwardsManagementPage from '../awards/awards-management-page';

import './entity.less';
import { norwegianShortDate } from '../utils/utils';

export interface Tenant {
    name: String,
    tickerId: string;
}

interface Props {
    tenant: Tenant
}

interface State {
    entities: Entity[],
    employees: Employee[],
    programs: Program[],
    program: any,
    subProgram: any,
    showForm: boolean,
}

export interface Entity {
    name: string,
    id: string,
    country: string,
}

export interface Employee {
    firstName: string,
    lastName: string,
    email: string,
    entity: string,
    residence: string,
    socialSecurity: string,
    employeeReferenceId?: string,
    insider: boolean,
    termination?: Termination,
}

interface Termination {
    date: Moment,
    leaverReason: string,
}

const newEntityRoute = "/new-entity";

const instrumentOptions = [
    {
        key: 'rsu',
        value: 'rsu',
        text: 'RSU'
    },
    {
        key: 'rsa',
        value: 'rsa',
        text: 'RSA'
    },
    {
        key: 'option',
        value: 'option',
        text: 'Option'
    }
];

const settlementOptions = [
    {
        key: 'equity',
        value: 'equity',
        text: 'Equity'
    },
    {
        key: 'cash',
        value: 'cash',
        text: 'Cash'
    },
];

const defaultEmployees: Employee[] = [
    {
        firstName: 'Aleksander',
        lastName: 'Hindenes',
        entity: '916249543',
        residence: 'no',
        socialSecurity: '14,1%',
        email: 'test@test.com',
        insider: false,
    },
    {
        firstName: 'Magnus',
        lastName: 'Nøkleby',
        entity: '916249543',
        residence: 'no',
        socialSecurity: '14,1%',
        email: 'test@test.com',
        insider: false,
    },
    {
        firstName: 'Fredrik',
        lastName: 'Huseby',
        entity: '916249543',
        residence: 'no',
        socialSecurity: '14,1%',
        email: 'test@test.com',
        insider: false,
    }

];

const exampleEntities = [
    {
        name: 'Axactor AS',
        id: '916249543',
        country: 'no'
    },
    {
        name: 'Axactor Norway AS',
        id: '911831392',
        country: 'no'
    },
    {
        name: 'Axactor Norway Holding AS',
        id: '816928842',
        country: 'no'
    }
];

const defaultProgram: Program = {
    from: moment(),
    to: moment(),
    name: "Default Program"
};

class EntityWorkflow extends Component<RouteComponentProps<{}> & Props, State> {
    state = {
        entities: [],//exampleEntities,
        employees: [],//defaultEmployees,
        programs: [],
        program: null,//defaultProgram,
        subProgram: null,//defaultSubProgram,
        showForm: false
    };


    render() {
        const { tenant, match } = this.props;

        return (
            <div>
                <div className='block-m'>
                    <div className="col-center block-l">
                        <Route path={`${this.props.match.path}/:step`} render={({ match }) => (
                            <StepIndicator step={stepFromPath(match.params.step)} path={this.props.match.path} />
                        )} />
                    </div>
                    <div className="width-limit">
                        <Route exact path={`${this.props.match.path}/entity`} render={({ match }) => (
                            <EntityManagementPage />
                        )} />
                        <Route exact path={`${this.props.match.path}/employees`} render={({ match }) => (
                            <EmployeeManagementPage match={match}/>
                        )} />
                        <Route exact path={`${this.props.match.path}/programs`} render={({ match }) => (
                           <ProgramManagementPage />
                                /*<div>
                                <h2 className={"text-center block-m"}>Incentive programs</h2>
                                <p className="text-content block-m">Create a new incentive program your employees</p>
                                <div className="">

                                    <NewProgram instrumentsOptions={instrumentOptions}
                                                addProgram={this.addProgramAndSubProgram}
                                                settlementOptions={settlementOptions} />
                                </div>
                            </div>*/
                        )} />
                        <Route exact path={`${this.props.match.path}/awards`} render={({ match }) => (
                            <AwardsManagementPage match={match}/>
                            /*<AwardEmployeeModal subProgram={this.state.subProgram} employees={this.state.employees}
                                                program={this.state.program} updateAwards={this.updateAwards} />*/
                        )} />
                    </div>
                </div>
                <div className='divider-l width-limit' />
                <div className="text-center">
                    <Route exact path={`${this.props.match.path}/entity`} render={({ match }) => (
                        <Link to={`${this.props.match.path}/employees`}>
                            <Button size={"big"}>Next</Button>
                        </Link>
                    )} />
                    <Route exact path={`${this.props.match.path}/employees`} render={({ match }) => (
                        <Link to={`${this.props.match.path}/programs`}>
                            <Button size={"big"}>Next</Button>
                        </Link>
                    )} />
                    <Route exact path={`${this.props.match.path}/programs`} render={({ match }) => (
                        <Link to={`${this.props.match.path}/awards`}>
                            <Button size={"big"}>Next</Button>
                        </Link>
                    )} />
                    <Route exact path={`${this.props.match.path}/awards`} render={({ match }) => (
                        <Link to={`/admin`}>
                            <Button size={"big"}>Complete</Button>
                        </Link>
                    )} />
                </div>
            </div>
        );

    }

    private addProgramAndSubProgram = (program, subProgram) => {
        this.setState({ program, subProgram });
    };

    private addEmployee = (employee: Employee) => {
        const updated = [].concat(this.state.employees, [employee]);
        this.setState({ employees: updated, showForm: false });
    };

    private addProgram = (programInput: ProgramInput) => {
        const program = {
            name: programInput.name,
            from: moment(programInput.from),
            to: moment(programInput.to),
        };
        const updated = [].concat(this.state.programs, [program]);
        this.setState({ programs: updated, showForm: false });
    };

    private addAnotherClicked = () => this.setState({ showForm: true });

    private updateAwards = (award) => {
        this.state.subProgram.awards.push(award);
        this.setState({ subProgram: this.state.subProgram });
    }
}

const stepFromPath = (path: string) => {
    if (path === 'entity') {
        return 1;
    }
    if (path === 'employees') {
        return 2;
    }

    if (path === 'programs') {
        return 3;
    }

    if (path === 'awards') {
        return 4;
    }

    return 0;
}

export const link = (path) => ({ as: Link, to: path });

const StepIndicator = ({ step, path }) => (
    <Step.Group ordered>
        <Step completed={step > 1} active={step === 1} >
            <Step.Content { ...(step > 1 ? link(`${path}/entity`) : {}) }>
                <Step.Title>Entities</Step.Title>
                <Step.Description>Add all your entities</Step.Description>
            </Step.Content>
        </Step>

        <Step completed={step > 2} active={step === 2} >
            <Step.Content { ...(step > 2 ? link(`${path}/employees`) : {}) }>
                <Step.Title>Employees</Step.Title>
                <Step.Description>Add your employees</Step.Description>
            </Step.Content>
        </Step>
        <Step completed={step > 3} active={step === 3} >
            <Step.Content { ...(step > 3 ? link(`${path}/programs`) : {}) }>
                <Step.Title>Incentive programs</Step.Title>
            </Step.Content>
        </Step>
        <Step completed={step > 4} active={step === 4} >
            <Step.Content { ...(step > 4 ? link(`${path}/awards`) : {}) }>
                <Step.Title>Employee awards</Step.Title>
            </Step.Content>
        </Step>
    </Step.Group>
);


export const entityOptions = (entities: Entity[]): DropdownItemProps[] => entities.map((e) => ({
    key: e.id,
    value: e.name,
    text: e.name
}));

interface Program {
    name: string,
    from?: Moment,
    to?: Moment,
}

interface ProgramInput {
    name: string,
    from: string,
    to: string,
}

interface SubProgramForm {
    name: string,

}

interface NewProgramState {
    input: ProgramInput,
    program?: Program,
    subProgramForm: any,
    subProgram: any,
}

interface DropdownOption {
    key: string,
    value: string,
    text: string,
}

export const SubProgram = ({ program, subProgram }) => {
    const { from, to, name } = program;
    return (
        <div>
            <div className="flex-row space-between align-center">
                <span>{name}</span>
                <span>{from.format("DD.MM.YY")} - {to.format("DD.MM.YY")}</span>
            </div>
            <div className="divider-m" />
            <div className='row-center space-between align-center'>
                <span className='text-content'>{`${subProgram.name}`}</span>
                <span>{`Settlement: ${subProgram.settlementType}`}</span>
                <span>{`Instrument: ${subProgram.instrumentType}`}</span>
            </div>
        </div>
    );
};

const defaultInput = {
    name: '',
    from: moment().format("DD.MM.YY"),
    to: '',
    capacity: '',
};

const defaultVestingInput = {
    percentage: '',
    price: '',
    daysAfterGrantDate: '',
    savedMode: false,
};

const exampleVestingInput = [
    {
        percentage: '30',
        price: '10',
        daysAfterGrantDate: '90',
        savedMode: false,
    },
    {
        percentage: '30',
        price: '15',
        daysAfterGrantDate: '180',
        savedMode: false,
    },
    {
        percentage: '40',
        price: '20',
        daysAfterGrantDate: '270',
        savedMode: false,
    }
]

const defaultSubProgram = {
    name: 'The best subplan',
    instrumentType: 'option',
    settlementType: 'equity',
    min: '',
    max: '',
    grantDate: '01.01.2017',
    expiryDate: '01.01.2020',
    vesting: exampleVestingInput,
    goodLeaver: true,
    badLeaver: true,
};

const exampleProgram = {
    name: 'Firma AS Incentive Program',
    from: moment(),
    to: moment(),
};

class NewProgram extends Component<{ addProgram: (program: any, subProgram: any) => void, instrumentsOptions: DropdownOption[], settlementOptions: DropdownOption[] }, NewProgramState> {
    state = {
        input: defaultInput,
        program: null,// exampleProgram,
        subProgramForm: {
            name: '',
            instrumentType: '',
            settlementType: '',
            min: '',
            max: '',
            grantDate: '',
            expiryDate: '',
            vesting: [defaultVestingInput],
            goodLeaver: true,
            badLeaver: true,
        },
        subProgram: null
    };

    render() {
        return (
            <div className={"form-greyscale"}>

                {
                    !this.state.program && this.renderForm(this.state.input)
                }
                {
                    this.state.program && !this.state.subProgram && this.renderSubPlanForm(this.state.program)
                }
                {
                    this.state.program && this.state.subProgram &&
                    <SubProgram subProgram={this.state.subProgram} program={this.state.program} />
                }
            </div>
        );
    }

    private handleChange = (key, event) => {
        let updateObject = {};
        updateObject[key] = event.target.value;
        this.setState({ input: Object.assign({}, this.state.input, updateObject) });
    };

    private onClick = () => {
        const program = {
            name: this.state.input.name,
            from: moment(this.state.input.from, norwegianShortDate),
            to: moment(this.state.input.to, norwegianShortDate),
            capacity: this.state.input.capacity,
        };

        const state2 = { program, input: defaultInput };
        this.setState(state2);
    }

    private addProgram = (programInput: ProgramInput) => {
        const program = {
            name: programInput.name,
            from: moment(programInput.from),
            to: moment(programInput.to),
        };

        this.setState({ program });
    };

    private renderSubPlanForm = ({ name, from, to, capacity }) => {
        const { subProgramForm } = this.state;
        return (
            <div>
                <div className="flex-row space-between align-center">
                    <span>{name}</span>
                    <span>{`Capacity: ${capacity}`}</span>
                    <span>{from.format("DD.MM.YY")} - {to.format("DD.MM.YY")}</span>
                </div>
                <div className="divider-m" />
                {
                    /*
                    <div className='text-center width-limit text-content'>
                    <p className="">Somthing, something, something</p>
                    <Button primary basic><i className="plus icon" />Create sub program</Button>
                    </div>
                     */
                }
                <div>
                    <div className='block-s'>
                        <h2>Create subplan</h2>
                    </div>
                    <div>
                        <Form size={"large"} as={'form'}>
                            <div className='block-m'>
                                <Form.Input placeholder={'name'} width={10} name={'name'} value={subProgramForm.name}
                                            onChange={this.subPlanFormChange} label='Name' />
                                <Form.Field width={10}>
                                    <label>Incentive instrument</label>
                                    <Dropdown placeholder='Select instrument' selection
                                              options={this.props.instrumentsOptions}
                                              value={subProgramForm.instrumentType}
                                              onChange={this.handleIntrumentTypeSelect} />
                                </Form.Field>
                                <Form.Field width={10}>
                                    <label>Settlement type</label>
                                    <Dropdown placeholder='Select settlement type' selection
                                              options={this.props.settlementOptions}
                                              value={subProgramForm.settlementType}
                                              onChange={this.handleSettlementTypeSelect} />
                                </Form.Field>

                                {
                                    /*

                                <div className="field">
                                    <label className="">Award limit (if any)</label>
                                    <Form.Group inline>
                                        <Form.Input placeholder='Max' name='max' value={subProgramForm.max}
                                                    type='number'
                                                    onChange={this.subPlanFormChange} />
                                    </Form.Group>
                                </div>
                                     */
                                }
                                {
                                    /*
                                    <div className="block-l">
                                    <div className="field block-m">
                                        <label className="">Select possible leaver reasons</label>
                                        <Form.Field width={10}>
                                            <div>
                                                <Checkbox label='Good leaver' name="goodLeaver" onChange={this.toggle}
                                                          checked={subProgramForm.goodLeaver} />
                                            </div>
                                            <div>
                                                <Checkbox label='Bad leaver' name="badLeaver" onChange={this.toggle}
                                                          checked={subProgramForm.badLeaver} />
                                            </div>
                                        </Form.Field>
                                    </div>
                                </div>
                                     */
                                }

                                <div className="block-l">
                                    <div className="block-m">
                                        <Form.Input placeholder={'DD.MM.YY'} width={10} name={'grantDate'}
                                                    value={subProgramForm.grantDate}
                                                    onChange={this.subPlanFormChange}
                                                    label='Grant date (can be changed for individual awards)' />
                                        <Form.Input placeholder={'DD.MM.YY'} width={10} name={'expiryDate'}
                                                    value={subProgramForm.expiryDate}
                                                    onChange={this.subPlanFormChange}
                                                    label='Expiry date (can be changed for individual awards)' />
                                    </div>

                                    <div className='form-white text-center'>
                                        <div className='block-s'><h3>Vesting</h3></div>
                                        <p className='block-s'>Annual vesting following the schedule: 33%, 33%, 34%</p>
                                        <div className='text-center'>
                                            <Button onClick={this.vestingTemplateSaveAndAddAnother}>Change vesting
                                                schedule</Button>
                                        </div>
                                    </div>
                                    {
                                        /*
                                        <div className="field">
                                        <p>How should the awards be vested? (can be changed for
                                            individual awards)</p>
                                        {
                                            subProgramForm.vesting.map((vesting, index) => (
                                                vesting.savedMode ?
                                                    <div className="row-center space-between block-s">
                                                        <span>{`Vesting ${index + 1}`}</span>
                                                        <span>{numeral(vesting.price).format('0,00 $')}</span>
                                                        <span>{`${vesting.daysAfterGrantDate} days after grant`}</span>
                                                        <span>{`${vesting.percentage}%`}</span>
                                                    </div>
                                                    :
                                                    <div className='block-s'>
                                                        <Form.Input placeholder='%' name='percentage'
                                                                    value={vesting.percentage}
                                                                    type='number'
                                                                    width={3}
                                                                    label='Percentage'
                                                                    onChange={this.vestingTemplateChange.bind(this, index)} />
                                                        <Form.Input placeholder='Price' label='Price' name='price'
                                                                    value={vesting.price}
                                                                    type='number'
                                                                    width={3}
                                                                    onChange={this.vestingTemplateChange.bind(this, index)} />
                                                        <Form.Input placeholder='Days'
                                                                    label='Days after grant' name='daysAfterGrantDate'
                                                                    value={vesting.daysAfterGrantDate}
                                                                    type='number'
                                                                    width={3}
                                                                    onChange={this.vestingTemplateChange.bind(this, index)} />
                                                    </div>
                                            ))
                                        }
                                        <Button basic onClick={this.vestingTemplateSaveAndAddAnother}><i
                                            className='plus icon' />Add another vesting</Button>
                                    </div>
                                         */
                                    }

                                </div>
                            </div>


                            <div className="text-center">
                                <Button.Group>
                                    <Button>Cancel</Button>
                                    <Button.Or />
                                    <Button positive type='submit' onClick={this.onSubPlanSave}>Save program</Button>
                                </Button.Group>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        );
    }

    private onSubPlanSave = () => {
        this.setState({ subProgram: this.state.subProgramForm })
        this.props.addProgram(this.state.program, this.state.subProgramForm);
    }

    private toggle = (event, { name, value }) => {
        this.setState({ subProgramForm: { ...this.state.subProgramForm, ...{ [name]: !this.state.subProgramForm[name] } } });
    };
    private handleIntrumentTypeSelect = (event, { value }) => this.setState({ subProgramForm: { ...this.state.subProgramForm, ...{ instrumentType: value } } });
    private handleSettlementTypeSelect = (event, { value }) => this.setState({ subProgramForm: { ...this.state.subProgramForm, ...{ settlementType: value } } });

    private subPlanFormChange = (event, { name, value }) => this.setState({
        subProgramForm: Object.assign({}, this.state.subProgramForm, { [name]: value })
    });

    private vestingTemplateSaveAndAddAnother = () => {
        const savedTemplates = this.state.subProgramForm.vesting.map((v) => ({ ...v, ...{ savedMode: true } }));
        this.setState({ subProgramForm: { ...this.state.subProgramForm, ...{ vesting: [].concat(savedTemplates, [defaultVestingInput]) } } });
    };
    private vestingTemplateChange = (index, event, { name, value }) => {
        const vesting = this.state.subProgramForm.vesting;
        if (!vesting) {
            return;
        }

        vesting[index] = { ...vesting[index], ...{ [name]: value } };

        this.setState({
            subProgramForm: Object.assign({}, this.state.subProgramForm)
        })
    };

    private renderForm = ({ name, from, to, capacity }) => (
        <Form size={"large"}>
            <Form.Field width={10}>
                <label>Program name</label>
                <input placeholder='Program name' value={name}
                       onChange={this.handleChange.bind(this, 'name')} />
            </Form.Field>
            <Form.Field width={10}>
                <label>Program start</label>
                <input placeholder='Program start (dd.mm.yy)' value={from}
                       onChange={this.handleChange.bind(this, 'from')} />
            </Form.Field>
            <Form.Field width={10}>
                <label>Program end</label>
                <input placeholder='Program end (dd.mm.yy)' value={to}
                       onChange={this.handleChange.bind(this, 'to')} />
            </Form.Field>
            <div className="block-m">
                <Form.Field width={10}>
                    <label>Capacity (maximum number of instruments available)</label>
                    <input placeholder='Capacity' value={capacity}
                           onChange={this.handleChange.bind(this, 'capacity')} />
                </Form.Field>
            </div>
            <div className="text-center">
                <Button.Group>
                    <Button>Cancel</Button>
                    <Button.Or />
                    <Button positive type='submit' onClick={this.onClick}>Save program</Button>
                </Button.Group>
            </div>
        </Form>
    )
}


const NewEntityModal: StatelessComponent<{}> = () => (
    <Modal>
        <div>fdjksaløfjsdlkafj</div>
    </Modal>
);

export default withRouter<Props>(EntityWorkflow);
