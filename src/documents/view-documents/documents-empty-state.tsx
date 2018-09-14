import React, { StatelessComponent } from "react";
import { Message } from "semantic-ui-react";

const DocumentsEmptyState: StatelessComponent = () => (
    <div className="text-content-center">
        <Message
            header='No documents'
            content='Documents related to your instruments will appear here.'
        />
    </div>
);

export default DocumentsEmptyState;
