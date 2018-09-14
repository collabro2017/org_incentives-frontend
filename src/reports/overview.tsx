import React, { Component, StatelessComponent } from 'react';
import { Agreement, Entity, ExternalParameters, OptionPlan } from "../data/data";
import { Icon, Label, Menu, Table, Button, Header, Modal, Form, Checkbox } from 'semantic-ui-react';
import moment, { Moment } from 'moment';
import numeral from "numeral";

type TerminateAgreement = (person: string, terminationDate: Moment) => void;

interface EntityOverviewProps {
    entity: Entity;
    showPlanReport: (plan: OptionPlan) => void;
    terminateAgreement: TerminateAgreement;
}

class Overview extends Component<EntityOverviewProps, any> {
    state = {}

    render() {
        const { entity } = this.props;
        const agreement = entity.optionPlans[0].agreements[0];
        return (
            <div className="main-content">
                <h1 style={{ textAlign: 'center', margin: '3rem' }}>{entity.name}</h1>
                {
                    entity.optionPlans.map((plan) => <OptionPlan plan={plan}
                                                                 generateReport={this.props.showPlanReport.bind(this, plan)} terminateAgreement={this.props.terminateAgreement} />)
                }
            </div>
        );
    }


}

interface OptionPlanProps {
    plan: OptionPlan,
    generateReport: () => void,
    terminateAgreement: TerminateAgreement;
}

const OptionPlan: StatelessComponent<OptionPlanProps> = ({ plan, generateReport, terminateAgreement }) => (
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h2 style={{ display: "inline-block" }}>{plan.name}</h2>
            <Button onClick={generateReport}>Generate Report</Button>
        </div>
        <Table celled>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Position</Table.HeaderCell>
                    <Table.HeaderCell>Quantity</Table.HeaderCell>
                    <Table.HeaderCell>Termination</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {
                    plan.agreements.map((agreement) => <OptionOverviewRow agreement={agreement}
                                                                          registerTermination={terminateAgreement.bind(this, agreement.person)} />)
                }
            </Table.Body>
        </Table>
    </div>
);


interface OptionOverviewRowProps {
    agreement: Agreement,
    registerTermination: (terminationDate: Moment) => void;
}

class OptionOverviewRow extends Component<OptionOverviewRowProps, any> {
    state = {
        terminationDate: ''
    };

    render() {
        const { agreement } = this.props;
        return (
            <Table.Row negative={!!agreement.termination}>
                <Table.Cell>{agreement.person}</Table.Cell>
                <Table.Cell>{agreement.position}</Table.Cell>
                <Table.Cell>{numeral(agreement.amount).format('0,0')}</Table.Cell>
                <Table.Cell>
                    {
                        agreement.termination ?
                            moment(agreement.termination).format("DD.MM.YYYY") :
                            <Modal trigger={<Button basic color='grey'>Resitrer terminering</Button>}>
                                <Modal.Header>Sett termineringsdato for {agreement.person}</Modal.Header>
                                <Modal.Content>
                                    <Modal.Description>
                                        <Form>
                                            <Form.Field>
                                                <label>Termineringsdato (DD.MM.ÅÅÅÅ)</label>
                                                <input placeholder='DD.MM.ÅÅÅÅ' onChange={this.onDateChanged} />
                                            </Form.Field>
                                            <Button type='submit' onClick={this.registerTermination}>Submit</Button>
                                        </Form>
                                    </Modal.Description>
                                </Modal.Content>
                            </Modal>
                    }
                </Table.Cell>
            </Table.Row>
        );
    }

    private registerTermination = () => this.props.registerTermination(moment(this.state.terminationDate, "DD.MM.YYYY"));
    private onDateChanged = (e: React.FormEvent<HTMLInputElement>) => this.setState({ terminationDate: e.currentTarget.value });
}

export default Overview;
