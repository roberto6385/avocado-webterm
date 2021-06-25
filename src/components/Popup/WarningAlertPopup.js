import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

import {CLOSE_WARNING_ALERT_POPUP} from '../../reducers/popup';
import {
	ACCOUT_CONTROL_ID,
	DELETE_ACCOUT,
	DELETE_SERVER_FOLDER,
} from '../../reducers/common';
import {
	DELETE_WORK_LIST,
	INIT_DELETE_WORK_LIST,
	INITIAL_HISTORY_HI,
	REMOVE_HISTORY,
	searchDeleteListAction,
} from '../../reducers/sftp';
import {cancelFillIcon, closeIconMedium} from '../../icons/icons';
import {
	ModalFooter,
	ModalHeader,
	ModalHeaderIconButton,
	ModalMessage,
	PopupModal,
	PopupText,
} from '../../styles/default';
import {PrimaryGreyButton, PrimaryRedButton} from '../../styles/button';

const _PopupModal = styled(PopupModal)`
	width: 290px;
`;

const WarningAlertPopup = () => {
	const {t} = useTranslation('warningAlertPopup');
	const dispatch = useDispatch();
	const {theme} = useSelector((state) => state.common);
	const {warning_alert_popup} = useSelector((state) => state.popup);
	const {
		clicked_server,
		accountListControlId,
		accountCheckList,
		nav,
	} = useSelector((state) => state.common);
	const {sftp} = useSelector((state) => state.sftp);

	const AlertMessage = {
		sftp_delete_file_folder: t('deleteFileFolder'),
		sftp_delete_history: t('deleteHistory'),
		delete_server_folder: t('deleteServerFolder'),
		delete_account: t('deleteAccount'),
	};

	const closeModal = useCallback(() => {
		dispatch({type: CLOSE_WARNING_ALERT_POPUP});
	}, []);

	const cancelFunction = useCallback(() => {
		warning_alert_popup.key === 'sftp_delete_file_folder' &&
			dispatch({
				type: INIT_DELETE_WORK_LIST,
				payload: {uuid: warning_alert_popup.uuid},
			});
		closeModal();
	}, [warning_alert_popup]);

	const submitFunction = useCallback(
		async (e) => {
			e.preventDefault();
			const array = [];

			switch (warning_alert_popup.key) {
				case 'sftp_delete_file_folder': {
					const uuid = warning_alert_popup.uuid;
					const corServer = sftp.find((it) => it.uuid === uuid);
					const {highlight, path} = corServer;
					for (let value of highlight) {
						if (value.name !== '.' && value.name !== '..') {
							array.push({file: value, path});
						}
					}
					await dispatch({
						type: DELETE_WORK_LIST,
						payload: {
							uuid: uuid,
							array,
						},
					});

					for (let item of highlight) {
						const lastValue = highlight
							.slice()
							.sort()
							.find(
								(v) =>
									v.type === 'directory' &&
									v.name !== '..' &&
									v.name !== '.',
							);
						console.log(lastValue);
						if (
							item.type === 'directory' &&
							item.name !== '..' &&
							item.name !== '.'
						) {
							console.log(path);
							console.log(item.name);
							const delete_path =
								path === '/'
									? `${path}${item.name}`
									: `${path}/${item.name}`;
							const last_path =
								path === '/'
									? `${path}${lastValue.name}`
									: `${path}/${lastValue.name}`;
							dispatch(
								searchDeleteListAction({
									socket: corServer.socket,
									uuid: corServer.uuid,
									delete_path: delete_path,
									last_path:
										delete_path === last_path
											? last_path
											: null,
								}),
							);
						}
					}
					break;
				}

				case 'sftp_delete_history': {
					const corServer = sftp.find(
						(it) => it.uuid === warning_alert_popup.uuid,
					);
					const {history_highlight} = corServer;
					history_highlight.forEach((item) => {
						console.log(item);
						dispatch({
							type: REMOVE_HISTORY,
							payload: {
								uuid: warning_alert_popup.uuid,
								history: item,
							},
						});
					});
					dispatch({
						type: INITIAL_HISTORY_HI,
						payload: {uuid: warning_alert_popup.uuid},
					});
					break;
				}

				case 'delete_server_folder':
					console.log(clicked_server);
					clicked_server && dispatch({type: DELETE_SERVER_FOLDER});
					break;

				case 'delete_account': {
					if (accountListControlId && accountCheckList.length === 0) {
						dispatch({
							type: DELETE_ACCOUT,
							payload: {id: accountListControlId},
						});

						dispatch({
							type: ACCOUT_CONTROL_ID,
							payload: {id: null},
						});
					} else {
						accountCheckList.forEach((id) => {
							dispatch({
								type: DELETE_ACCOUT,
								payload: {id},
							});
						});
					}

					break;
				}

				default:
					break;
			}
			closeModal();
		},
		[clicked_server, accountListControlId, warning_alert_popup, sftp, nav],
	);

	return (
		<_PopupModal
			isOpen={warning_alert_popup.open}
			onRequestClose={cancelFunction}
			ariaHideApp={false}
			shouldCloseOnOverlayClick={false}
			theme_value={theme}
		>
			<ModalHeader theme_value={theme}>
				<div theme_value={theme}>{t('alert')}</div>
				<ModalHeaderIconButton
					theme_value={theme}
					onClick={cancelFunction}
				>
					{closeIconMedium}
				</ModalHeaderIconButton>
			</ModalHeader>

			<ModalMessage theme_value={theme}>
				<div>{cancelFillIcon}</div>
				<PopupText>{AlertMessage[warning_alert_popup.key]}</PopupText>
			</ModalMessage>

			<ModalFooter theme_value={theme}>
				<PrimaryGreyButton theme_value={theme} onClick={cancelFunction}>
					{t('cancel')}
				</PrimaryGreyButton>
				<PrimaryRedButton theme_value={theme} onClick={submitFunction}>
					{t('delete')}
				</PrimaryRedButton>
			</ModalFooter>
		</_PopupModal>
	);
};

export default WarningAlertPopup;
