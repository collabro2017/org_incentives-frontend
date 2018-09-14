import { OrderExerciseType } from "../exercise-router";
import moment, { Moment } from "moment";
import { Reducer } from "redux";
import { OrderType } from "../../purchase/duck/purchase-saga";

export interface OrderState {
    readonly isPlacingOrder: boolean,
    readonly isFetchingOrders: boolean,
    readonly orders?: APIOrder[],
    readonly error?: string,
}

export enum OrderStatus {
    CREATED = 'CREATED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface APIOrder {
    order_type: OrderType,
    status: OrderStatus,
    id: string,
    created_at: Moment,
    exercise_order?: APIExerciseOrder,
    purchase_order?: APIPurchaseOrder
}

export interface APIPurchaseOrder {
    purchase_amount: number,
    instrument_type: string,
    purchase_config: {
        price: string,
    }
}

export interface APIExerciseOrder {
    exerciseType: OrderExerciseType,
    status: OrderStatus,
    id: string,
    exercise_order_lines: APIExerciseOrderLine[]
}

interface APIExerciseOrderLine {
    exercise_quantity: number
}

const initialState: OrderState = {
    isPlacingOrder: false,
    isFetchingOrders: false,
    orders: null,
};

export const mostRecentFirst = (orderA: APIOrder, orderB: APIOrder): number => orderA.created_at.isSameOrBefore(orderB.created_at) ? 1 : -1;

const orderReducer: Reducer<OrderState> = (state = initialState, action) => {
    if (action.type === 'FETCH_ORDERS') {
        return { ...state, ...{ isFetchingOrders: true } }
    }

    if (action.type === 'FETCH_ORDERS_SUCCEEDED') {
        const orders = action.orders
            .map((order) => {
                const newOrder = { ...order, order_type: OrderType[order.order_type], created_at: moment(order.created_at) };
                switch (OrderType[order.order_type]) {
                    case OrderType.PURCHASE: return newOrder;
                    case OrderType.EXERCISE: {
                        const exercise_order = { ...order.exercise_order, ...{ exerciseType: OrderExerciseType[order.exercise_order.exerciseType] } };
                        return { ...newOrder, exercise_order };
                    }
                    default: return newOrder;
                }
            })
            .map((order) => {
                return order;
            })
            .sort(mostRecentFirst);
        return { ...state, ...{ isFetchingOrders: false, orders } }
    }

    if (action.type === 'FETCH_ORDERS_FAILED') {
        return { ...state, ...{ isFetchingOrders: false } }
    }

    if (action.type === 'PLACE_ORDER') {
        return { ...state, ...{ isPlacingOrder: true } }
    }

    if (action.type === 'PLACE_ORDER_SUCCEEDED') {
        return { ...state, ...{ isPlacingOrder: false } }
    }

    if (action.type === 'PLACE_ORDER_FAILED') {
        return { ...state, ...{ isPlacingOrder: false, error: 'An error occurred while placing your order. Please contact us if the issue persists' } }
    }

    if (action.type === 'REMOVE_ORDER_ERROR') {
        return { ...state, ...{ error: null } }
    }

    return state;
};

export default orderReducer;
