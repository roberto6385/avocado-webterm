import {createStore, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import {composeWithDevTools} from 'redux-devtools-extension';
import {persistStore} from 'redux-persist';
import base64 from 'base-64';

import rootReducer from '../reducers';
import rootSaga from '../sagas';
import {
	REFRESH_USER_TICKET_FAILURE,
	REFRESH_USER_TICKET_REQUEST,
	REFRESH_USER_TICKET_SUCCESS,
} from '../reducers/auth/userTicket';
import {LOGOUT} from '../reducers/user';
import {SAVE_ENCODE_DATA} from '../reducers/common';

const tokenRefreshMiddleware =
	({dispatch, getState}) =>
	(next) =>
	(action) => {
		if (
			getState().userTicket.userTicket &&
			!(
				action.type === LOGOUT ||
				action.type === REFRESH_USER_TICKET_REQUEST ||
				action.type === REFRESH_USER_TICKET_SUCCESS ||
				action.type === REFRESH_USER_TICKET_FAILURE
			)
		) {
			if (
				Date.now() -
					getState().userTicket.userTicket.expires_in * 1000 +
					50 * 60 * 1000 >
				Date.parse(getState().userTicket.userTicket.create_date)
			) {
				const encodeData = base64.encode(`${'web'}:${'123456789'}`);
				dispatch({
					type: REFRESH_USER_TICKET_REQUEST,
					params: {
						refresh_token:
							getState().userTicket.userTicket.refresh_token,
						Authorization: 'Basic ' + encodeData,
					},
				});
			}
		}

		return next(action);
	};

const sagaMiddleware = createSagaMiddleware();

const middlewares = [tokenRefreshMiddleware, sagaMiddleware];
const enhancer = composeWithDevTools(applyMiddleware(...middlewares));

export const store = createStore(rootReducer, enhancer);
export const persistor = persistStore(store);
sagaMiddleware.run(rootSaga);
export default {store, persistor};
