import React, {useCallback} from 'react';
import * as PropTypes from 'prop-types';
import {animation, Item, Menu} from 'react-contexify';
import {useDispatch, useSelector} from 'react-redux';
import {ssht_ws_request} from '../../ws/ssht_ws_request';
import {GetMessage} from '../../ws/ssht_ws_logic';
import {OPEN_TAB} from '../../reducers/common';
import newSftp_ws from '../../ws/sftp_ws';
import {SFTP_SAVE_LIST_MODE} from '../../reducers/sftp';
import {
	OPEN_ADD_SERVER_FORM_POPUP,
	OPEN_CONFIRM_POPUP,
} from '../../reducers/popup';

const ServerContextMenuMessage = {
	connect: 'Connect',
	open_sftp: 'Open SFTP',
	rename: 'Rename',
	delete: 'Delete',
	properties: 'Properties',
};

const ServerContextMenu = ({data, setOpenRename}) => {
	const dispatch = useDispatch();
	const {server} = useSelector((state) => state.common);
	const {userTicket} = useSelector((state) => state.userTicket);
	const MENU_ID = data.key + 'server';

	const handleItemClick = useCallback(
		(e) => () => {
			switch (e) {
				case 'connect':
					openSSHT();
					break;
				case 'open_sftp':
					openSFTP();
					break;
				case 'rename':
					setOpenRename(true);
					break;
				case 'delete':
					dispatch({
						type: OPEN_CONFIRM_POPUP,
						data: {key: 'delete_server_folder'},
					});
					break;
				case 'properties':
					dispatch({
						type: OPEN_ADD_SERVER_FORM_POPUP,
						data: {type: 'edit', id: data.id},
					});
					break;
				default:
					return;
			}
		},
		[],
	);

	const openSFTP = useCallback(() => {
		const correspondedServer = server.find((i) => i.id === data.id);

		const ws = new WebSocket(
			`ws://${correspondedServer.host}:8081/ws/sftp`,
		);
		ws.onopen = async () => {
			const {uuid} = await newSftp_ws({
				keyword: 'Connection',
				ws,
				token: userTicket.access_token,
				data: correspondedServer,
			});
			dispatch({
				type: OPEN_TAB,
				data: {
					id: correspondedServer.id,
					type: 'SFTP',
					ws: ws,
					uuid: uuid,
				},
			});
			dispatch({
				type: SFTP_SAVE_LIST_MODE,
				data: {
					uuid,
					mode: 'list',
				},
			});
		};
	}, [server, userTicket]);

	const openSSHT = useCallback(() => {
		const correspondedServer = server.find((i) => i.id === data.id);
		const ws = new WebSocket(
			'ws://' + correspondedServer.host + ':8081/ws/ssh',
		);

		ws.binaryType = 'arraybuffer';

		ws.onopen = () => {
			ssht_ws_request({
				keyword: 'SendConnect',
				ws: ws,
				data: {
					token: userTicket.access_token,
					host: correspondedServer.host,
					user: correspondedServer.user,
					password: correspondedServer.password,
					port: correspondedServer.port,
				},
			});

			ws.onmessage = (evt) => {
				const message = GetMessage(evt);
				console.log(message);

				if (message.type === 'CONNECT')
					dispatch({
						type: OPEN_TAB,
						data: {
							id: data.id,
							type: 'SSHT',
							ws: ws,
							uuid: message.result,
						},
					});
				else console.log('V ServerNavBar onmessage: ', message);
			};
		};
	}, [server, data]);

	return (
		<Menu
			id={MENU_ID}
			animation={animation.slide}
			style={{fontSize: '14px'}}
		>
			{Object.keys(ServerContextMenuMessage).map((v) => (
				<Item onClick={handleItemClick(v)} key={v}>
					{ServerContextMenuMessage[v]}
				</Item>
			))}
		</Menu>
	);
};

ServerContextMenu.propTypes = {
	data: PropTypes.object.isRequired,
	setOpenRename: PropTypes.func.isRequired,
};

export default ServerContextMenu;
