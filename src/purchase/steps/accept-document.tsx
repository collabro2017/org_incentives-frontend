import React, { StatelessComponent } from "react";
import Content from "../../texts/content";
import { Button } from "semantic-ui-react";
import DocumentMetadataPreview from "../../documents/accept-documents/document-metadata-preview";
import { DocumentMetadata } from "../duck/purchase-reducer";
import { capitalizeFirstLetter } from "../../utils/utils";
import { TextTerm } from "../../utils/text-mappings";

interface Props {
    goBack: () => void,
    goForward: () => void,
    downloadClicked: () => void
    enableProceedButton: boolean,
    instrumentTerm: TextTerm
    document: DocumentMetadata,
}

const AcceptDocument: StatelessComponent<Props> = ({ goBack, goForward, downloadClicked, enableProceedButton, document, instrumentTerm }) => (
    <div>
        <div className="section-container block-l">
            <h2 className="text-center block-m">
                <Content id="purchase.acceptdocument.header" />
            </h2>
            <div className="block-m">
                <DocumentMetadataPreview
                    id={document.id}
                    downloadLink={document.downloadLink}
                    fileName={document.fileName}
                    downloadClicked={downloadClicked}/>
            </div>
        </div>
        <div className="section-container page-action-container text-center">
            <Button content='Back' size="big" onClick={goBack} />
            <Button positive={enableProceedButton} disabled={!enableProceedButton} content='Accept and proceed' icon='right arrow' labelPosition='right' size="big" onClick={goForward} />
        </div>
    </div>
);

export default AcceptDocument;
