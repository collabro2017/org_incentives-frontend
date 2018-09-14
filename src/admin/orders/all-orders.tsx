import React, {Component, StatelessComponent} from 'react';
import { Card, FlagProps, Flag, Table, Button, Menu } from 'semantic-ui-react';
import { APIOrder } from "./orders-reducer";
import { countryOptions } from "../../data/common";
import { OrderType } from "../../purchase/duck/purchase-saga";
import {handleSortFunction, SortState} from "../../utils/sort";
import {employeeName, norwegianLongDate, sum} from "../../utils/utils";
import {Link} from "react-router-dom";
import {NO_VALUE} from "../../reports/reports";

interface Props {
    orders: APIOrder[],
    openEditModal: (order: APIOrder) => void
}

interface State extends SortState {
    orderType: OrderType
}

class AllOrders extends Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            column: null,
            data: this.props.orders,
            direction: 'ascending',
            orderType: OrderType.EXERCISE,
        }
    }

    handleSort = clickedColumn => () => {
        this.setState(handleSortFunction(clickedColumn, this.state));
    };

    render() {
        const { openEditModal, orders } = this.props;
        return (
            <div className='block-m'>
                <div className="col-center block-m">
                    <Menu pointing secondary>
                        <Menu.Item name='Exercise' active={this.state.orderType === OrderType.EXERCISE} onClick={() => this.setState({ orderType: OrderType.EXERCISE })} />
                        <Menu.Item name='Purchase' active={this.state.orderType === OrderType.PURCHASE} onClick={() => this.setState({ orderType: OrderType.PURCHASE })} />
                    </Menu>
                </div>
                {
                    this.state.orderType === OrderType.EXERCISE &&
                    <Table celled padded sortable>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell onClick={this.handleSort('order_type')}>Type</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort('start_time')}>Employee</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort('end_time')}>Email</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort('created_at')}>Created</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort('status')}>Status</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort('payment_deadline')}>Share Depository</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort('payment_deadline')}>Bank Account</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort('payment_deadline')}>Order Quantity</Table.HeaderCell>
                                <Table.HeaderCell>Actions</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {
                                orders.filter(order => order.order_type === OrderType.EXERCISE).map((order) => {
                                    return (
                                        <Table.Row key={order.id}>
                                            <Table.Cell><span className={`tag ${classForOrderType(order.order_type)}`}>{order.order_type}</span></Table.Cell>
                                            <Table.Cell>{employeeName(order.employee)}</Table.Cell>
                                            <Table.Cell>{order.employee.email}</Table.Cell>
                                            <Table.Cell singleLine>{order.created_at.format("lll")}</Table.Cell>
                                            <Table.Cell>{order.status}</Table.Cell>
                                            <Table.Cell>{order.exercise_order.vps_account}</Table.Cell>
                                            <Table.Cell>{order.exercise_order.bank_account}</Table.Cell>
                                            <Table.Cell>{order.exercise_order.exercise_order_lines.reduce(sum("exercise_quantity"), 0)}</Table.Cell>
                                            <Table.Cell>
                                                <div className="row-center">
                                                    <Button basic color='green' onClick={openEditModal.bind(this, order)}>Edit</Button>
                                                    <Button basic color='red'>Delete (Not Implemented)</Button>
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    )
                                })
                            }
                        </Table.Body>
                    </Table>
                }
                {
                    this.state.orderType === OrderType.PURCHASE &&
                    <Table celled padded sortable>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell onClick={this.handleSort('order_type')}>Type</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort('start_time')}>Employee</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort('end_time')}>Email</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort('payment_deadline')}>Status</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort('payment_deadline')}>Share Depository</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort('payment_deadline')}>Order Quantity</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort('payment_deadline')}>Price Per Instrument</Table.HeaderCell>
                                <Table.HeaderCell onClick={this.handleSort('payment_deadline')}>Total Price</Table.HeaderCell>
                                <Table.HeaderCell>Actions</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {
                                orders.filter(order => order.order_type === OrderType.PURCHASE).map((order) => {
                                    return (
                                        <Table.Row key={order.id}>
                                            <Table.Cell><span className={`tag ${classForOrderType(order.order_type)}`}>{order.order_type}</span></Table.Cell>
                                            <Table.Cell>{employeeName(order.employee)}</Table.Cell>
                                            <Table.Cell>{order.employee.email}</Table.Cell>
                                            <Table.Cell>{order.status}</Table.Cell>
                                            <Table.Cell>{order.purchase_order.share_depository_account}</Table.Cell>
                                            <Table.Cell>{order.purchase_order.purchase_amount}</Table.Cell>
                                            <Table.Cell>{order.purchase_order.purchase_config ? order.purchase_order.purchase_config.price : NO_VALUE}</Table.Cell>
                                            <Table.Cell>{order.purchase_order.purchase_config ? parseFloat(order.purchase_order.purchase_config.price) * order.purchase_order.purchase_amount : NO_VALUE}</Table.Cell>
                                            <Table.Cell>
                                                <div className="row-center">
                                                    <Button basic color='green' onClick={openEditModal.bind(this, order)}>Edit</Button>
                                                    <Button basic color='red'>Delete (Not Implemented)</Button>
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    )
                                })
                            }
                        </Table.Body>
                    </Table>
                }
                {
                    orders.map((order) => {
                        if (!order.employee) {
                            return null;
                        }

                        const country = countryOptions.filter((option) => option.value === order.employee.residence)[0];
                        const flagProps: FlagProps = { name: country.flag } as FlagProps;

                        if (order.order_type === OrderType.PURCHASE) {
                            return (
                                <Card fluid key={order.id}>
                                    <Card.Content>
                                        <Card.Header>
                                            <div className="flex-row space-between align-center" style={{ paddingBottom:'0.5rem' }}>
                                                <span>{order.order_type}</span>
                                                <span>{order.status}</span>
                                                {
                                                    order.purchase_order.share_depository_account &&
                                                    <span>Share Depository: {order.purchase_order.share_depository_account}</span>
                                                }
                                                <span>Purchase quantity: {order.purchase_order.purchase_amount}</span>
                                            </div>
                                        </Card.Header>
                                        <div className="flex-row space-between align-center" style={{ paddingBottom:'0.5rem' }}>
                                            <span>{`${order.employee.firstName} ${order.employee.lastName}`}</span>
                                            <span>{order.employee.email}</span>
                                            <span><Flag{...flagProps}/>{country.text}</span>
                                        </div>
                                    </Card.Content>
                                    <Card.Content extra>
                                        <div className='text-center'>
                                            <div className="ui two buttons width-limit-medium">

                                            </div>
                                        </div>
                                    </Card.Content>
                                </Card>
                            )

                        }

                        return (
                            <Card fluid key={order.id}>
                                <Card.Content>
                                    <Card.Header>
                                        <div className="flex-row space-between align-center" style={{ paddingBottom:'0.5rem' }}>
                                            <span>{order.order_type}</span>
                                            <span>{order.status}</span>
                                            <span>{order.exercise_order.exerciseType}</span>
                                        </div>
                                    </Card.Header>
                                    <div className="flex-row space-between align-center" style={{ paddingBottom:'0.5rem' }}>
                                        <span>{`${order.employee.firstName} ${order.employee.lastName}`}</span>
                                        <span>{order.employee.email}</span>
                                        <span><Flag{...flagProps}/>{country.text}</span>
                                    </div>
                                    <div className="flex-row space-between align-center" style={{ paddingBottom:'0.5rem' }}>
                                        <span>{order.exercise_order.vps_account ? `VPS: ${order.exercise_order.vps_account}`  : '' }</span>
                                        <span>{order.exercise_order.bank_account ? `Bank Account: ${order.exercise_order.bank_account}`  : '' }</span>
                                    </div>
                                </Card.Content>
                                <Card.Content extra>
                                    <Table celled padded>
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.HeaderCell>Vested Event ID</Table.HeaderCell>
                                                <Table.HeaderCell>Exercise Quantity</Table.HeaderCell>
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                            {
                                                order.exercise_order.exercise_order_lines.map((exercise) => {
                                                    return (
                                                        <Table.Row key={exercise.id}>
                                                            <Table.Cell>{exercise.vesting_event_id}</Table.Cell>
                                                            <Table.Cell>{exercise.exercise_quantity}</Table.Cell>
                                                        </Table.Row>
                                                    );
                                                })
                                            }
                                        </Table.Body>
                                    </Table>
                                </Card.Content>
                                <Card.Content extra>
                                    <div className='text-center'>
                                        <div className="ui two buttons width-limit-medium">
                                            <Button basic color='green' onClick={openEditModal.bind(this, order)}>Edit</Button>
                                            <Button basic color='red'>Delete (Not Implemented)</Button>
                                        </div>
                                    </div>
                                </Card.Content>
                            </Card>
                        )
                    })
                }
            </div>
        )

    }
};

const classForOrderType = (type: OrderType): string => {
    switch (type) {
        case OrderType.EXERCISE: return 'tag-blue';
        case OrderType.PURCHASE: return 'tag-teal';
        default: return '';
    }
};

export default AllOrders;