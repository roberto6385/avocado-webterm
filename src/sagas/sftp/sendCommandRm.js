import {
	all,
	call,
	fork,
	take,
	put,
	actionChannel,
	takeEvery,
	delay,
} from 'redux-saga/effects';
import SFTP from '../../dist/sftp_pb';
import {
	ADD_HISTORY,
	RM_FAILURE,
	RM_REQUEST,
	RM_SUCCESS,
} from '../../reducers/sftp';
import sftp_ws from '../../ws/sftp_ws';
import {subscribe} from './channel';
import {buffers} from 'redux-saga';

function* messageReader(data, payload) {
	const {uuid} = payload;
	console.log(payload);
	console.log(data);
	// return new Promise(function (resolve) {
	try {
		if (data instanceof ArrayBuffer) {
			const message = SFTP.Message.deserializeBinary(data);

			if (message.getTypeCase() === SFTP.Message.TypeCase.RESPONSE) {
				const response = message.getResponse();
				console.log('response status: ', response.getStatus());
				if (
					response.getResponseCase() ===
					SFTP.Response.ResponseCase.COMMAND
				) {
					const command = response.getCommand();
					switch (command.getCommandCase()) {
						case SFTP.CommandResponse.CommandCase.RM: {
							const rm = command.getRm();
							console.log('command : rm', rm);
							yield put({
								type: ADD_HISTORY,
								payload: {
									uuid,
									name: payload.fileName,
									size: payload.fileSize,
									todo: 'rm',
									progress: 100,
								},
							});
							yield put({
								type: RM_SUCCESS,
								payload: {
									uuid,
								},
							});
							return {
								type: RM_SUCCESS,
							};
						}
					}
				}
			}
		}
	} catch (err) {
		console.log(err);
		yield put({
			type: RM_FAILURE,
			payload: {
				errorMessage: 'Error while command rm',
			},
		});
	}
}

function* sendCommand(payload) {
	const channel = yield call(
		subscribe,
		payload.socket,
		buffers.expanding(10),
	);
	yield call(sftp_ws, {
		keyword: 'CommandByRm',
		ws: payload.socket,
		path: `${payload.path}/${payload.fileName}`,
	});
	try {
		while (true) {
			const data = yield take(channel);
			const res = yield call(messageReader, data, payload);
			if (res.type === RM_SUCCESS) {
				yield console.log('삭제 클리어');
				return {type: 'end'};
			}
		}
	} catch (err) {
		console.log(err);
	}
}

function* watchSendCommand() {
	// yield takeEvery(RM_REQUEST, sendCommand);
	const reqChannel = yield actionChannel(RM_REQUEST);
	while (true) {
		const {payload} = yield take(reqChannel);
		const res = yield call(sendCommand, payload);
		yield console.log(res);
	}
}

export default function* commandRmSaga() {
	yield all([fork(watchSendCommand)]);
}
