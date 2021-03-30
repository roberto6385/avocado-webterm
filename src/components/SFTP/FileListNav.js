import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {
	BsLayoutThreeColumns,
	GoThreeBars,
	GoArrowLeft,
	MdHome,
} from 'react-icons/all';
import {PropTypes} from 'prop-types';
import {useDispatch, useSelector} from 'react-redux';
import {
	SFTP_SAVE_CURRENT_HIGHLIGHT,
	SFTP_SAVE_CURRENT_LIST,
	SFTP_SAVE_CURRENT_PATH,
} from '../../reducers/sftp';
import {NavItem} from '../../styles/sftp';
import {DEEP_GRAY_COLOR, GRAY_COLOR} from '../../styles/global';
import sftp_ws from '../../ws/sftp_ws';
import {listConversion} from './commands';
import useSftpCommands from '../../hooks/useSftpCommands';
import newSftp_ws from '../../ws/newSftp_ws';

const SearchPath = styled.input`
	flex: 1;
	border-radius: 4px;
	border: 1px solid ${GRAY_COLOR};
	padding: 0px 8px;
	outline: none;
	background: ${DEEP_GRAY_COLOR};
`;

const FileListNav = ({index, ws, uuid}) => {
	const {currentPath} = useSelector((state) => state.sftp);
	const pathItem = currentPath.find((item) => item.uuid === uuid);
	const [path, setPath] = useState('');
	const {initialWork} = useSftpCommands({ws, uuid});

	const goHome = (e, nextPath = '/root') => {
		newSftp_ws({
			keyword: 'CommandByCd',
			ws,
			path: nextPath,
		}).then(() => initialWork());

		// sftp_ws({
		// 	keyword: 'CommandByCd',
		// 	ws,
		// 	uuid,
		// 	path: nextPath,
		// }).then(() => initialWork());
		// dispatch({
		// 	type: SFTP_SAVE_CURRENT_HIGHLIGHT,
		// 	data: {uuid, list: []},
		// });
	};

	const goBack = (e) => {
		newSftp_ws({
			keyword: 'CommandByPwd',
			ws,
		}).then((response) => {
			if (response.path !== '/') {
				let tempPath = response.path.split('/');
				tempPath.pop();
				let nextPath = tempPath.join('/').trim();
				goHome(e, nextPath === '' ? '/' : nextPath);
			}
		});
	};
	const searchPath = (e) => {
		e.preventDefault();
		path !== '' && goHome(e, path);
	};

	const input = document.getElementById('fileListNavInput');
	input?.addEventListener('focusout', () => {
		setPath(pathItem?.path || '');
	});

	const handleChange = (e) => {
		const {value} = e.target;
		setPath(value);
	};

	const EscapeKey = (e) => {
		if (e.keyCode === 27) {
			setPath(pathItem?.path || '');
		}
	};

	useEffect(() => {
		setPath(pathItem?.path || '');
	}, [pathItem]);

	return (
		<>
			<NavItem>
				<BsLayoutThreeColumns />
			</NavItem>
			<NavItem>
				<GoThreeBars />
			</NavItem>
			<NavItem onClick={goHome}>
				<MdHome />
			</NavItem>
			<NavItem onClick={goBack}>
				<GoArrowLeft />
			</NavItem>
			<form
				style={{display: 'flex', width: '100%'}}
				onSubmit={searchPath}
			>
				<SearchPath
					id='fileListNavInput'
					type='text'
					value={path}
					onChange={handleChange}
					onKeyDown={EscapeKey}
				/>
			</form>
		</>
	);
};

FileListNav.propTypes = {
	index: PropTypes.number.isRequired,
	ws: PropTypes.object.isRequired,
	uuid: PropTypes.string.isRequired,
};

export default FileListNav;
