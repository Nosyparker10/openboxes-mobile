import {takeLatest, put, call} from 'redux-saga/effects';
import {
    FETCH_PUTAWAY_FROM_ORDER_REQUEST,
    FETCH_PUTAWAY_FROM_ORDER_REQUEST_SUCCESS,
    SUBMIT_PUTAWAY_ITEM_BIN_LOCATION,
    SUBMIT_PUTAWAY_ITEM_BIN_LOCATION_SUCCESS,
} from '../actions/putaways';
import {hideScreenLoading, showScreenLoading} from '../actions/main';
import * as api from '../../apis';
import {GetPutAwayApiResponse, GetPutAwaysApiResponse, PostPutAwayItemApiResponse} from "../../data/putaway/PutAway";


function* fetchPutAwayFromOrder(action: any) {
    try {
        yield showScreenLoading('Fetching products');
        const response: GetPutAwaysApiResponse = yield call(api.fetchPutAwayFromOrder, action.payload.q);
        yield put({
            type: FETCH_PUTAWAY_FROM_ORDER_REQUEST_SUCCESS,
            payload: response.data,
        });
        yield action.callback(response.data);
        yield hideScreenLoading();
    } catch (e) {
        console.log('function* fetchPutAwayFromOrder', e.message);
        console.log( e.response);
        yield action.callback({
            error: true,
            message: e.message,
        });
    }
}

function* submitPutawayItem(action: any) {
    console.debug("id:"+action.payload.id)
    console.debug("requestBody:"+action.payload.requestBody)
    try {
        const response: PostPutAwayItemApiResponse = yield call(
            api.submitPutawayItem,
            action.payload.id,
            action.payload.requestBody,
        );
        yield put({
            type: SUBMIT_PUTAWAY_ITEM_BIN_LOCATION_SUCCESS,
            payload: response.data,
        });
        yield action.callback(response.data);
    } catch (e) {
        console.log('function* submitPutawayItem', e.message);
        yield action.callback({
            error: true,
            message: e.message,
        });
    }
}



export default function* watcher() {
    yield takeLatest(FETCH_PUTAWAY_FROM_ORDER_REQUEST, fetchPutAwayFromOrder);
    yield takeLatest(SUBMIT_PUTAWAY_ITEM_BIN_LOCATION, submitPutawayItem);

}