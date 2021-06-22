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
	CHANGE_MODE,
	EDIT_READ_SUCCESS,
	FIND_HISTORY,
	READ_FAILURE,
	READ_REQUEST,
	READ_SUCCESS,
	SAVE_EDITTEXT,
	SAVE_FILE_FOR_EDIT,
	SAVE_TEXT,
} from '../../reducers/sftp';
import messageSender from './messageSender';
import {closeChannel, subscribe} from '../channel';
import {messageReader} from './messageReader';

function* sendCommand(action) {
	const {payload} = action;
	console.log(payload);
	const channel = yield call(subscribe, payload.socket);

	const filepath =
		payload.readPath === '/'
			? `${payload.readPath}${payload.file.name}`
			: `${payload.readPath}/${payload.file.name}`;

	const senderLength = 1024 * 56;

	yield call(messageSender, {
		keyword: 'CommandByRead',
		ws: payload.socket,
		path: filepath,
		offset: 0,
		length: senderLength,
		completed: false,
	});
	try {
		while (true) {
			const {timeout, data} = yield race({
				timeout: delay(200),
				data: take(channel),
			});
			if (timeout) {
				console.log('READ 채널 사용이 없습니다. 종료합니다.');
				closeChannel(channel);
			} else {
				const res = yield call(messageReader, {data, payload});
				console.log(res);
				switch (res.type) {
					case READ_SUCCESS:
						if (res.last === false) {
							if (res.end === false) {
								yield call(messageSender, {
									keyword: 'CommandByRead',
									ws: payload.socket,
									path: filepath,
									offset: res.byteSum + 1,
									length: senderLength,
									completed: false,
								});
							} else {
								yield call(messageSender, {
									keyword: 'CommandByRead',
									ws: payload.socket,
									path: filepath,
									offset: res.byteSum,
									length: senderLength,
									completed: true,
								});
							}
						}
						if (res.keyword === 'read') {
							yield put({
								type: FIND_HISTORY,
								payload: {
									uuid: payload.uuid,
									name: payload.file.name,
									todo: payload.keyword,
									progress: res.percent,
								},
							});
							if (res.last && res.percent === 100) {
								yield put({
									type: READ_SUCCESS,
									payload: {
										uuid: payload.uuid,
										percent: res.percent,
									},
								});
							}
						} else {
							if (res.last && res.percent === 100) {
								yield put({
									type: EDIT_READ_SUCCESS,
									payload: {
										uuid: payload.uuid,
										percent: res.percent,
									},
								});
								yield put({
									type: SAVE_TEXT,
									payload: {
										uuid: payload.uuid,
										text: res.text,
									},
								});
								yield put({
									type: SAVE_EDITTEXT,
									payload: {
										uuid: payload.uuid,
										editText: res.text,
									},
								});
								yield put({
									type: SAVE_FILE_FOR_EDIT,
									payload: {
										uuid: payload.uuid,
										editFile: payload.file,
									},
								});
								yield put({
									type: CHANGE_MODE,
									payload: {
										uuid: payload.uuid,
										mode: 'edit',
										currentMode: payload.mode,
									},
								});
							}
						}
						break;
				}
			}
		}
	} catch (err) {
		console.log(err);
		yield put({type: READ_FAILURE});
	}
}

function* watchSendCommand() {
	const reqChannel = yield actionChannel(READ_REQUEST);
	while (true) {
		const action = yield take(reqChannel);
		yield call(sendCommand, action);
	}
}

export default function* commandReadSaga() {
	yield all([fork(watchSendCommand)]);
}