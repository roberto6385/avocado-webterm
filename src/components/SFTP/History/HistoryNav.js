import React, {useCallback, useState} from 'react';
import {MdFileUpload, MdDelete, IoCheckmarkDoneSharp} from 'react-icons/all';
import {PropTypes} from 'prop-types';
import {useDispatch, useSelector} from 'react-redux';
import {ADD_HISTORY, commandPutAction} from '../../../reducers/sftp';
import {OPEN_CONFIRM_POPUP} from '../../../reducers/popup';
import {PrevIconButton} from '../../../styles/buttons';
import styled from 'styled-components';
import {
	Avocado_span,
	BORDER_COLOR,
	IconButton,
	ICON_LIGHT_COLOR,
	SUB_HEIGHT,
} from '../../../styles/global_design';
const HistoryNav_Container = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0px 16px;
	height: ${SUB_HEIGHT};
	border-bottom: 1px solid ${BORDER_COLOR};
`;

const HistoryNav = ({uuid}) => {
	const dispatch = useDispatch();

	const {sftp} = useSelector((state) => state.sftp);
	const corServer = sftp.find((it) => it.uuid === uuid);
	const {history_highlight} = corServer;

	const upload = useCallback(async () => {
		const uploadInput = document.createElement('input');
		document.body.appendChild(uploadInput);
		uploadInput.setAttribute('type', 'file');
		uploadInput.setAttribute('multiple', 'multiple');
		uploadInput.setAttribute('style', 'display:none');
		uploadInput.click();
		uploadInput.onchange = async (e) => {
			const files = e.target.files;
			for await (let value of files) {
				dispatch(
					commandPutAction({
						...corServer,
						file: value,
						keyword: 'put',
					}),
				);
				dispatch({
					type: ADD_HISTORY,
					payload: {
						uuid: uuid,
						name: value.name,
						size: value.size,
						todo: 'put',
						progress: 0,
					},
				});
			}
			dispatch(commandPutAction({...corServer, keyword: 'pwd'}));
		};
		document.body.removeChild(uploadInput);
	}, [corServer]);

	const historyDelete = useCallback(() => {
		// if exist highlighting history
		history_highlight.length > 0 &&
			dispatch({
				type: OPEN_CONFIRM_POPUP,
				data: {key: 'sftp_delete_history', uuid: uuid},
			});
	}, [corServer, history_highlight]);

	return (
		<HistoryNav_Container>
			<Avocado_span>Transfer</Avocado_span>
			<div>
				<IconButton onClick={upload}>
					<span className='material-icons button_large'>
						file_upload
					</span>
				</IconButton>
				<IconButton
					className={'history_contents'}
					onClick={historyDelete}
				>
					<span className='material-icons button_large'>delete</span>
				</IconButton>
			</div>
		</HistoryNav_Container>
	);
};

HistoryNav.propTypes = {
	uuid: PropTypes.string.isRequired,
};

export default HistoryNav;
