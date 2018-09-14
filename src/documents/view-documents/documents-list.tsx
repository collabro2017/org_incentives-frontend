import React, { StatelessComponent } from "react";
import moment from "moment";
import { Table, Icon } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { APIEmployeeDocument } from "../../files/files-reducer";
import {sortBy} from "../../utils/sort";

interface Props {
    documents: APIEmployeeDocument[]
    markDocumentAsRead: (documentId: string) => void,
}

const DocumentsList: StatelessComponent<Props> = ({ markDocumentAsRead, documents }) => (
    <div className="center-center">
        <Table collapsing>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>File name</Table.HeaderCell>
                    <Table.HeaderCell/>
                    <Table.HeaderCell/>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {
                    sortBy('fileName', documents).map((d) => (
                        <Table.Row>
                            <Table.Cell><Icon name={"file pdf outline"} size={"large"} /> {d.fileName}</Table.Cell>
                            <Table.Cell>
                                {
                                    d.requires_acceptance && !d.accepted_at &&
                                        <a onClick={markDocumentAsRead.bind(this, d.id)}
                                           href="javascript:void(0)">
                                            Mark as accepted
                                        </a>
                                }
                                {
                                    d.accepted_at &&
                                        <span>
                                            Accepted, {moment(d.accepted_at).format('DD.MM.YY HH:mm')}
                                        </span>
                                }
                            </Table.Cell>
                            <Table.Cell><Link to={d.downloadLink} target="_blank">Download</Link></Table.Cell>
                        </Table.Row>
                    ))
                }
            </Table.Body>
        </Table>
    </div>
);

export default DocumentsList;
