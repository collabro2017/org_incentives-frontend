import React, { Component, StatelessComponent } from "react";
import { Form, Checkbox, Button, Icon, Header, Modal, DropdownItemProps, Table, Dropdown } from "semantic-ui-react";
import { Employee } from "../../employees/employee-reducer";
import { connect, MapStateToProps } from "react-redux";
import { PurchaseConfig } from "../../subprograms/subprogram-reducer";
import { CreatePurchaseConfigAction, UpdatePurchaseConfigAction } from "./purchase-saga";
import { CREATE_PURCHASE_CONFIG, UPDATE_PURCHASE_CONFIG } from "./purchase-actions";
import { push } from "react-router-redux";
import { RootState } from "../../reducers/all-reducers";
import { FETCH_FILES } from "../../files/files-actions";
import { FETCH_WINDOW } from "../../exercise-windows/window-actions";
import { WindowType, Window } from "../../exercise-windows/window-reducer";
import moment from "moment";
import { Location } from "history";
import { changeCommaForPunctuation, changePunctuationForComma } from "../../utils/utils";

interface Props {
    employees: Employee[],
    subProgramId: string,
    location: Location,
    purchaseConfig?: PurchaseConfig,
}

export interface PurchaseOpportunityInput {
    id?: string,
    selected: boolean,
    maxAmount: string,
    employee_id: string,
}

interface State {
    price: string,
    purchaseOpportunities: PurchaseOpportunityInput[],
    allSelected: boolean,
    requireShareDepository: boolean,
    window_id: string,
    document_id: null,
}

interface DispatchProps {
    createPurchaseConfig: (action: CreatePurchaseConfigAction) => void,
    updatePurchaseConfig: (action: UpdatePurchaseConfigAction) => void,
    closeModal: () => void,
    fetchDocuments: () => void,
    fetchWindows: () => void,
}

interface StateProps {
    documentOptions: DropdownItemProps[],
    isCreatingPurchaseConfig: boolean,
    purchaseWindows: Window[],
}

class PurchasePage extends Component<Props & StateProps & DispatchProps, State> {
    state = {
        price: '',
        window_id: null,
        requireShareDepository: false,
        purchaseOpportunities: [],
        allSelected: true,
        document_id: null,
    };

    constructor(props) {
        super(props);
        const { purchaseConfig } = this.props;
        this.state.purchaseOpportunities = this.props.employees.map((e) => {
            const existingPurchaseOpportunity = purchaseConfig && purchaseConfig.purchase_opportunities.find((po) => po.employee_id === e.id);
            if (existingPurchaseOpportunity) {
                return {
                    selected: true,
                    id: existingPurchaseOpportunity.id,
                    maxAmount: existingPurchaseOpportunity.maximumAmount,
                    employee_id: existingPurchaseOpportunity.employee_id,
                    document_id: existingPurchaseOpportunity.document_id,
                };
            } else {
                return {
                    selected: false,
                    maxAmount: '0',
                    employee_id: e.id,
                    document_id: null,
                };
            }
        });

        if (purchaseConfig) {
            this.state.price = purchaseConfig.price;
            this.state.window_id = purchaseConfig.window_id;
            this.state.allSelected = false;
            this.state.requireShareDepository = purchaseConfig.require_share_depository
        }
    }

    componentWillMount() {
        this.props.fetchDocuments();
        if (this.props.purchaseWindows.length === 0) {
            this.props.fetchWindows();
        }
    }

    render() {
        const { price, requireShareDepository } = this.state;
        const editMode = this.props.location.pathname.endsWith("/edit");
        return (
            <Modal open closeIcon={<Icon className="close icon" />} onClose={this.props.closeModal}>
                <Header content="Create purchase opportunity" textAlign={"center"}/>
                <Modal.Content>
                    <Form>
                        <Form.Field>
                            <Form.Input placeholder={'Price'} width={10} name={'price'} value={changePunctuationForComma(price)}
                                        onChange={this.inputDecimalChange} label='Purchase price' />
                        </Form.Field>
                        <Form.Field width={10}>
                            <label>In what window should purchasing be available?</label>
                            <div className="relative">
                                <Dropdown placeholder='Select window or leave empty for now' fluid selection
                                          options={windowOptions(this.props.purchaseWindows)}
                                          value={this.state.window_id} onChange={this.handleWindowSelection}>
                                </Dropdown>
                            </div>
                        </Form.Field>
                        <Form.Field inline>
                            <Checkbox label='Ask for Share Depository Account' checked={requireShareDepository} name={'requireShareDepository'} onChange={this.handleToggleChange}/>
                        </Form.Field>
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell><Checkbox onChange={this.toggleSelectAll} checked={this.state.allSelected} /></Table.HeaderCell>
                                    <Table.HeaderCell>Employee</Table.HeaderCell>
                                    <Table.HeaderCell>Maximum purchase quantity</Table.HeaderCell>
                                    <Table.HeaderCell>Document</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {
                                    this.props.employees.map((employee, index) => (
                                        <Table.Row key={employee.id}>
                                            <Table.Cell>{<Checkbox onChange={this.toggleEmployee.bind(this, index)} checked={this.state.allSelected || this.state.purchaseOpportunities[index].selected} />}</Table.Cell>
                                            <Table.Cell>{`${employee.firstName} ${employee.lastName}`}</Table.Cell>
                                            <Table.Cell><Form.Input placeholder={'Amount'} name={'maxAmount'} value={this.state.purchaseOpportunities[index].maxAmount}
                                                                    onChange={this.maxAmountInputChange.bind(this, index)} /></Table.Cell>
                                            <Table.Cell><Form.Field>
                                                <Dropdown placeholder='Select terms document' fluid search selection
                                                          options={this.props.documentOptions}
                                                          value={this.state.purchaseOpportunities[index].document_id} onChange={this.handleDocumentSelect.bind(this, index)}>
                                                </Dropdown>
                                            </Form.Field></Table.Cell>
                                        </Table.Row>
                                    ))
                                }
                            </Table.Body>
                        </Table>
                    </Form>
                </Modal.Content>
                <Modal.Actions >
                    <Button
                        color='green'
                        onClick={this.save}
                        loading={this.props.isCreatingPurchaseConfig}
                        inverted>
                        <Icon name='checkmark' /> Save
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }

    private toggleEmployee = (index) => {
        const employees = this.state.purchaseOpportunities.map((e, i) => i === index ? { ...this.state.purchaseOpportunities[i], selected: !this.state.purchaseOpportunities[i].selected } : this.state.purchaseOpportunities[i]);
        this.setState({ purchaseOpportunities: employees })
    };

    private inputChange = (event, { name, value }) => this.setState({  [name]: value });
    private inputDecimalChange = (event, { name, value }) => this.setState({  [name]: changeCommaForPunctuation(value) });

    private maxAmountInputChange = (index, event, { name, value }) => {
        const employees = this.state.purchaseOpportunities.map((e, i) => i === index ? { ...this.state.purchaseOpportunities[i], [name]: value } : this.state.purchaseOpportunities[i]);
        this.setState({ purchaseOpportunities: employees })
    };

    private toggleSelectAll = () => this.setState({ allSelected: !this.state.allSelected });
    private handleToggleChange = (event, { name }) => {
        this.setState({ [name]: !this.state[name] })
    };

    private save = () => {
        const editMode = this.props.location.pathname.endsWith("/edit");
        if (editMode) {
            this.props.updatePurchaseConfig({
                type: UPDATE_PURCHASE_CONFIG,
                id: this.props.purchaseConfig.id,
                sub_program_id: this.props.subProgramId,
                price: parseFloat(this.state.price),
                requireShareDepository: this.state.requireShareDepository,
                window_id: this.state.window_id === "no-exercise-windows" ? null : this.state.window_id,
                individual_purchase_config: this.state.purchaseOpportunities.map(({ selected, maxAmount, employee_id, document_id, id }) => ({
                    id,
                    selected: selected || this.state.allSelected,
                    maximumAmount: parseInt(maxAmount),
                    employee_id,
                    document_id,
                })),
            });
        } else {
            this.props.createPurchaseConfig({
                type: CREATE_PURCHASE_CONFIG,
                sub_program_id: this.props.subProgramId,
                price: parseFloat(this.state.price),
                requireShareDepository: this.state.requireShareDepository,
                window_id: this.state.window_id === "no-exercise-windows" ? null : this.state.window_id,
                individual_purchase_config: this.state.purchaseOpportunities.map(({ selected, maxAmount, employee_id, document_id }) => ({
                    selected: selected || this.state.allSelected,
                    maximumAmount: parseInt(maxAmount),
                    employee_id,
                    document_id,
                })),
            });
        }
    };

    private handleDocumentSelect = (index, event, { value }) => {
        const employees = this.state.purchaseOpportunities.map((e, i) => i === index ? { ...this.state.purchaseOpportunities[i], document_id: value } : this.state.purchaseOpportunities[i]);
        this.setState({ purchaseOpportunities: employees })
    };

    private handleWindowSelection = (event, { value }) => this.setState({ window_id: value });
}

export const windowOptions = (windows: Window[]): DropdownItemProps[] => [
    {
        key: "no-exercise-windows",
        value: "no-exercise-windows",
        text: "No exercise-windows"
    },
    ...windows.map((window) => ({
        key: window.id,
        value: window.id,
        text: `${window.start_time.format('lll')} - ${window.end_time.format('lll')}`
    }))
];

const mapStateToProps: MapStateToProps<StateProps, Props, RootState> = ({ file, program, exerciseWindow }): StateProps => {
    return ({
        documentOptions: file.documents.map((document) => ({ key: document.id, value: document.id, text: document.file_name })),
        isCreatingPurchaseConfig: program.isCreatingPurchaseConfig,
        purchaseWindows: exerciseWindow.allExerciseWindows.filter((w) => w.window_type === WindowType.PURCHASE && w.end_time.isAfter(moment())),
    });
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    createPurchaseConfig: (action: CreatePurchaseConfigAction) => dispatch (action),
    updatePurchaseConfig: (action: UpdatePurchaseConfigAction) => dispatch (action),
    closeModal: () => dispatch(push("/admin/awards")),
    fetchDocuments: () => dispatch({ type: FETCH_FILES }),
    fetchWindows: () => dispatch({ type: FETCH_WINDOW }),
});


export default connect<StateProps, DispatchProps, Props>(mapStateToProps, mapDispatchToProps)(PurchasePage);
