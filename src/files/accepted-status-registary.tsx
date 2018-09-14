import React, { Component, SyntheticEvent } from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { token } from "../awards/award-selectors";
import { tenant } from "../tenant/tenant-selectors";
import { Tenant } from "../tenant/tenant-reducer";
import {
    ATTACH_EMPLOYEE_TO_FILE,
    DELETE_DOCUMENT,
    DELETE_EMPLOYEE_ASSOCIATION,
    FETCH_EMPLOYEES_AND_FILES,
    UPDATE_EMPLOYEE_DOCUMENTS_FOR_FILE,
    UPLOAD_FILES
} from "./files-actions";
import { RootState } from "../reducers/all-reducers";
import { Dimmer, Loader, Menu, Table } from "semantic-ui-react";
import { RouteComponentProps } from "react-router";
import { AttachEmployeeData, } from "./attatch-employee/file-attatch-employee-modal";
import { push } from "react-router-redux";
import { EmployeeDocumentInput } from "./attatch-employee/file-attatch-employee-form";
import {handleSortFunction, SortState} from "../utils/sort";
import {allDocumentsAcceptanceStatus, DocumentAcceptanceStatus} from "./files-selectors";
import {yesOrNo} from "../utils/utils";
import moment from "moment";
import SpinnerFullScreen from "../common/components/spinner-full-screen";

interface DispatchProps {
    fetchFiles: () => void,
}

interface StateProps {
    statusLines: DocumentAcceptanceStatus[],
    isLoading: boolean,
}

type Props = DispatchProps & StateProps

interface State extends SortState {
    data: DocumentAcceptanceStatus[],
}

class AcceptedStatusPage extends Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            column: null,
            data: this.props.statusLines,
            direction: "ascending"
        }
    }

    componentDidMount() {
        this.props.fetchFiles()
    }

    componentWillReceiveProps(props: Props) {
        if (this.props.statusLines !== props.statusLines) {
            this.setState({ data: props.statusLines });
        }
    }

    handleSort = clickedColumn => () => {
        this.setState(handleSortFunction(clickedColumn, this.state));
    };

    render() {
        console.log(this.state.data);
        if (this.props.isLoading) {
            return <SpinnerFullScreen active/>;
        }

        return (
            <div className="width-limit-small">
                <div className="block-m">
                    <h2>Acceptance status</h2>
                    <Table celled padded sortable compact={"very"}>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell onClick={this.handleSort("employeeName")}>Name</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort("employeeEmail")}>Email</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort("fileName")}>File Name</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort("requiresAcceptance")}>Requires acceptance</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort("acceptedAt")}>Accepted At</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {
                                this.state.data.map((line, index) => (
                                    <Table.Row key={line.id}>
                                        <Table.Cell>{line.employeeName}</Table.Cell>
                                        <Table.Cell>{line.employeeEmail}</Table.Cell>
                                        <Table.Cell>{line.fileName}</Table.Cell>
                                        <Table.Cell>{yesOrNo(line.requiresAcceptance)}</Table.Cell>
                                        <Table.Cell>{line.acceptedAt ? moment(line.acceptedAt).format('DD.MM.YY HH:mm') : "Not accepted"}</Table.Cell>
                                    </Table.Row>
                                ))
                            }
                        </Table.Body>
                    </Table>
                </div>
            </div>
        )
    }
}

const mapStateToProps: MapStateToProps<StateProps, null, RootState> = (state): StateProps => {
    return ({
        statusLines: allDocumentsAcceptanceStatus(state),
        isLoading: state.file.isLoading || state.file.isFetchingDocumentsAndEmployees,
    })
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchFiles: () => dispatch({ type: FETCH_EMPLOYEES_AND_FILES }),
});

const ConnectedComponent = connect<StateProps, DispatchProps, null, RootState>(mapStateToProps, mapDispatchToProps)(AcceptedStatusPage);

export default ConnectedComponent;
