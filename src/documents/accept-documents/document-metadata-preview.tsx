import React, { StatelessComponent } from "react";
import { APIEmployeeDocument } from "../../files/files-reducer";
import { Link } from "react-router-dom"
import { Button, Icon } from "semantic-ui-react";
import "./document-metadata-preview.less";

interface Props {
    downloadClicked: () => void,
    fileName: string,
    id: string,
    downloadLink: string,
}

const DocumentMetadataPreview: StatelessComponent<Props> = (d) => (
    <div key={d.id} className="block-m text-center margin-top-m">
        <Link to={d.downloadLink} target="_blank" onClick={d.downloadClicked} className="document-metadata-big-link">
        <div className="block-s">
            <Icon name={"file pdf outline"} size={"huge"}></Icon>
        </div>
        <h4 className="block-s">{d.fileName}</h4>
        {/*<Button onClick={this.props.downloadFile.bind(this, d.downloadLink)} >Download</Button>*/}
        <div className="block-s"><Link to={d.downloadLink} target="_blank" onClick={d.downloadClicked}>Download file</Link></div>
        </Link>
    </div>
);

export default DocumentMetadataPreview;
