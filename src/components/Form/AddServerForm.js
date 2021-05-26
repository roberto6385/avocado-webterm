import React, {useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {EDIT_SERVER, SAVE_SERVER} from '../../reducers/common';
import useInput from '../../hooks/useInput';
import {GetMessage} from '../../ws/ssht_ws_logic';
import {ssht_ws_request} from '../../ws/ssht_ws_request';
import {
	CLOSE_ADD_SERVER_FORM_POPUP,
	OPEN_ALERT_POPUP,
} from '../../reducers/popup';
import Modal from 'react-modal';
import {
	ACCOUNT_BUTTON_WIDTH,
	AVOCADO_FONTSIZE,
	BORDER_COLOR,
	IconButton,
	FOLDER_HEIGHT,
	MAIN_HEIGHT,
	PATH_SEARCH_INPUT_HEIGHT,
	DefaultButton,
	PrimaryButton,
	ICON_DARK_COLOR,
} from '../../styles/global_design';
import {IoCloseOutline} from 'react-icons/all';
import styled from 'styled-components';
import Input_ from '../RecycleComponents/Input_';
import Select_ from '../RecycleComponents/Select_';

const _Modal = styled(Modal)`
	border: 1px solid ${BORDER_COLOR};
	position: absolute;
	z-index: 5;
	top: 50%;
	left: 50%;
	right: auto;
	bottom: auto;
	transform: translate(-50%, -50%);
	box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.22);
	background: white;
	border-radius: 4px;
	width: 600px;
`;

const _Header = styled.div`
	display: flex;
	align-items: center;
	height: ${FOLDER_HEIGHT};
	font-size: ${AVOCADO_FONTSIZE};
	justify-content: space-between;
	padding: 0px 16px;
	border-bottom: 1px solid ${BORDER_COLOR};
	font-weight: 500;
`;
const _Footer = styled.div`
	display: flex;
	ailgn-items: center;
	height: ${MAIN_HEIGHT};
	font-size: ${AVOCADO_FONTSIZE};
	justify-content: flex-end;
	padding: 13px 8px;
	border-top: 1px solid ${BORDER_COLOR};
`;

const _Title = styled.div`
	line-height: ${FOLDER_HEIGHT};
`;

const Input = styled.input`
	width: ${ACCOUNT_BUTTON_WIDTH};
	height: ${PATH_SEARCH_INPUT_HEIGHT};
	padding: 6px 10px;
	border-radius: 4px;
	border: 1px solid ${BORDER_COLOR};
	background: ${(props) => props.back};
	color: ${(props) => props.color};
`;

const BrowseButton = styled(PrimaryButton)`
	margin-top: 8px;
`;

const LongInput = styled(Input)`
	width: 100%;
`;

const FileInput = styled.input`
	display: none;
`;

const _Label = styled.label`
	width: 100%;
	height: ${PATH_SEARCH_INPUT_HEIGHT};
	padding: 6px 10px;
	border-radius: 4px;
	border: 1px solid ${BORDER_COLOR};
	margin: 0;
	cursor: pointer;
`;

const _Form = styled.form`
	display: flex;
	width: 100%;
	flex-direction: column;
	font-size: ${AVOCADO_FONTSIZE};
	padding: 18px 16px 29px 16px;
`;
const Item_Container = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const AddServerForm = () => {
	const dispatch = useDispatch();
	const {server} = useSelector((state) => state.common);
	const {userTicket} = useSelector((state) => state.userTicket);
	const {add_server_form_popup} = useSelector((state) => state.popup);

	const [name, onChangeName, setName] = useInput('Test');
	const [protocol, onChangeProtocol, setProtocol] = useInput('SSH2');
	const [host, onChangeHost, setHost] = useInput('211.253.10.9');
	const [port, onChangePort, setPort] = useInput(10021);
	const [identity, onChangeIdentity, setIdentity] = useInput('root');
	const [
		authentication,
		onChangeAuthentication,
		setAuthentication,
	] = useInput('Password');
	const [keyFile, onChangeKeyFile, setKeyFile] = useInput('');

	const [username, onChangeUsername, setUsername] = useInput('root');
	const [password, onChangePassword, setPassword] = useInput('Netand141)');
	const [note, onChangeNote, setNote] = useInput('');

	const protocol_options = [
		{value: 'SSH2', label: 'SSH2'},
		{value: 'SFTP', label: 'SFTP'},
	];
	const authentication_options = [
		{value: 'Password', label: 'Password'},
		{value: 'KeyFile', label: 'Key File'},
	];

	// user option은 reducer-common에서 account와 연결된다.
	// 현재는 디자인 작업을 위해 option을 별도로 생성했다.
	// options와 account의 저장 방식을 통일할 필요가 있다.
	const user_options = [
		{value: 'root', label: 'root'},
		{value: 'ctl', label: 'ctl'},
	];

	const onSubmitForm = useCallback(
		(e) => {
			e.preventDefault();

			const ws = new WebSocket(`ws://${host}:8081/ws/ssh`);
			ws.binaryType = 'arraybuffer';

			ws.onerror = () => {
				dispatch({type: OPEN_ALERT_POPUP, data: 'invalid_server'});
			};

			ws.onopen = () => {
				ssht_ws_request({
					keyword: 'SendConnect',
					ws: ws,
					data: {
						token: userTicket,
						host: host,
						user: identity,
						password: password,
						port: port,
					},
				});
			};

			ws.onmessage = (evt) => {
				const message = GetMessage(evt.data);

				if (message.type === 'CONNECT') {
					ssht_ws_request({keyword: 'SendDisconnect', ws: ws});
					const newData = {
						name: name,
						host: host,
						user: identity,
						protocol: protocol,
						password: password,
						port: port,
					};
					if (add_server_form_popup.type === 'add')
						dispatch({
							type: SAVE_SERVER,
							data: newData,
						});
					else if (add_server_form_popup.type === 'edit')
						dispatch({
							type: EDIT_SERVER,
							data: {
								id: add_server_form_popup.id,
								data: newData,
							},
						});
				} else if (message.type === 'DISCONNECT') {
					dispatch({type: CLOSE_ADD_SERVER_FORM_POPUP});
				} else console.log('V AddServerForm onmessage: ', message);
			};
		},
		[
			name,
			protocol,
			host,
			port,
			identity,
			password,
			add_server_form_popup,
			userTicket,
			dispatch,
		],
	);

	const closeModal = useCallback(() => {
		dispatch({type: CLOSE_ADD_SERVER_FORM_POPUP});
	}, [dispatch]);

	useEffect(() => {
		if (add_server_form_popup.open) {
			if (add_server_form_popup.type === 'add') {
				setName('Test');
				setProtocol('SSH2');
				setHost('211.253.10.9');
				setPort(10021);
				setIdentity('root');
				setAuthentication('Password');
				setPassword('Netand141)');
				setKeyFile('');
				setUsername('');
				setNote('');
			} else {
				const data = server.find(
					(v) => v.id === add_server_form_popup.id,
				);
				setName(data.name);
				setProtocol('SSH2');
				setHost(data.host);
				setPort(data.port);
				setIdentity(data.user);
				setAuthentication('Password');
				setPassword(data.password);
			}
		}
	}, [add_server_form_popup]);

	return (
		<_Modal
			isOpen={add_server_form_popup.open}
			onRequestClose={closeModal}
			ariaHideApp={false}
			shouldCloseOnOverlayClick={false}
		>
			<_Header>
				<_Title>Add Server</_Title>
				<IconButton color={ICON_DARK_COLOR} onClick={closeModal}>
					<IoCloseOutline />
				</IconButton>
			</_Header>
			<_Form onSubmit={onSubmitForm}>
				<Item_Container>
					<Input_ title={'Name'}>
						<Input
							value={name}
							onChange={onChangeName}
							placeholder={'Server Name'}
						/>
					</Input_>
					<Select_
						title='Protocol'
						options={protocol_options}
						value={protocol}
						setValue={setProtocol}
					/>
				</Item_Container>
				<Item_Container>
					<Input_ title={'Address'}>
						<Input
							value={host}
							onChange={onChangeHost}
							placeholder={'Host or IP'}
						/>
					</Input_>

					<Input_ title={'Port'} width={ACCOUNT_BUTTON_WIDTH}>
						<Input
							value={port}
							onChange={onChangePort}
							placeholder={'Port'}
						/>
					</Input_>
				</Item_Container>
				<Item_Container>
					<Select_
						title='Identity'
						options={user_options}
						value={identity}
						setValue={setIdentity}
					/>
					<Select_
						title='Authentication'
						options={authentication_options}
						value={authentication}
						setValue={setAuthentication}
					/>
				</Item_Container>
				<Item_Container>
					<Input_ title={'Username'}>
						<LongInput
							value={username}
							onChange={onChangeUsername}
							placeholder={'Username'}
						/>
					</Input_>
				</Item_Container>
				{authentication === 'Password' ? (
					<Item_Container>
						<Input_ title={'Password'}>
							<LongInput
								type='password'
								value={password}
								onChange={onChangePassword}
								placeholder={'Password'}
							/>
						</Input_>
					</Item_Container>
				) : (
					<React.Fragment>
						<Item_Container>
							<Input_ title={'Private Key File'}>
								<_Label htmlFor={'add_server_form_type_file'}>
									{keyFile}
									<FileInput
										id={'add_server_form_type_file'}
										type='file'
										value={keyFile}
										onChange={onChangeKeyFile}
										placeholder={'Key File'}
									/>
								</_Label>
							</Input_>
							<BrowseButton
								onClick={() =>
									document
										.getElementById(
											'add_server_form_type_file',
										)
										.click()
								}
							>
								Browse
							</BrowseButton>
						</Item_Container>

						<Item_Container>
							<Input_ title={'Key File Password'}>
								<LongInput
									type='password'
									value={password}
									onChange={onChangePassword}
									placeholder={'Password'}
								/>
							</Input_>
						</Item_Container>
					</React.Fragment>
				)}
				<Item_Container>
					<Input_ title={'Note'}>
						<LongInput
							value={note}
							onChange={onChangeNote}
							placeholder={'Note'}
						/>
					</Input_>
				</Item_Container>
				<button
					type='submit'
					id={'add_server_form_submit_button'}
					style={{display: 'none'}}
				/>
			</_Form>
			<_Footer>
				<DefaultButton onClick={closeModal}>Cancel</DefaultButton>
				<PrimaryButton
					onClick={() =>
						document
							.getElementById('add_server_form_submit_button')
							.click()
					}
				>
					Save
				</PrimaryButton>
			</_Footer>
		</_Modal>
	);
};

export default AddServerForm;
