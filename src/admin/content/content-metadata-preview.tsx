import React, { StatelessComponent } from "react";
import { Content } from "./content-reducer";
import { Link } from "react-router-dom";

interface Props extends Content {
    editLink: string
}

const ContentMetadataPreview: StatelessComponent<Props> = ({ name, editLink }) => (
    <div className="block-m">
        <div>Name: {name} <Link to={editLink}>Edit</Link></div>
    </div>
);

export default ContentMetadataPreview;
