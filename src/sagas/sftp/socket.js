import {
	WebSocketExternalAccessUrl,
	WebSocketInternalAccessUrl,
} from '../../ws/ws_values';

export function createWebsocket(host, wsPort) {
	return new Promise((resolve, reject) => {
		// const socket = new WebSocket(`ws://${host}:8081/ws/sftp`);
		// const socket = new WebSocket(`ws://ec2-3-36-73-36.ap-northeast-2.compute.amazonaws.com
		// /ws/sftp`);
		const socket = new WebSocket(
			'ws://' + WebSocketExternalAccessUrl + '/ws/sftp',
			// wsPort ? `ws://${host}:${wsPort}/ws/sftp` : `ws://${host}/ws/sftp`,
		);

		socket.binaryType = 'arraybuffer';

		socket.onopen = function () {
			resolve(socket);
		};

		socket.onerror = function (evt) {
			reject(evt);
		};
	});
}
