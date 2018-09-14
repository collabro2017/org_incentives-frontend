import React, { Component } from "react";
import { Form, Button } from "semantic-ui-react";

interface Props {
    closeForm: () => void,
    addNewText: (key: string, value: string) => void
}

interface State {
    key: string,
    value: string
}

class NewText extends Component<Props, State> {

    state = {
        key: '',
        value: ''
    };

    render() {
        const { key, value } = this.state;

        return (
            <div className="width-limit">
                <div className='form-greyscale'>
                    <Form size={'large'}>
                        <Form.Field width={10}>
                            <label>Key</label>
                            <Form.Input placeholder='Text key' value={key} name={'key'} onChange={this.handleInputChange}/>
                        </Form.Field>
                        <Form.Field width={10}>
                            <label>Value</label>
                            <Form.Input placeholder='Text value' value={value} name={'value'} onChange={this.handleInputChange}/>
                        </Form.Field>
                        <div className='text-center'>
                            <Button.Group>
                                <Button type='button' onClick={this.props.closeForm}>Cancel</Button>
                                <Button.Or/>
                                <Button positive type='submit' onClick={this.postText}>Save Text</Button>
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

        this.props.addNewText(key, value);
    }
}

export default NewText;