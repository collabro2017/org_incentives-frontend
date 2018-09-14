import React, { Component, SyntheticEvent } from "react";
import { DropdownItemProps, Form, Dropdown, Checkbox, Table } from "semantic-ui-react";
import { Employee } from "../../employees/employee-reducer";
import moment from "moment";

interface Props {
    employeeDocuments: EmployeeDocumentInput[],
    toggleEmployee: (index: number) => void,
    toggleRequiresAcceptance: (index: number) => void,
    toggleSelectAll: () => void,
    allSelected: boolean,
    document_header: string,
    message_header: string,
    message_body: string,
    handleInputChange: (event, any) => void,
}

export interface EmployeeDocumentInput {
    editMode: boolean,
    employeeDocumentId?: string,
    selected: boolean,
    requires_acceptance: boolean,
    employee_id: string,
    employee_name: string,
}

class AttachEmployeeForm extends Component<Props> {

    render() {
        const { message_header, message_body, document_header, handleInputChange } = this.props;
        return (
            <Form size={"large"}>
                <div>
                    <Form.Field width={10}>
                        <label>Document header (shown after 'Requires action:' in the accept document popup)</label>
                        <Form.Input placeholder='For example "New Grant"' value={document_header} name={'document_header'} onChange={handleInputChange}/>
                    </Form.Field>
                    <Form.Field width={10}>
                        <label>Message header (shown in employee portal in the accept document popup)</label>
                        <Form.Input placeholder='Message header' value={message_header} name={'message_header'} onChange={handleInputChange}/>
                    </Form.Field>
                    <Form.Field width={10}>
                        <label>Message body (shown in employee portal in the accept document popup)</label>
                        <Form.Input placeholder='Message body' value={message_body} name={'message_body'} onChange={handleInputChange}/>
                    </Form.Field>
                </div>
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell><Checkbox onChange={this.props.toggleSelectAll} checked={this.props.allSelected} /></Table.HeaderCell>
                            <Table.HeaderCell>Employee</Table.HeaderCell>
                            <Table.HeaderCell>Requires acceptance?</Table.HeaderCell>
                            <Table.HeaderCell>Accepted at</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {
                            this.props.employeeDocuments.map((ed, index) => (
                                <Table.Row key={ed.employee_id}>
                                    <Table.Cell>{<Checkbox onChange={this.props.toggleEmployee.bind(this, index)} checked={this.props.employeeDocuments[index].selected} />}</Table.Cell>
                                    <Table.Cell>{ed.employee_name}</Table.Cell>
                                    <Table.Cell><Checkbox onChange={this.props.toggleRequiresAcceptance.bind(this, index)} checked={this.props.employeeDocuments[index].requires_acceptance} /></Table.Cell>
                                    <Table.Cell singleLine>{this.renderAcceptedAtCell(ed) }</Table.Cell>
                                </Table.Row>
                            ))
                        }
                    </Table.Body>
                </Table>
            </Form>
        )
    }

    private renderAcceptedAtCell = (employeeDocument) => {
        console.log(employeeDocument)
        const { acceptedAt, editMode } = employeeDocument;

        if (!editMode) {
            return null;
        }

        return acceptedAt ? moment(acceptedAt).format('DD.MM.YY HH:mm') : "Not accepted"
    }
}

export default AttachEmployeeForm;
