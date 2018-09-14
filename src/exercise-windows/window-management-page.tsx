import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Loader, Dimmer, Message } from 'semantic-ui-react'
import { RouteComponentProps, withRouter } from "react-router";
import { Window } from "./window-reducer";
import WindowForm from "./window-form";
import ViewWindows from "./view-windows";
import {
    FETCH_WINDOW, DELETE_WINDOW,
    POST_WINDOW, PUT_WINDOW
} from "./window-actions";
import DeleteWindowModal from "./delete-window-modal";


interface DispatchProps {
    fetchWindows: () => void,
    postWindow: (window: Window) => void,
    deleteWindow: (windowId: string) => void,
    putWindow: (window: Window, windowId: string) => void
}

interface StateProps {
    windows: Window[],
    isFetching: boolean
}

interface State {
    showForm: boolean,
    openModal: boolean,
    selectedWindow?: Window
}

type Props = RouteComponentProps<{}> & DispatchProps & StateProps

class WindowManagementPage extends Component<Props, State> {

    state = {
        showForm: false,
        openModal: false,
        selectedWindow: null
    };

    componentDidMount() {
        this.props.fetchWindows();
    }

    render() {

        const { isFetching, windows } = this.props;
        const { showForm, openModal, selectedWindow } = this.state;

        if (isFetching) {
            return (
                <div className="loader-full-screen">
                    <Dimmer active={isFetching}>
                        <Loader size="big" />
                    </Dimmer>
                </div>
            );
        }

        if (!showForm && !isFetching && windows && windows.length === 0) {
            return (
                <div className="text-content-center">
                    <Message
                        header='No windows...'
                        content='When you add a window for your company, it will appear here. Window available here are only for a specific company determined by the client selected.'
                    />
                    <div className='text-center'>
                        <Button primary basic onClick={this.openFormClicked}>
                            <i className="plus icon" />
                            New Window
                        </Button>
                    </div>
                </div>
            )
        }

        return (
            <div className='width-limit-small'>
                {
                    showForm ?
                        <div className="text-center block-m">
                            <h2 className="block-xs">Add Window</h2>
                            <p className="text-content">Register your company's window here...</p>
                        </div>
                        :
                        <h2 className="text-center block-s">Window</h2>
                }
                {
                    windows && windows.length > 0 && !showForm ?
                        <div className="text-center form-greyscale">
                            <ViewWindows windows={windows} openDeleteModal={this.openDeleteModal} openEditForm={this.openEditFormClicked}/>
                            <div className="text-center">
                                <Button primary basic onClick={this.openFormClicked}>
                                    <i className='plus icon'/>
                                    Add another window
                                </Button>
                            </div>
                        </div>
                        :
                        <div className="width-limit">
                            <WindowForm postWindow={this.addWindow} closeForm={this.closeFormClicked} selectedWindow={this.state.selectedWindow} editWindow={this.editWindow}/>
                        </div>
                }
                {
                    selectedWindow &&
                        <DeleteWindowModal closeModal={() => this.setState({openModal: false})}
                                           open={openModal} confirm={this.deleteWindow}/>
                }
            </div>
        )
    }

    private addWindow = (window: Window) => {
        this.props.postWindow(window);
        this.setState({ showForm: false });
    };

    private openFormClicked = () => {
        this.setState({ showForm: true, selectedWindow: null });
    };

    private closeFormClicked = () => {
        this.setState({ showForm: false });
    };

    private openDeleteModal = (window: Window) => {
        this.setState({ openModal: true, selectedWindow: window });
    };

    private deleteWindow = () => {
        this.props.deleteWindow(this.state.selectedWindow.id);
        this.setState({ openModal: false });
    };

    private openEditFormClicked = (window: Window) => {
        this.setState({ selectedWindow: window, showForm: true });
    };

    private editWindow = (window: Window) => {
        this.props.putWindow(window, this.state.selectedWindow.id);
        this.setState({ selectedWindow: null, showForm: false });
    };
}

const mapStateToProps = (state): StateProps => {
    return ({
        windows: state.exerciseWindow.allExerciseWindows,
        isFetching: state.exerciseWindow.isFetching
    })
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchWindows: () => dispatch ({ type: FETCH_WINDOW }),
    postWindow: (window: Window) => dispatch ({ type: POST_WINDOW, window }),
    deleteWindow: (windowId: string) => dispatch ({ type: DELETE_WINDOW, windowId }),
    putWindow: (window: Window, windowId: string) => dispatch ({ type: PUT_WINDOW, window, windowId })
});

const ConnectedComponent = connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(WindowManagementPage);


export default withRouter<{}>(ConnectedComponent);