import React, { Component } from "react";
import { Content } from "./content-reducer";
import { ContentUpdateObject } from "./content-saga";
import { Link } from "react-router-dom";
import ReactQuill  from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from "semantic-ui-react";
import './content.less';

interface Props extends Content {
    save: (content: ContentUpdateObject) => void
    backLink: string
}

interface State {
    content: string,
    pristine: boolean,
}

class ContentEdit extends Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = { content: this.props.raw_content, pristine: true };
        this.handleChange = this.handleChange.bind(this)
    }


    render() {
        const { backLink, name } = this.props;
        return (
            <div className="content-edit-container">
                <h2>{name}</h2>
                <div className="block-m">
                    <ReactQuill value={this.state.content}
                                onChange={this.handleChange} />
                </div>
                <Link to={backLink}><Button>Back</Button></Link>
                <Button onClick={this.save} disabled={this.state.pristine} positive={!this.state.pristine}>Save</Button>
            </div>
        )
    }

    private handleChange = (value) => this.setState({ content: value, pristine: false });

    private save = () => this.props.save({ raw_content: this.state.content });
}

export default ContentEdit;
