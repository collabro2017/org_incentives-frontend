import React, { Component } from 'react';
import { connect , MapStateToProps} from 'react-redux';
import { Loader, Modal, Dimmer, Message } from 'semantic-ui-react';
import { FETCH_TENANT_ORDERS, PUT_TENANT_ORDERS } from "./orders-actions";
import { APIOrder, Order, UpdateOrder } from "./orders-reducer";
import AllOrders from "./all-orders";
import OrdersEditModal from "./orders-edit-modal";
import { RootState } from "../../reducers/all-reducers";

interface DispatchProps {
    fetchTenantsOrders: () => void,
    putTenantsOrders: (selectedOrder: UpdateOrder, orderId: string) => void
}

interface StateProps {
    orders: APIOrder[],
    isFetching: boolean
}

interface State {
    editModal: boolean,
    selectedOrder?: APIOrder
}

type Props = DispatchProps & StateProps

class OrdersManagementPage extends Component<Props, State> {

    state = {
        editModal: false,
        selectedOrder: null
    };

    componentDidMount() {
        this.props.fetchTenantsOrders();
    }

    render() {

        const { isFetching, orders } = this.props;

        if (isFetching) {
            return (
                <div className="loader-full-screen">
                    <Dimmer active={isFetching}>
                        <Loader size="big" />
                    </Dimmer>
                </div>
            );
        }

        if (!this.state.editModal && !isFetching && orders && orders.length === 0) {
            return (
                <div className="text-content-center">
                    <Message
                        header='You have no orders yet'
                        content='When employees place an order, they will appear here. Orders available here are only for a specific company determined by the selected client.'
                    />
                </div>
            );
        }

        return (
            <div className="width-limit-small">
                <AllOrders orders={orders} openEditModal={this.openEditModal} />
                <div>
                    <Modal open={this.state.editModal}>
                        <i className="close icon" onClick={() => this.setState({ editModal: false })}/>
                        <OrdersEditModal order={this.state.selectedOrder} saveOrderStatus={this.saveOrderStatus}/>
                    </Modal>
                </div>
            </div>
        )
    }

    private openEditModal = (order: APIOrder) => {
        this.setState({ editModal: true, selectedOrder: order })
    };

    private saveOrderStatus = (order: UpdateOrder) => {
        this.props.putTenantsOrders(order, this.state.selectedOrder.id);
        this.setState({ editModal: false })
    }
}

const mapStateToProps: MapStateToProps<StateProps, null, RootState> = (state): StateProps => {
    return ({
        orders: state.adminOrder.allOrders,
        isFetching: state.adminOrder.isFetching
    })
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchTenantsOrders: () => dispatch ({ type: FETCH_TENANT_ORDERS }),
    putTenantsOrders: (selectedOrder: UpdateOrder, orderId: string) => dispatch ({ type: PUT_TENANT_ORDERS, updateOrder: selectedOrder, orderId })
});

const ConnectedComponent = connect<StateProps, DispatchProps>(mapStateToProps,mapDispatchToProps)(OrdersManagementPage);


export default ConnectedComponent;