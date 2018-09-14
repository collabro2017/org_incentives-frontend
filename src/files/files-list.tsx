import React, { Component } from 'react';
import { Button, Table } from "semantic-ui-react";
import { APIDocument } from "./files-reducer";
import { Link } from "react-router-dom";
import moment from "moment";
import { Employee } from "../employees/employee-reducer";

interface Props {
    documents: APIDocument[],
    employees: Employee[],
    attatchLink: string,
    editLink: string,
    deleteLink: string,
    detachEmployee: (employeeDocumentId: string) => void,
}

class FilesList extends Component<Props, {}> {
    render() {
        return (
            <div className="width-limit-small">
                <Table celled padded>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>File name</Table.HeaderCell>
                            <Table.HeaderCell>Employee status</Table.HeaderCell>
                            <Table.HeaderCell></Table.HeaderCell>
                            <Table.HeaderCell></Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {
                            this.props.documents.map((d) => ({ ...d, hasEmployeesAttached: d.employee_documents && d.employee_documents.length > 0 })).map((document) => (
                                    <Table.Row key={document.id}>
                                        <Table.Cell>{document.file_name}</Table.Cell>
                                        <Table.Cell>{document.hasEmployeesAttached ? `${document.employee_documents.length} employees use this file` : 'No employees use this file'}</Table.Cell>
                                        <Table.Cell>
                                            <Link to={`${this.props.attatchLink}/${document.id}`}>{document.hasEmployeesAttached ? 'View / Edit' : 'Attach employees'}</Link>
                                        </Table.Cell>
                                        <Table.Cell singleLine>
                                            {
                                                <Link to={`${this.props.deleteLink}/${document.id}`}>Delete file</Link>
                                            }
                                        </Table.Cell>
                                    </Table.Row>
                                )
                            )
                        }
                    </Table.Body>
                </Table>
            </div>
        )
    }
}

export default FilesList;
