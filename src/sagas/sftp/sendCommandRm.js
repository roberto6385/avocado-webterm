import {
	all,
	call,
	fork,
	take,
	put,
	actionChannel,
	race,
	delay,
} from 'redux-saga/effects';
import {
	commandPwdAction,
	RM_FAILURE,
	RM_REQUEST,
	RM_SUCCESS,
} from '../../reducers/sftp';
import messageSender from './messageSender';
import {closeChannel, subscribe} from '../channel';
import {rmResponse} from '../../ws/sftp/rm_response';

function* sendCommand(action) {
	const {payload} = action;
	const channel = yield call(subscribe, payload.socket);
	try {
		if (payload.file.name !== '..' && payload.file.name !== '.') {
			yield call(messageSender, {
				keyword: payload.keyword,
				ws: payload.socket,
				path:
					payload.rm_path === '/'
						? `${payload.rm_path}${payload.file.name}`
						: `${payload.rm_path}/${payload.file.name}`,
			});
		}

		while (true) {
			const {timeout, data} = yield race({
				timeout: delay(500),
				data: take(channel),
			});
			if (timeout) {
				console.log('RM 채널 사용이 없습니다. 종료합니다.');
				closeChannel(channel);
			} else {
				// const data = yield take(channel);
				const res = yield call(rmResponse, {data});
				console.log(res);
				switch (res.type) {
					case RM_SUCCESS:
						console.log(payload.file);
						yield put({type: RM_SUCCESS});

						if (payload.path === payload.rm_path) {
							yield put(
								commandPwdAction({
									socket: payload.socket,
									uuid: payload.uuid,
									pwd_path: payload.path,
								}),
							);
						}

						break;

					default:
						break;
				}
			}
		}
	} catch (err) {
		console.log(err);
		yield put({type: RM_FAILURE});
	}
}

function* watchSendCommand() {
	// yield takeEvery(RM_REQUEST, sendCommand);

	const reqChannel = yield actionChannel(RM_REQUEST);
	while (true) {
		const action = yield take(reqChannel);
		yield call(sendCommand, action);
	}
}

export default function* commandRmSaga() {
	yield all([fork(watchSendCommand)]);
}
