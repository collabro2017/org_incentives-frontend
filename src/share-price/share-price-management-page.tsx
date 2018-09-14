import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Button, Loader, Dimmer, Modal, Header, Icon, Message } from 'semantic-ui-react';
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { SharePrice } from "./share-price-reducer";
import TenantSharePrice from "./tenant-share-price";
import NewSharePrice from './new-share-price';
import { Tenant } from "../tenant/tenant-reducer";
import { DELETE_SHARE_PRICE, FETCH_SHARE_PRICE, POST_SHARE_PRICE } from "./share-price-actions";
import SpinnerFullScreen from "../common/components/spinner-full-screen";

interface DispatchProps {
    fetchSharePrice: () => void,
    postSharePrice: (sharePrice: SharePrice) => void,
    deleteSharePrice: (sharePriceId: string) => void
}

interface StateProps {
    sharePrice: SharePrice[],
    isFetching: boolean,
    selectedTenant: Tenant
}

interface State {
    showForm: boolean,
    openModal: boolean,
    selectedSharePrice?: SharePrice
}

type Props = RouteComponentProps<{}> & DispatchProps & StateProps;

class SharePriceManagementPage extends Component<Props, State> {

    state = {
        showForm: false,
        openModal: false,
        selectedSharePrice: null
    };

    componentDidMount() {
        this.props.fetchSharePrice();
    }

    render() {

        const { isFetching, sharePrice, selectedTenant } = this.props;

        if (isFetching) {
            return <SpinnerFullScreen active/>;
        }

        if (!this.state.showForm && !isFetching && sharePrice && sharePrice.length === 0) {
            return (
                <div className="text-content-center">
                    <Message
                        header='You have no share price yet'
                        content='When you register a share price for your company, it will appear here. Share price available here are only for a specific company determined by the client selected.'
                    />
                    <div className='text-center'>
                        <Button primary basic onClick={this.openFormClicked}>
                            <i className="plus icon" />
                            New Share Price
                        </Button>
                    </div>
                </div>
            )
        }

        return (
            <div className="width-limit-small">
                {
                    this.state.showForm ?
                        <div className='text-center block-m'>
                            <h2 className="block-xs">Add Share Price</h2>
                            <p className="text-content">Register your company's share price here...</p>
                        </div>
                        :
                        <div className="block-s">
                            <h2 className="text-center">Share Price</h2>
                        </div>
                }
                {
                    sharePrice && sharePrice.length > 0 && !this.state.showForm ?
                        <div className='text-center form-greyscale'>
                            <TenantSharePrice sharePrice={this.props.sharePrice} selectedTenant={selectedTenant} openDeleteModal={this.openDeleteModal}/>
                            <div>
                                <Button primary basic onClick={this.openFormClicked}>
                                    <i className="plus icon" />
                                    Add another share price
                                </Button>
                            </div>
                        </div>
                        :
                        <NewSharePrice addSharePrice={this.addSharePrice} closeFormClicked={this.closeFormClicked}/>
                }
                <div>
                    <Modal open={this.state.openModal}>
                        <i className="close icon" onClick={() => this.setState({ openModal: false })}/>
                        <Header icon='trash' content='Delete Share Price'/>
                        <Modal.Content>
                            <p>Are you sure you want to delete this Share Price?</p>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button basic color='red' onClick={() => this.setState({ openModal: false })}>
                                <Icon name='remove' /> No
                            </Button>
                            <Button color='green' inverted onClick={this.deleteSelectedSharePrice}>
                                <Icon name='checkmark' /> Yes
                            </Button>
                        </Modal.Actions>
                    </Modal>
                </div>
            </div>
        )
    }


    private addSharePrice = (sharePrice) => {
        this.props.postSharePrice(sharePrice);
        this.setState({ showForm: false });
    };

    private openFormClicked = () => {
        this.setState({ showForm: true });
    };

    private closeFormClicked = () => {
        this.setState({ showForm: false });
    };

    private openDeleteModal = (sharePrice) => {
        this.setState({ openModal: true, selectedSharePrice: sharePrice });
    };

    private deleteSelectedSharePrice = () => {
        this.props.deleteSharePrice(this.state.selectedSharePrice.id);
        this.setState({ openModal: false });
    };
}

const mapStateToProps = (state): StateProps => {
    return ({
        sharePrice: state.sharePrice.allSharePrice,
        isFetching: state.sharePrice.isFetching,
        selectedTenant: state.tenant.selectedTenant
    })
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    postSharePrice: (sharePrice: SharePrice) => dispatch({ type: POST_SHARE_PRICE, sharePrice }),
    fetchSharePrice: () => dispatch ({ type: FETCH_SHARE_PRICE }),
    deleteSharePrice: (sharePriceId: string) => dispatch ({ type: DELETE_SHARE_PRICE, sharePriceId })

});

const ConnectedComponent = connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(SharePriceManagementPage);

export default withRouter<{}>(ConnectedComponent);


