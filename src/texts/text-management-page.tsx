import React, { Component } from "react";
import { connect, MapStateToProps } from "react-redux";
import { Dimmer, Loader, Button, Modal, Message } from "semantic-ui-react";
import AllTexts from "./all-texts";
import NewText from "./new-text";
import TextEditModal from "./text-edit-modal";
import { Text, TextObject } from "./text-reducer";
import { FETCH_TEXTS, PUT_TEXT } from "./text-actions";
import { RootState } from "../reducers/all-reducers";

interface StateProps {
    texts: TextObject,
    isFetching: boolean
}

interface DispatchProps {
    fetchTexts: () => void,
    deleteText: (key: string) => void,
    putText: (key: string, value: string) => void,
    editText: (key: string, value: string) => void
}

interface State {
    showForm: boolean,
    editModal: boolean,
    selectedKey?: string,
    selectedValue?: string
}

type Props = StateProps & DispatchProps

class TextManagementPage extends Component<Props, State> {

    state = {
        showForm: false,
        editModal: false,
        selectedKey: null,
        selectedValue: null
    };

    componentDidMount() {
        this.props.fetchTexts();
    }

    render() {

        const { isFetching, texts } = this.props;

        if (isFetching) {
            return (
                <div className="loader-full-screen">
                    <Dimmer active={isFetching}>
                        <Loader size="big" />
                    </Dimmer>
                </div>
            )
        }

        if (!this.state.showForm && !isFetching && !texts) {
            return (
                <div className="text-content-center">
                    <Message
                        header='You have no texts yet'
                        content='When you create texts for your clients, they will appear here.'
                    />
                    <div className='text-center'>
                        <Button primary basic onClick={this.openTextForm}>
                            <i className="plus icon" />
                            New Text
                        </Button>
                    </div>
                </div>
            )
        }

        return (
            <div>
                {
                    this.state.showForm ?
                        <div className='block-m text-center'>
                            <h2 className="text-center block-xs">Add Texts</h2>
                            <p className="text-content">Register all texts for your tenants here...</p>
                        </div>
                        :
                        <div className="width-limit block-s">
                            <h2 className="text-center">Texts</h2>
                        </div>
                }
                {
                    texts && !this.state.showForm && !this.state.editModal ?
                        <div className="form-greyscale">
                            <div>
                                <AllTexts texts={texts} deleteText={this.deleteText} openEditModal={this.openEditModal}/>
                            </div>
                            <div className='text-center'>
                                <Button primary basic onClick={this.openTextForm}>
                                    <i className="plus icon" />
                                    Add another text
                                </Button>
                            </div>
                        </div>
                        :
                        <NewText closeForm={this.closeTextForm} addNewText={this.addNewText}/>
                }
                {
                    this.state.selectedKey && this.state.selectedValue &&
                    <Modal open={this.state.editModal}>
                        <i className="close icon" onClick={() => this.setState({ editModal: false })}/>
                        <TextEditModal
                            closeModal={this.closeEditModal}
                            textKey={this.state.selectedKey}
                            textValue={this.state.selectedValue}
                            editText={this.editText}
                            deleteText={this.deleteText.bind(this, this.state.selectedKey)}
                            defaultValue={this.props.texts[this.state.selectedKey].defaultValue}
                        />
                    </Modal>
                }
            </div>
        )
    }

    private openTextForm = () => {
        this.setState ({ showForm: true });
    };

    private closeTextForm = () => {
        this.setState({ showForm: false });
    };

    private addNewText = (key: string, value: string) => {
        this.props.putText(key, value);
        this.setState({ showForm: false });
    };

    private deleteText = (key: string) => {
        this.props.deleteText(key);
        this.setState({ showForm: false });
    };

    private openEditModal = (key: string, value: string) => {
        this.setState({ editModal: true, selectedKey: key, selectedValue: value });
    };

    private closeEditModal = () => {
        this.setState({ editModal: false });
    };

    private editText = (key: string, value: string) => {
        this.props.editText(key, value);
        this.setState({ editModal: false, selectedKey: null, selectedValue: null });
    }
}

const mapStateToProps: MapStateToProps<StateProps, null, RootState> = (state): StateProps => {
    return ({
        texts: state.text.texts,
        isFetching: state.text.isFetching
    })
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchTexts: () => dispatch ({ type: FETCH_TEXTS }),
    putText: (key: string, value: string) => dispatch ({ type: PUT_TEXT, key, value }),
    deleteText: (key: string) => dispatch ({ type: PUT_TEXT, key, undefined }),
    editText: (key: string, value: string) => dispatch ({ type: PUT_TEXT, key, value })
});

const ConnectedComponent = connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(TextManagementPage);

export default ConnectedComponent;
