import React, { Component } from "react";
import { Form, Button } from "semantic-ui-react";

interface Props {
    textKey: string,
    textValue: string,
    defaultValue?: string,
    closeModal: () => void,
    editText: (key: string, value: string) => void
    deleteText?: () => void
}

interface State {
    key: string,
    value: string
}

class TextEditModal extends Component<Props, State> {

    state = {
        key: this.props.textKey,
        value: this.props.textValue
    };

    render() {
        const { key, value } = this.state;

        return (
            <div>
                <div className='form-greyscale'>
                    <Form size={'large'}>
                        <Form.Field width={10}>
                            <label>{key}</label>
                            <Form.TextArea placeholder='Text value' value={value} name={'value'} onChange={this.handleInputChange}/>
                        </Form.Field>
                        {
                            this.props.defaultValue &&
                            <a href="javascript:void(0)" onClick={this.setDefault}>Insert default text</a>
                        }
                        <div className='text-center'>
                            <Button.Group>
                                { this.props.deleteText && <Button negative type='button' onClick={this.props.deleteText}>Delete Text</Button> }
                                <Button type='button' onClick={this.props.closeModal}>Cancel</Button>
                                <Button positive type='button' onClick={this.postText}>Save Text</Button>
                            </Button.Group>
                        </div>
                    </Form>
                </div>
            </div>
        )
    }

    private handleInputChange = (event, { name, value }) => {
        this.setState({ [name]: value })
    };

    private postText = () => {
        const { key, value } = this.state;

        this.props.editText(key, value);
    };

    private setDefault = () => this.setState({ value: this.props.defaultValue });
}

export default TextEditModal;