import React, { Component } from 'react';
import { Loader, Icon, Table } from "semantic-ui-react";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import { RootState } from "../../reducers/all-reducers";
import { FETCH_DOCUMENTS, MARK_DOCUMENT_AS_READ } from "../../files/files-actions";
import { APIEmployeeDocument } from "../../files/files-reducer";
import DocumentsList from "./documents-list";
import DocumentsEmptyState from "./documents-empty-state";

interface State {
}

interface StateProps {
    isFetchingDocuments: boolean,
    documents: APIEmployeeDocument[],
}

interface DispatchProps {
    fetchDocuments: () => void,
    markDocumentAsRead: (documentId: string) => void,
}

type Props = StateProps & DispatchProps;

class DocumentsPage extends Component<Props, State> {
    componentDidMount() {
        this.props.fetchDocuments();
    }

    render() {

        if (this.props.isFetchingDocuments) {
            return (
                <div className="loader-container"><Loader active={true} size='big'/></div>
            )
        }

        return (
            <div className="main-content">
                <h1 className="block-m">Documents</h1>
                {
                    this.props.documents.length > 0 ?
                        <DocumentsList documents={this.props.documents} markDocumentAsRead={this.props.markDocumentAsRead}/>
                        :
                        <DocumentsEmptyState/>
                }
            </div>
        );
    }
}

const mapStateToProps: MapStateToProps<StateProps, null, RootState> = ({ document }): StateProps => ({
    isFetchingDocuments: document.isFetchingDocuments,
    documents: document.documents,
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, null> = (dispatch): DispatchProps => ({
    fetchDocuments: () => dispatch({ type: FETCH_DOCUMENTS }),
    markDocumentAsRead: (documentId: string) => dispatch({ type: MARK_DOCUMENT_AS_READ, documentId })
});

export default connect(mapStateToProps, mapDispatchToProps)(DocumentsPage);
