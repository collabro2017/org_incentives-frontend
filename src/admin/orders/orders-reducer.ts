import {
    FETCH_TENANT_ORDERS, FETCH_TENANT_ORDERS_SUCCEEDED, PUT_TENANT_ORDERS,
    PUT_TENANT_ORDERS_SUCCEEDED
} from "./orders-actions";
import { Employee } from "../../employees/employee-reducer";
import { Reducer } from "redux";
import moment, { Moment } from "moment";
import { mostRecentFirst, OrderStatus } from "../../exercise/order/order-reducer";
import { OrderExerciseType } from "../../exercise/exercise-router";
import { OrderType } from "../../purchase/duck/purchase-saga";

export interface Order {
    id?: string,
    status: string,
    exerciseType: string,
    vps_account: number,
    employee: Employee
    exercise_order_lines: ExerciseOrder[]
}

export interface APIOrder {
    order_type: OrderType,
    status: OrderStatus,
    employee: Employee,
    id: string,
    created_at: Moment,
    exercise_order?: APIExerciseOrder,
    purchase_order?: APIPurchaseOrder
}

export interface APIPurchaseOrder {
    purchase_amount: number,
    share_depository_account?: string,
    purchase_config: {
        price: string,
    }
}

export interface APIExerciseOrder {
    exerciseType: OrderExerciseType,
    status: OrderStatus,
    id: string,
    vps_account?: string,
    bank_account?: string,
    exercise_order_lines: APIExerciseOrderLine[]
}

interface APIExerciseOrderLine {
    exercise_quantity: number,
    vesting_event_id: string,
    id: string,
}

export interface UpdateOrder {
    status: string,
}


export interface ExerciseOrder {
    id?: string,
    vesting_event_id: string,
    exercise_quantity: number
}

export interface OrderState {
    allOrders: APIOrder[],
    isFetching: boolean
}

const initialState: OrderState = {
    allOrders: [],
    isFetching: false
};

const orderReducer: Reducer<OrderState> = (state = initialState, action) => {
    if (action.type === FETCH_TENANT_ORDERS) {
        return { ...state, isFetching: true };
    }

    if (action.type === FETCH_TENANT_ORDERS_SUCCEEDED) {
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
        return { ...state, ...{ allOrders: orders }, isFetching: false };
    }

    if (action.type === PUT_TENANT_ORDERS) {
        return { ...state, isFetching: true };
    }

    if (action.type === PUT_TENANT_ORDERS_SUCCEEDED) {
        const orderIndex = state.allOrders.findIndex((order) => order.id === action.order.id);
        const order = { ...state.allOrders[orderIndex], ...action.order };
        state.allOrders = [...state.allOrders];
        state.allOrders[orderIndex] = order;
        return { ...state, allOrders: [...state.allOrders], isFetching: false };
    }

    return state;
};

export default orderReducer;