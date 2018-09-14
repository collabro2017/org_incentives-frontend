import React, { Component } from "react";
import { Header, Icon, Modal, Button, Message } from "semantic-ui-react";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import { RootState } from "../../reducers/all-reducers";
import { APIEmployeeDocument } from "../../files/files-reducer";
import { Link } from "react-router-dom";
import { API_ROOT } from "../../env";
import { FILE_DOWNLOAD, MARK_DOCUMENT_AS_READ } from "../../files/files-actions";
import DocumentMetadataPreview from "./document-metadata-preview";
import { replace } from "react-router-redux";
import { documentsRequiringAcceptance } from "../documents-selectors";
import {injectIntl, InjectedIntlProps, FormattedHTMLMessage} from "react-intl";
import Content from "../../texts/content";

interface StateProps {
    documents: APIEmployeeDocument[],
    isAcceptingDocument: boolean,
    documentFeatureActivated: boolean,
    currentDocumentIndex: number,
    companyName: string,
    tenantId: string,
}

interface DispatchProps {
    redirectToRoot: () => void,
    markDocumentAsRead: (documentId: string) => void,
}

type Props = StateProps & DispatchProps;

class AcceptDocumentsModal extends Component<Props & InjectedIntlProps> {
    state = {
        waitingForUserToOpenDocument: true,
    };

    componentWillReceiveProps(newProps: Props) {
        if (newProps.currentDocumentIndex !== this.props.currentDocumentIndex) {
            this.setState({ waitingForUserToOpenDocument: true });
        }
    }
    render() {
        if (!this.props.documentFeatureActivated || !this.props.documents || this.props.documents.length === 0) {
            return null;
        }

        const isAllDocumentsAccepted = this.props.currentDocumentIndex === this.props.documents.length;
        const multipleDocuments = this.props.documents.length > 1;
        const { companyName, tenantId, intl: { formatMessage } } = this.props;
        const currentDocument = this.props.documents[this.props.currentDocumentIndex];
        return (
            <Modal open closeIcon={<Icon name="close" />} onClose={this.props.redirectToRoot} >
                <Header content={`${formatMessage({ id: 'acceptdocuments.modal.title'})}${currentDocument && currentDocument.document_header ? `: ${currentDocument.document_header}` : ''} ${multipleDocuments ? `(${this.props.currentDocumentIndex + 1 } / ${this.props.documents.length})` : ''}`} textAlign={"center"}/>
                <Modal.Content>
                    {
                        isAllDocumentsAccepted ?
                            <div className="block-m text-center margin-top-m">
                                <Icon name='check circle' color="green" size={"huge"} />
                                <h2 className="block-s"><Content id={'acceptdocuments.modal.accepted.title'}/></h2>
                                <p><Content id={'acceptdocuments.modal.accepted.content'}/></p>
                            </div>
                            :
                            <div>
                                <div className="block-m">
                                    <DocumentMetadataPreview {...currentDocument} downloadClicked={() => this.setState({ waitingForUserToOpenDocument: false })}/>
                                </div>
                                {
                                    formatMessage({ id: 'acceptdocuments.modal.info.header'}) !== 'acceptdocuments.modal.info.header' &&
                                    <div className="text-content-center block-xs">
                                        <Message>
                                            <Message.Header><Content id='acceptdocuments.modal.info.header'/></Message.Header>
                                            <Message.Content>
                                                <Content id='acceptdocuments.modal.info.content'/>
                                            </Message.Content>
                                        </Message>

                                    </div>
                                }
                                {
                                    (currentDocument.message_header || currentDocument.message_body) &&
                                    <div className="text-content-center block-xs">
                                        <Message>
                                            <Message.Header>
                                                <div dangerouslySetInnerHTML={{ __html: currentDocument.message_header}}/>
                                            </Message.Header>
                                            <Message.Content>
                                                <div dangerouslySetInnerHTML={{ __html: currentDocument.message_body}}/>
                                            </Message.Content>
                                        </Message>
                                    </div>
                                }
                            </div>
                    }
                </Modal.Content>
                <Modal.Actions >
                    {
                        isAllDocumentsAccepted ?
                            <div className="text-center">
                                <Button
                                    color='green'
                                    onClick={this.props.redirectToRoot}
                                >
                                    Proceed to the portal
                                </Button>
                            </div> :
                            <div className="text-center">
                                <Button
                                    color={this.state.waitingForUserToOpenDocument ? null : 'green'}
                                    disabled={this.state.waitingForUserToOpenDocument}
                                    onClick={this.props.markDocumentAsRead.bind(this, this.props.documents[this.props.currentDocumentIndex].id)}>
                                    <Icon name='checkmark' loading={this.props.isAcceptingDocument}/> { this.props.isAcceptingDocument ? "Accepting..." : "Accept document and proceed"}
                                </Button>
                            </div>
                    }

                </Modal.Actions>
            </Modal>
        )
    }
}

const mapStateToProps: MapStateToProps<StateProps, null, RootState> = ({ user, features }) => ({
    documents: user.documentsNeedingAcceptance,
    tenantId: user.tenant && user.tenant.id,
    isAcceptingDocument: user.isAcceptingDocument,
    currentDocumentIndex: user.currentDocumentIndex,
    documentFeatureActivated: !!features.documents,
    companyName: user.tenant && user.tenant.name,
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, null> = (dispatch => ({
    redirectToRoot: () => dispatch(replace("/")),
    markDocumentAsRead: (documentId: string) => dispatch({ type: MARK_DOCUMENT_AS_READ, documentId })
}));

export default connect<StateProps, DispatchProps, null, RootState>(mapStateToProps, mapDispatchToProps)(injectIntl<Props>(AcceptDocumentsModal));
