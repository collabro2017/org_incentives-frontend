import { call, put, select, takeEvery} from "redux-saga/effects";
import { callApi, NOT_AUTHORIZED } from "../../api/api-helper";
import { delay } from "redux-saga";
import { push } from "react-router-redux";
import { OrderType } from "../../purchase/duck/purchase-saga";

const ORDER_REQUEST_URL = "/exercise_order";

export interface ExerciseOrder {
    exerciseType: string,
    exercise_order_lines: ExerciseOrderLine[]
    vps_account?: string,
    bank_account?: string,
}

export interface ExerciseOrderLine {
    vestingEventId: string,
    exerciseQuantity: number,
}

interface PlaceOrderAction {
    type: string,
    window_id: string,
    order: ExerciseOrder,
}

function* fetchUsersOrdersRequested(action) {
    try {
        const state = yield select();
        const token = state.user.token;

        const response = yield call(() => callApi("/orders", token));
        yield put({ type: 'FETCH_ORDERS_SUCCEEDED', orders: response.data });
    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put({ type: 'USER_NOT_AUTHORIZED' });
        } else {
            yield put({ type: 'FETCH_ORDERS_FAILED', message: e.message });
        }
    }
}


export function* watchFetchUsersOrders() {
    yield takeEvery('FETCH_ORDERS', fetchUsersOrdersRequested)
}

function* placeOrderRequested(action: PlaceOrderAction) {
    try {
        const state = yield select();
        const token = state.user.token;
        const method = 'POST';
        const body = {
            order_type: OrderType.EXERCISE,
            data: action.order,
            window_id: action.window_id,
        };
        yield call(() => callApi("/orders", token, method, body));
        yield put({ type: 'PLACE_ORDER_SUCCEEDED' });
        yield put ({ type: "FETCH_EMPLOYEE_PORTAL_WELCOME" });
        yield put (push("/orders/exercisecomplete"));
    } catch (e) {
        if (e.status === NOT_AUTHORIZED) {
            yield put ({ type: 'USER_NOT_AUTHORIZED' });
        } else {
            yield put({ type: 'PLACE_ORDER_FAILED', message: e.message });
        }
    }
}

export function* watchPlaceOrder() {
    yield takeEvery('PLACE_ORDER', placeOrderRequested)
}


