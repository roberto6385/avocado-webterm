import React, {useCallback, useEffect, useMemo, useState} from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';

import {
	CHANGE_MODE,
	commandCdAction,
	commandPwdAction,
	READY_STATE,
} from '../../../reducers/sftp';

import {
	arrowUpwordIcon,
	homeIcon,
	refreshIcon,
	viewColumnIcon,
	viewListIcon,
} from '../../../icons/icons';
import {FONT_14, HEIGHT_34, HEIGHT_50} from '../../../styles/length';
import {
	activeColor,
	borderColor,
	fontColor,
	iconColor,
	filelistInputBack,
	tabColor,
} from '../../../styles/color';
import {ClickableIconButton} from '../../../styles/button';

const _input = styled.input`
	height: ${HEIGHT_34};
	width: 100%;
	border-radius: 4px;
	font-size: ${FONT_14};
	border: none;
	padding: 0px 13px;
	outline: none;
	background: ${(props) => props.back};
	color: ${(props) => props.color};
`;

const _Container = styled.div`
	display: flex;
	align-items: center;
	background: ${(props) => props?.back};
	border-bottom: 1px solid;
	border-color: ${(props) => props?.bcolor};
	height: ${HEIGHT_50};
`;

const _Form = styled.form`
	display: flex;
	flex: 1;
`;

const FileListNav = ({uuid}) => {
	const dispatch = useDispatch();
	const {
		path: sftp_pathState,
		socket: sftp_socketState,
		etc: sftp_etcState,
	} = useSelector((state) => state.sftp, shallowEqual);
	const theme = useSelector((state) => state.common.theme);

	const {path} = useMemo(
		() => sftp_pathState.find((it) => it.uuid === uuid),
		[sftp_pathState, uuid],
	);
	const {socket} = useMemo(
		() => sftp_socketState.find((it) => it.uuid === uuid),
		[sftp_socketState, uuid],
	);
	const {mode} = useMemo(
		() => sftp_etcState.find((it) => it.uuid === uuid),
		[sftp_etcState, uuid],
	);

	const [currentPath, setCurrentPath] = useState('');

	const goHome = (e, nextPath = '/root') => {
		const pathInput = document.getElementById('fileListNavInput');
		console.log(nextPath);
		nextPath !== undefined &&
			dispatch(
				commandCdAction({
					socket: socket,
					uuid: uuid,
					path: path,
					cd_path: nextPath,
					dispatch: dispatch,
				}),
			) &&
			pathInput.blur();
	};

	const goBack = (e) => {
		if (path !== '/') {
			console.log(path);
			let tempPath = path.split('/');
			tempPath.pop();
			console.log(tempPath);
			let nextPath = tempPath.join('/').trim();
			goHome(e, nextPath === '' ? '/' : nextPath);
		}
	};
	const searchPath = (e) => {
		e.preventDefault();
		currentPath !== '' ? goHome(e, currentPath) : setCurrentPath(path);
	};

	const handleChange = (e) => {
		const {value} = e.target;
		setCurrentPath(value);
	};

	const EscapeKey = (e) => {
		const pathInput = document.getElementById('fileListNavInput');

		if (e.keyCode === 27) {
			setCurrentPath(path);
			pathInput.blur();
		}
	};

	const dropdownList = () => {
		mode !== 'drop' &&
			dispatch({
				type: CHANGE_MODE,
				payload: {
					uuid,
					mode: 'drop',
					currentMode: mode,
				},
			});
	};

	const basicList = () => {
		mode !== 'list' &&
			dispatch({
				type: CHANGE_MODE,
				payload: {
					uuid,
					mode: 'list',
					currentMode: mode,
				},
			});
	};

	const refresh = useCallback(() => {
		dispatch(
			commandPwdAction({
				socket: socket,
				uuid: uuid,
				pwd_path: null,
			}),
		);
	}, [uuid, dispatch]);

	useEffect(() => {
		uuid && setCurrentPath(path);
	}, [uuid, path]);

	return (
		<_Container back={tabColor[theme]} bcolor={borderColor[theme]}>
			<ClickableIconButton
				margin={'13px 5px 13px 16px'}
				theme_value={theme}
				onClick={goBack}
			>
				{arrowUpwordIcon}
			</ClickableIconButton>
			<ClickableIconButton
				margin={'13px 5px'}
				color={mode === 'list' ? activeColor[theme] : iconColor[theme]}
				theme_value={theme}
				onClick={basicList}
			>
				{viewListIcon}
			</ClickableIconButton>
			<ClickableIconButton
				margin={'13px 16px 13px 5px'}
				theme_value={theme}
				color={mode === 'drop' ? activeColor[theme] : iconColor[theme]}
				onClick={dropdownList}
			>
				{viewColumnIcon}
			</ClickableIconButton>
			<_Form onSubmit={searchPath} autoComplete='off'>
				<_input
					id='fileListNavInput'
					type='text'
					value={currentPath}
					onChange={handleChange}
					onKeyDown={EscapeKey}
					back={filelistInputBack[theme]}
					color={fontColor[theme]}
					onBlur={() => setCurrentPath(path)}
				/>
			</_Form>
			<ClickableIconButton
				margin={'13px 5px 13px 16px'}
				theme_value={theme}
				onClick={refresh}
			>
				{refreshIcon}
			</ClickableIconButton>
			<ClickableIconButton
				margin={'13px 16px 13px 5px'}
				theme_value={theme}
				onClick={goHome}
			>
				{homeIcon}
			</ClickableIconButton>
		</_Container>
	);
};

FileListNav.propTypes = {
	uuid: PropTypes.string.isRequired,
};

export default React.memo(FileListNav);
