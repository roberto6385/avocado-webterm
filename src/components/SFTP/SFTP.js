import React, {useEffect} from 'react';
import {PropTypes} from 'prop-types';
import FileList from './FileList';
import History from './History';

import {sendCommandByPwd} from './commands/sendCommandPwd';
import {useDispatch, useSelector} from 'react-redux';
import {
	SFTP_SAVE_CURRENT_MODE,
	SFTP_SAVE_CURRENT_TYPE,
} from '../../reducers/sftp';
import Edit from './Edit';
import {SftpContainer} from '../../styles/sftp';
import usePostMessage from './hooks/usePostMessage';

const SFTP_COMPONENT = ({index, socket}) => {
	const {ws, uuid} = socket;
	const dispatch = useDispatch();

	const {currentMode} = useSelector((state) => state.sftp);
	const modeItem = currentMode.find((item) => item.uuid === uuid);

	return (
		<SftpContainer>
			{modeItem?.mode === 'edit' ? (
				<Edit index={index} socket={socket} />
			) : (
				<>
					<FileList index={index} socket={socket} />
					<History index={index} socket={socket} />
				</>
			)}
		</SftpContainer>
	);
};

SFTP_COMPONENT.propTypes = {
	index: PropTypes.number.isRequired,
	socket: PropTypes.object.isRequired,
};

export default SFTP_COMPONENT;