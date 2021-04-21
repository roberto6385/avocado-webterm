import {all, call, fork, take, put, takeEvery} from 'redux-saga/effects';
import SFTP from '../../dist/sftp_pb';
import {GET_FAILURE, GET_REQUEST, GET_SUCCESS} from '../../reducers/sftp';
import sftp_ws from '../../ws/sftp_ws';
import {subscribe} from './channel';
let fileBuffer = new ArrayBuffer(0);

const appendBuffer = (buffer1, buffer2) => {
	var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
	tmp.set(new Uint8Array(buffer1), 0);
	tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
	return tmp.buffer;
};

let getReceiveSum = 0;

function* messageReader(data, payload, type) {
	const {uuid} = payload;
	console.log(payload);
	console.log(type);
	console.log(data);
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
						case SFTP.CommandResponse.CommandCase.GET: {
							const get = command.getGet();
							console.log('command : get', get);

							const data = get.getData_asU8();
							fileBuffer = appendBuffer(fileBuffer, data);

							// 프로그래스바
							var sum = getReceiveSum + data.length;
							const percent = (sum * 100) / get.getFilesize();
							// 여기서 progress bar?
							console.log(percent);
							console.log(get.getLast());

							if (get.getLast() === true) {
								const blob = new Blob([fileBuffer]);

								fileBuffer = new ArrayBuffer(0);

								var url = URL.createObjectURL(blob);

								var a = document.createElement('a');
								document.body.appendChild(a);
								a.setAttribute('hidden', true);
								a.href = url;
								a.download = payload.fileName;
								a.click();
								window.URL.revokeObjectURL(url);

								yield put({
									type: GET_SUCCESS,
									payload: {
										uuid,
									},
								});
							}
							return {
								type: GET_SUCCESS,
							};
						}
					}
				}
			}
		}
	} catch (err) {
		yield put({
			type: GET_FAILURE,
			payload: {
				errorMessage: 'Error while downloading',
			},
		});
	}
}

function* sendCommand(action) {
	try {
		const {type, payload} = action;
		const channel = yield call(subscribe, payload.socket);
		switch (type) {
			case GET_REQUEST:
				yield call(sftp_ws, {
					keyword: 'CommandByGet',
					ws: payload.socket,
					path: payload.path,
					fileName: payload.fileName,
				});
				break;
			default:
				break;
		}

		while (true) {
			const data = yield take(channel);
			yield call(messageReader, data, payload, type);
		}
	} catch (err) {
		console.log(err);
		//
	}
}

function* watchSendCommand() {
	yield takeEvery(GET_REQUEST, sendCommand);
}

export default function* commandGetSaga() {
	yield all([fork(watchSendCommand)]);
}
