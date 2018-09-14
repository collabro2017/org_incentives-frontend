import React, { Component, StatelessComponent } from 'react';
import { Redirect, Route, RouteComponentProps, withRouter } from "react-router-dom";
import queryString from 'query-string';
import { Message, Loader, Table, Button } from 'semantic-ui-react';
import { connect, MapStateToProps } from 'react-redux';
import { APIExerciseOrder, APIOrder, OrderStatus } from "./order-reducer";
import moment, { Moment } from 'moment';
import { orderExerciseTypeDisplayText } from "../exercise-router";
import { formatNumber } from "../../utils/utils";
import { ErrorModal } from "../../error/general-error-modal";
import { Window } from "../../data/data";
import { CONTACT_EMAIL } from "../../index";
import { RootState } from "../../reducers/all-reducers";
import { OrderType } from "../../purchase/duck/purchase-saga";
import Content from "../../texts/content";

interface Props {
    refreshWelcomeData: () => void,
}

interface StateProps {
    isFetchingOrders: boolean,
    orders: APIOrder[],
    currentExerciseWindow: Window,
    currentPurchaseWindow?: Window,
    error?: string,
}

interface DispatchProps {
    fetchOrders: () => void
}

const OrderCancelled = () => <span className="order-status order-status-cancelled">Order cancelled</span>;
const OrderPlaced = () => <span className="order-status order-status-created">Order placed</span>;
const OrderCompleted = () => <span className="order-status order-status-completed">Order completed</span>;

const OrderStatusView: StatelessComponent<{ status: OrderStatus}> = ({ status }) => {
    if (status === OrderStatus.CANCELLED) {
        return <OrderCancelled />;
    }

    if (status === OrderStatus.COMPLETED) {
        return <OrderCompleted />;
    }

    if (status === OrderStatus.CREATED) {
        return <OrderPlaced />;
    }

    return (
        <span className="status-normal">{status}</span>
    );
}

const purchaseTypeText = (purchasedInstrument: string): string => {
    switch (purchasedInstrument) {
        case 'warrant': return "Purchase of warrants";
        case 'option': return "Purchase of options";
        case 'rsu': return "Purchase of RSUs";
        case 'rsa': return "Purchase of RSAs";
    }
}

const Order: StatelessComponent<APIOrder & { orderNumber: number, created_at: Moment }> = ({ orderNumber, created_at, status, order_type, exercise_order, purchase_order }) => {
    if (order_type === OrderType.EXERCISE) {
        const { exerciseType, exercise_order_lines } = exercise_order;
        return (
            <Table.Row>
                <Table.Cell>{orderNumber}</Table.Cell>
                <Table.Cell>{moment(created_at).format('lll')}</Table.Cell>
                <Table.Cell>{orderExerciseTypeDisplayText(exerciseType)}</Table.Cell>
                <Table.Cell>{formatNumber(exercise_order_lines.reduce((accu, current) => accu + current.exercise_quantity, 0))}</Table.Cell>
                <Table.Cell singleLine><OrderStatusView status={status} /></Table.Cell>
            </Table.Row>
        )
    } else if (order_type === OrderType.PURCHASE) {
        return (
            <Table.Row>
                <Table.Cell>{orderNumber}</Table.Cell>
                <Table.Cell>{moment(created_at).format('lll')}</Table.Cell>
                <Table.Cell>{purchaseTypeText(purchase_order.instrument_type)}</Table.Cell>
                <Table.Cell>{formatNumber(purchase_order.purchase_amount)}</Table.Cell>
                <Table.Cell singleLine><OrderStatusView status={status} /></Table.Cell>
            </Table.Row>
        )
    }
};

const ExerciseOrderSuccessMessage: StatelessComponent<{ windowEndDate: Moment }> = ({ windowEndDate }) => (
    <Message
        success
        header='Thank you for placing your order'
        content={`You may cancel your order any time before the current window closes on ${windowEndDate.format('lll')}`}
    />
);

const PurchaseOrderSuccessMessage: StatelessComponent<{ windowEndDate: Moment }> = ({ windowEndDate }) => (
    <Message
        success
        header='Thank you for placing your order'
        content={`You may cancel your order any time before the current window closes on ${windowEndDate.format('lll')}`}
    />
);


class OrderPage extends Component<RouteComponentProps<{}> & Props & DispatchProps & StateProps, {}> {
    componentDidMount() {
        this.props.fetchOrders();
    }

    render() {
        const { orders, currentExerciseWindow, currentPurchaseWindow } = this.props;
        return (
            <div className="main-content">
                <Route path={`${this.props.match.path}/exercisecomplete`} render={() =>
                    <div className="text-content-center"><ExerciseOrderSuccessMessage windowEndDate={currentExerciseWindow.to} /></div>
                } />
                <Route path={`${this.props.match.path}/purchasecomplete`} render={() =>
                    <div className="text-content-center"><PurchaseOrderSuccessMessage windowEndDate={currentPurchaseWindow.to} /></div>
                } />

                <h1 className="block-m">All orders</h1>

                <div className="text-content-center">

                    {
                        this.props.isFetchingOrders &&
                        <div className="loader-container text-center"><Loader active size='big' /><p>Fetching
                            orders</p></div>
                    }

                    {
                        orders && orders.length === 0 &&
                        <div className="text-content-center">
                            <Message
                                header='You have no orders yet'
                                content='When you exercise your employee stock options, they will appear as orders here. Exercising is only available in specific exercise windows determined by your employer.'
                            />
                        </div>
                    }

                    {
                        orders && orders.length > 0 &&
                        <div>
                            <div className="block-m">
                                <Table celled textAlign="center" collapsing padded unstackable>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Order number</Table.HeaderCell>
                                            <Table.HeaderCell>Order date</Table.HeaderCell>
                                            <Table.HeaderCell>Order type</Table.HeaderCell>
                                            <Table.HeaderCell>Order quantity</Table.HeaderCell>
                                            <Table.HeaderCell>Status</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {
                                            orders.map((order, index) => <Order {...order}
                                                                                orderNumber={orders.length - index}
                                                                                key={order.id} />)
                                        }
                                    </Table.Body>
                                </Table>
                            </div>
                            <p className="text-content-center text-center">
                                <Content id={"orders.contact.us"} values={{ email: CONTACT_EMAIL }}/>
                            </p>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps: MapStateToProps<StateProps, Props, RootState> = ({ order: { isFetchingOrders, orders, error }, user: { currentExerciseWindow, currentPurchaseWindow } }): StateProps => ({
    isFetchingOrders,
    orders,
    error,
    currentExerciseWindow,
    currentPurchaseWindow
});
const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchOrders: () => dispatch({ type: 'FETCH_ORDERS' })
});

const ConnectedComponent = connect<StateProps, DispatchProps, Props>(mapStateToProps, mapDispatchToProps)(OrderPage);

export default withRouter<Props>(ConnectedComponent);
