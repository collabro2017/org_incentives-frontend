import React, { Component } from 'react';
import { Form, Dropdown, Button } from 'semantic-ui-react';
import { APIOrder, Order, UpdateOrder } from "./orders-reducer";


const statusOptions = [
    {
        key: 'CREATED',
        value: 'CREATED',
        text: 'CREATED'
    },
    {
        key: 'CANCELLED',
        value: 'CANCELLED',
        text: 'CANCELLED'
    },
    {
        key: 'COMPLETED',
        value: 'COMPLETED',
        text: 'COMPLETED'
    }
];


interface Props {
    order: APIOrder,
    saveOrderStatus: (order: UpdateOrder) => void
}

interface State {
    status: string
}

class OrdersEditModal extends Component<Props, State> {

    state = {
        status: ''
    };

    render() {
        return (
            <div className="form-greyscale">
                <div className="block-s">
                    <h2>{`${this.props.order.employee.firstName} ${this.props.order.employee.lastName}`}</h2>
                </div>
                <div>
                    <Form size={"large"} as={'form'}>
                        <div className='block-m'>
                            <Form.Field width={10}>
                                <label>Update order status</label>
                                <Dropdown placeholder='Select status...' fluid search selection
                                          options={statusOptions}
                                          value={this.state.status}
                                          onChange={this.handleOrderStatus}/>
                            </Form.Field>
                        </div>
                        <div className="text-center">
                            <Button.Group>
                                <Button type='button'>Cancel</Button>
                                <Button.Or/>
                                <Button positive type='submit' onClick={this.updateOrderStatus}>Save Status</Button>
                            </Button.Group>
                        </div>
                    </Form>
                </div>
            </div>
        )
    }

    private handleOrderStatus = (event, { value }) => {
        this.setState({ status: value });
    };

    private updateOrderStatus = () => {
        const order = { status: this.state.status };

        this.props.saveOrderStatus(order)
    }
}

export default OrdersEditModal