import React, { Component, SyntheticEvent } from "react";
import { countryOptions, fileTypeOptions } from "../../data/common";
import { DropdownItemProps, Header, Icon, Modal, Button } from "semantic-ui-react";
import { APIDocument, FileType } from "../files-reducer";
import { employeeOptions } from "../../awards/awards-management-page";
import AttatchEmployeeForm from "./file-attatch-employee-form";
import { Employee } from "../../employees/employee-reducer";
import moment, { Moment } from "moment";
import { sortAlphabetically } from "../../utils/utils";

interface Props {
    employees: Employee[],
    onModalClose: (event: SyntheticEvent<any>) => void,
    updateEmployeeDocumentsForFile: (updatedStatus: EmployeeDocumentInput[], document_header: string, message_header: string, message_body: string) => void,
    documentId: string,
    isSubmitting: boolean,
    fileName: string,
    document: APIDocument,
}

export interface FileAttatchEmployeeFormData {
    employee?: string,
    requiresAcceptance: boolean,
    type?: string
}

export interface AttachEmployeeData {
    document_id: string
    employee_id: string,
    requires_acceptance: boolean,
}

interface EmployeeDocumentInput {
    selected: boolean,
    requires_acceptance: boolean,
    employee_id: string,
    employee_name: string,
    acceptedAt?: string,
}

interface State {
    allSelected: boolean,
    employeeDocuments: EmployeeDocumentInput[],
    document_header: string,
    message_header: string,
    message_body: string,
}


class AttachEmployeeModal extends Component<Props, State> {
    state = {
        allSelected: false,
        employeeDocuments: this.props.employees.map((employee) => {
            const { document } = this.props;
            console.log(document)
            const existingEmployeeDocument = document && document.employee_documents && document.employee_documents.filter((ed) => ed.employee_id == employee.id)[0];
            if (existingEmployeeDocument) {
                return {
                    editMode: true,
                    employeeDocumentId: existingEmployeeDocument.id,
                    selected: true,
                    requires_acceptance: existingEmployeeDocument.requires_acceptance,
                    acceptedAt: existingEmployeeDocument.accepted_at,
                    employee_id: employee.id,
                    employee_name: `${employee.firstName} ${employee.lastName}`
                }
            }

            return {
                editMode: false,
                selected: false,
                requires_acceptance: true,
                employee_id: employee.id,
                employee_name: `${employee.firstName} ${employee.lastName}`
            }
        }).sort(sortAlphabetically("employee_name")),
        document_header: this.props.document && this.props.document.document_header ? this.props.document.document_header : '',
        message_header: this.props.document && this.props.document.message_header ? this.props.document.message_header : '',
        message_body: this.props.document && this.props.document.message_body ? this.props.document.message_body : '',
    };

    render() {
        const { employees, isSubmitting, onModalClose, fileName } = this.props;
        const { message_body, message_header, document_header } = this.state;

        return (
            <Modal open closeIcon={<Icon className="close icon" />} onClose={onModalClose}>
                <Header content={`Attatch employee to file: ${fileName}`}/>
                <Modal.Content>
                    <AttatchEmployeeForm
                        employeeDocuments={this.state.employeeDocuments}
                        toggleEmployee={this.toggle.bind(this, "selected")}
                        toggleRequiresAcceptance={this.toggle.bind(this, "requires_acceptance")}
                        toggleSelectAll={this.toggleSelectAll}
                        allSelected={this.state.allSelected}
                        handleInputChange={this.handleInputChange}
                        message_body={message_body}
                        message_header={message_header}
                        document_header={document_header}
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button basic onClick={onModalClose}>
                        <Icon name='remove' /> Cancel
                    </Button>
                    <Button color='green' inverted onClick={this.save} loading={isSubmitting}>
                        <Icon name='checkmark' /> Attatch
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }

    private save = () => this.props.updateEmployeeDocumentsForFile(this.state.employeeDocuments, this.state.document_header, this.state.message_header, this.state.message_body);

    private toggle = (key, index) => {
        const employees = this.state.employeeDocuments.map((e, i) => i === index ? { ...this.state.employeeDocuments[i], [key]: !this.state.employeeDocuments[i][key] } : this.state.employeeDocuments[i]);
        this.setState({ employeeDocuments: employees })
    };

    private toggleSelectAll = () => {
        const { employeeDocuments } = this.state;
        if (employeeDocuments.every(e => e.selected)) {
            const newState = this.state.employeeDocuments.map((e) => ({ ...e, selected: false }));
            this.setState({ employeeDocuments: newState});
        } else {
            const newState = this.state.employeeDocuments.map((e) => ({ ...e, selected: true }));
            this.setState({ employeeDocuments: newState });
        }
    };

    private handleInputChange = (event, { name, value }) => {
        this.setState({ [name]: value })
    };
}

export default AttachEmployeeModal;
