import {
	all,
	call,
	fork,
	take,
	put,
	race,
	delay,
	throttle,
} from 'redux-saga/effects';
import {
	commandPwdAction,
	CONNECTION_FAILURE,
	CONNECTION_REQUEST,
	CONNECTION_SUCCESS,
	disconnectAction,
	ERROR,
	READY_STATE,
} from '../../reducers/sftp';
import {closeChannel, subscribe} from '../channel';

import messageSender from './messageSender';
import {createWebsocket} from './socket';
import {OPEN_TAB} from '../../reducers/common';
import {OPEN_WARNING_DIALOG_BOX} from '../../reducers/dialogBoxs';
import {connectResponse} from '../../ws/sftp/connect_response';

function* sendCommand(action) {
	const {payload} = action;
	console.log(payload);
	let uuid = null;

	try {
		const socket = yield call(createWebsocket);
		const channel = yield call(subscribe, socket);

		yield call(messageSender, {
			keyword: 'Connection',
			ws: socket,
			data: payload,
		});

		while (true) {
			const {timeout, data} = yield race({
				timeout: delay(4000),
				data: take(channel),
			});
			if (timeout) {
				closeChannel(channel);
				if (socket.readyState !== 1) {
					yield put({
						type: READY_STATE,
						payload: {uuid},
					});
				}
			} else {
				const res = yield call(connectResponse, {data});
				uuid = res.uuid;

				switch (res.type) {
					case CONNECTION_SUCCESS:
						yield put({
							type: CONNECTION_SUCCESS,
							payload: {
								uuid: uuid,
								socket: socket,
							},
						});

						yield put({
							type: OPEN_TAB,
							payload: {
								type: 'SFTP',
								uuid: uuid,
								server: {
									id: payload.id,
									name: payload.name,
									key: payload.key,
								},
							},
						});

						yield put(
							commandPwdAction({
								socket: socket,
								uuid: uuid,
								pwd_path: null,
							}),
						);

						break;

					case ERROR:
						if (socket.readyState === 1) {
							yield put({
								type: OPEN_WARNING_DIALOG_BOX,
								payload: 'invalid_server',
							});
						}
						yield put({type: CONNECTION_FAILURE, payload: res.err});

						yield put(
							disconnectAction({
								socket: socket,
							}),
						);
						break;

					default:
						break;
				}
			}
		}
	} catch (err) {
		console.log(err);
		yield put({
			type: OPEN_WARNING_DIALOG_BOX,
			payload: 'invalid_server',
		});
		yield put({type: CONNECTION_FAILURE, payload: err});
	}
}

function* watchSendCommand() {
	yield throttle(1000, CONNECTION_REQUEST, sendCommand);
}

export default function* connectSaga() {
	yield all([fork(watchSendCommand)]);
}
