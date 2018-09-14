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
import { APIDocument } from "./files-reducer";
import FilesList from "./files-list";
import { Route, RouteComponentProps } from "react-router";
import { Employee } from "../employees/employee-reducer";
import AttachEmployeeModal, { AttachEmployeeData, } from "./attatch-employee/file-attatch-employee-modal";
import DetachEmployeeModal  from "./detach-employee/file-detatch-employee-modal";
import { push } from "react-router-redux";
import DeleteDocumentModal from "./delete-document/delete-file-modal";
import { EmployeeDocumentInput } from "./attatch-employee/file-attatch-employee-form";
import SpinnerFullScreen from "../common/components/spinner-full-screen";

interface DispatchProps {
    fetchFiles: () => void,
    uploadFiles: () => void,
    navigateToDetachEmployee: (employeeDocumentId: string) => void,
    deleteEmployeeDocumentAssociation: (employeeDocumentId: string) => void,
    deleteDocument: (documentId: string) => void,
    updateEmployeeDocumentsForFile: (documentId: string) => (updatedStatus: EmployeeDocumentInput[], document_header:string, message_header: string, message_body: string) => void,
}

interface StateProps {
    idToken: string,
    selectedTenant: Tenant,
    isLoading: boolean,
    isAttachingEmployee: boolean,
    isDeletingFile: boolean,
    employees: Employee[],
    documents: APIDocument[],
    isDeletingEmployeeAssociation: boolean,
}

interface OwnProps extends RouteComponentProps<any> {
}

type Props = OwnProps & DispatchProps & StateProps

class FilesManagementPage extends Component<Props, {}> {


    componentDidMount() {
        this.props.fetchFiles()
    }

    render() {
        if (this.props.isLoading) {
            return <SpinnerFullScreen active/>;
        }

        const attachLink = `${this.props.match.path}/attach`;
        const attachPath = `${attachLink}/:fileId`;

        const editLink = `${this.props.match.path}/edit`;
        const editPath = `${editLink}/:fileId`;

        const detachLink = `${this.props.match.path}/detach`;
        const detachPath = `${detachLink}/:employeeDocumentId`;

        const deleteLink = `${this.props.match.path}/delete`;
        const deletePath = `${deleteLink}/:documentId`;

        const uploadFilePath = `${this.props.match.path}/upload`;

        return (
            <div className="width-limit-small">
                <div className="block-xxs">
                    <form method="POST" encType="multipart/form-data">
                        <input type="file" name="file" multiple />
                        <button onClick={this.handleUpload}>Upload</button>
                    </form>
                </div>
                <FilesList
                    documents={this.props.documents}
                    attatchLink={attachLink}
                    editLink={editLink}
                    employees={this.props.employees}
                    detachEmployee={this.props.navigateToDetachEmployee}
                    deleteLink={deleteLink}
                />
                <Route path={attachPath} exact render={({ match }) => (
                    <AttachEmployeeModal
                        employees={this.props.employees}
                        onModalClose={this.onModalClose}
                        updateEmployeeDocumentsForFile={this.props.updateEmployeeDocumentsForFile(match.params["fileId"])}
                        documentId={match.params["fileId"]}
                        document={this.props.documents.filter((d) => d.id === match.params["fileId"])[0]}
                        isSubmitting={this.props.isAttachingEmployee}
                        fileName={fileNameForId(this.props.documents, match.params["fileId"])}
                    />
                )}
                />
                <Route path={detachPath} exact render={({ match }) => (
                    <DetachEmployeeModal
                        onModalClose={this.onModalClose}
                        isSubmitting={this.props.isDeletingEmployeeAssociation}
                        fileName={fileNameForEmployeeDocumentId(this.props.documents, match.params["employeeDocumentId"])}
                        detachEmployee={this.props.deleteEmployeeDocumentAssociation.bind(this, match.params["employeeDocumentId"])}
                    />
                )}
                />
                <Route path={deletePath} exact render={({ match }) => (
                    <DeleteDocumentModal
                        onModalClose={this.onModalClose}
                        affectedEmployees={this.affectedEmployees(match.params["documentId"])}
                        isSubmitting={this.props.isDeletingFile}
                        fileName={fileNameForId(this.props.documents, match.params["documentId"])}
                        confirmDelete={this.props.deleteDocument.bind(this, match.params["documentId"])}
                    />
                )}
                />
                <Route path={uploadFilePath} exact render={({ match }) => (
                    <AttachEmployeeModal
                        employees={this.props.employees}
                        onModalClose={this.onModalClose}
                        updateEmployeeDocumentsForFile={this.props.updateEmployeeDocumentsForFile(match.params["fileId"])}
                        documentId={match.params["fileId"]}
                        document={this.props.documents.filter((d) => d.id === match.params["fileId"])[0]}
                        isSubmitting={this.props.isAttachingEmployee}
                        fileName={fileNameForId(this.props.documents, match.params["fileId"])}
                    />
                )}
                />
            </div>
        )
    }

    private handleUpload = (e) => {
        e.preventDefault();
        this.props.uploadFiles();
    }

    private onModalClose = (event: SyntheticEvent<any>) => {
        event.preventDefault();
        this.props.history.push(this.props.match.path)
    }

    private affectedEmployees = (documentId: string): Employee[] => {
        const doc = this.props.documents.filter(d => documentId === d.id)[0];
        if (doc && doc.employee_documents) {
            return doc.employee_documents.map((ed) => this.props.employees.filter(e => e.id === ed.employee_id)[0]);
        }
        return [];
    }
}

const fileNameForId = (documents: APIDocument[], id: string) => {
    const found = documents.filter((d) => d.id === id)[0];
    return found ? found.file_name : "[Unknown file name]";
};

const fileNameForEmployeeDocumentId = (documents: APIDocument[], employeeDocumentId: string) => {
    const found = documents.filter((d) => d.employee_documents.filter(ed => ed.id === employeeDocumentId))[0];
    return found ? found.file_name : "[Unknown file name]";
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state): StateProps => {
    return ({
        idToken: token(state),
        selectedTenant: tenant(state),
        isLoading: state.file.isLoading || state.file.isFetchingDocumentsAndEmployees,
        documents: state.file.documents,
        employees: state.employee.allEmployees,
        isAttachingEmployee: state.file.isAttachingEmployee,
        isDeletingEmployeeAssociation: state.file.isDeletingEmployeeAssociation,
        isDeletingFile: state.file.isDeletingFile,
    })
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchFiles: () => dispatch({ type: FETCH_EMPLOYEES_AND_FILES }),
    uploadFiles: () => dispatch({ type: UPLOAD_FILES }),
    updateEmployeeDocumentsForFile: (documentId: string) =>
        (updatedStatus: EmployeeDocumentInput[], document_header: string, message_header: string, message_body: string) =>
            dispatch({ type: UPDATE_EMPLOYEE_DOCUMENTS_FOR_FILE, documentId, updatedStatus, message_header, message_body, document_header }),
    navigateToDetachEmployee: (employeeDocumentId: string) => dispatch(push(`/admin/files/detach/${employeeDocumentId}`)),
    deleteEmployeeDocumentAssociation: (employeeDocumentId: string) => dispatch({ type: DELETE_EMPLOYEE_ASSOCIATION, employeeDocumentId }),
    deleteDocument: (documentId: string) => dispatch({ type: DELETE_DOCUMENT, documentId }),
});

const ConnectedComponent = connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, mapDispatchToProps)(FilesManagementPage);

export default ConnectedComponent;
