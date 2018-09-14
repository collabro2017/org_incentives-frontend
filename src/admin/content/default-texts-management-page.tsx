import React, { Component } from "react";
import { connect, MapStateToProps } from "react-redux";
import { Dimmer, Loader, Button, Modal, Message } from "semantic-ui-react";
import TextEditModal from "../../texts/text-edit-modal";
import NewText from "../../texts/new-text";
import AllDefaultTexts from "./all-default-texts";
import { FETCH_TEXTS, PUT_TEXT, UPDATE_DEFAULT_TEXTS } from "../../texts/text-actions";
import { RootState } from "../../reducers/all-reducers";
import { IStringStringMap } from "../../texts/employee-portal-texts-reducer";


interface StateProps {
    texts: IStringStringMap,
    isFetching: boolean
}

interface DispatchProps {
    fetchTexts: () => void,
    editText: (key: string, value: string) => void
    deleteText: (key: string) => void
}

interface State {
    editModal: boolean,
    selectedKey?: string,
    selectedValue?: string
}

type Props = StateProps & DispatchProps

class DefaultTextsManagementPage extends Component<Props, State> {

    state = {
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

        if (!isFetching && !texts) {
            return (
                <div className="text-content-center">
                    <Message
                        header='You have no texts yet'
                        content='When you create texts for your clients, they will appear here.'
                    />
                </div>
            )
        }

        return (
            <div>
                {
                    texts &&
                    <div className="form-greyscale">
                        <AllDefaultTexts texts={texts} openEditModal={this.openEditModal}/>
                    </div>
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
                        />
                    </Modal>
                }
            </div>
        )
    }

    private openEditModal = (key: string, value: string) => {
        this.setState({ editModal: true, selectedKey: key, selectedValue: value });
    };

    private closeEditModal = () => {
        this.setState({ editModal: false });
    };

    private editText = (key: string, value: string) => {
        this.props.editText(key, value);
        this.setState({ editModal: false, selectedKey: null, selectedValue: null });
    };

    private deleteText = (key: string) => {
        this.props.deleteText(key);
        this.setState({ editModal: false, selectedKey: null, selectedValue: null });
    };
}

const mapStateToProps: MapStateToProps<StateProps, null, RootState> = (state): StateProps => {
    return ({
        texts: state.text.defaultTexts,
        isFetching: state.text.isFetching || state.text.isUpdatingDefaultTexts
    })
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchTexts: () => dispatch ({ type: FETCH_TEXTS }),
    editText: (key: string, value: string) => dispatch ({ type: UPDATE_DEFAULT_TEXTS, key, value }),
    deleteText: (key: string) => dispatch ({ type: UPDATE_DEFAULT_TEXTS, key, undefined })
});

const ConnectedComponent = connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(DefaultTextsManagementPage);

export default ConnectedComponent;
