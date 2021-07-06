import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {CLOSE_SAVE_POPUP} from '../../reducers/popup';
import styled from 'styled-components';

import {alertFillIcon, closeIcon} from '../../icons/icons';
import {
	ModalFooter,
	ModalHeader,
	ModalMessage,
	PopupModal,
	PopupText,
} from '../../styles/default';
import {createNewWebsocket, PUSH_WRITE_LIST} from '../../reducers/sftp/crud';

import {
	ClickableIconButton,
	IconBox,
	PrimaryGreenButton,
	PrimaryGreyButton,
} from '../../styles/button';
import {fontColor} from '../../styles/color';
import {CHANGE_MODE, CLOSE_EDITOR, SAVE_TEXT} from '../../reducers/sftp/sftp';

const _PopupModal = styled(PopupModal)`
	width: 290px;
`;

const SavePopup = () => {
	const {t} = useTranslation('savePopup');
	const dispatch = useDispatch();
	const save_popup = useSelector((state) => state.popup.save_popup);
	const sftp = useSelector((state) => state.sftp.sftp);
	const listState = useSelector((state) => state.list.listState);
	const userTicket = useSelector((state) => state.userTicket.userTicket);
	const {theme, tab, server, identity} = useSelector(
		(state) => state.common,
		shallowEqual,
	);

	const SaveMessage = {
		sftp_edit_save: t('editSave'),
		sftp_edit_close: t('editClose'),
	};

	const closeModal = useCallback(() => {
		switch (save_popup.key) {
			case 'sftp_edit_save': {
				dispatch({type: CLOSE_SAVE_POPUP});
				break;
			}
			case 'sftp_edit_close': {
				const uuid = save_popup.uuid;
				const corSftpInfo = sftp.find((it) => it.uuid === uuid);
				const {prevMode} = corSftpInfo;
				dispatch({type: CLOSE_SAVE_POPUP});
				dispatch({
					type: CLOSE_EDITOR,
					payload: {uuid: save_popup.uuid},
				});
				dispatch({
					type: CHANGE_MODE,
					payload: {uuid: save_popup.uuid, mode: prevMode},
				});

				break;
			}
		}
	}, [save_popup]);

	const submitFunction = useCallback(
		(e) => {
			e.preventDefault();

			const uuid = save_popup.uuid;
			const corTab = tab.find((it) => it.uuid === uuid);
			const corSftpInfo = sftp.find((it) => it.uuid === uuid);
			const corListInfo = listState.find((it) => it.uuid === uuid);
			const correspondedIdentity = identity.find(
				(it) => it.key === corTab.server.key && it.checked === true,
			);

			const corServer = server.find((it) => it.key === corTab.server.key);
			const {path} = corListInfo;
			const {editText, editFile, prevMode} = corSftpInfo;
			const uploadFile = new File([editText], editFile.name, {
				type: 'text/plain',
			});

			switch (save_popup.key) {
				case 'sftp_edit_save': {
					dispatch(
						createNewWebsocket({
							token: userTicket.access_token, // connection info
							host: corServer.host,
							port: corServer.port,
							user: correspondedIdentity.user,
							password: correspondedIdentity.password,
							todo: 'write',
							uuid: uuid,
						}),
					);
					dispatch({
						type: PUSH_WRITE_LIST,
						payload: {
							uuid,
							array: [{path, file: uploadFile, todo: 'edit'}],
						},
					});

					dispatch({
						type: SAVE_TEXT,
						payload: {uuid, text: editText},
					});

					break;
				}
				case 'sftp_edit_close': {
					dispatch(
						createNewWebsocket({
							token: userTicket.access_token, // connection info
							host: corServer.host,
							port: corServer.port,
							user: correspondedIdentity.user,
							password: correspondedIdentity.password,
							todo: 'write',
							uuid: uuid,
						}),
					);
					dispatch({
						type: PUSH_WRITE_LIST,
						payload: {
							uuid,
							array: [{path, file: uploadFile, todo: 'edit'}],
						},
					});
					dispatch({
						type: SAVE_TEXT,
						payload: {uuid, text: editText},
					});
					dispatch({
						type: CLOSE_EDITOR,
						payload: {uuid: save_popup.uuid},
					});
					dispatch({
						type: CHANGE_MODE,
						payload: {uuid: save_popup.uuid, mode: prevMode},
					});
					break;
				}

				default:
					break;
			}
			closeModal();
		},
		[save_popup, sftp, tab, identity, server, userTicket, listState],
	);

	return (
		<_PopupModal
			isOpen={save_popup.open}
			onRequestClose={closeModal}
			ariaHideApp={false}
			shouldCloseOnOverlayClick={false}
			theme_value={theme}
		>
			<ModalHeader theme_value={theme}>
				<div>{t('alert')}</div>
				<ClickableIconButton
					color={fontColor[theme]}
					size={'sm'}
					margin={'0px'}
				>
					{closeIcon}
				</ClickableIconButton>
			</ModalHeader>

			<ModalMessage theme_value={theme}>
				<IconBox margin_right='6px' color={'#178082'}>
					{alertFillIcon}
				</IconBox>
				<PopupText>{SaveMessage[save_popup.key]}</PopupText>
			</ModalMessage>

			<ModalFooter theme_value={theme}>
				<PrimaryGreyButton theme_value={theme} onClick={closeModal}>
					{t('cancel')}
				</PrimaryGreyButton>
				<PrimaryGreenButton
					theme_value={theme}
					onClick={submitFunction}
				>
					{t('save')}
				</PrimaryGreenButton>
			</ModalFooter>
		</_PopupModal>
	);
};

export default SavePopup;
