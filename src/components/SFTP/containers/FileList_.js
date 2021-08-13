import React, {useCallback, useEffect, useMemo, useState} from 'react';
import FileList from '../File/FileList';
import * as PropTypes from 'prop-types';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useContextMenu} from 'react-contexify';
import {
	ADD_HIGHLIGHT,
	ADD_HISTORY,
	ADD_ONE_HIGHLIGHT,
	CD_REQUEST,
	CREATE_NEW_WEBSOCKET_REQUEST,
	INITIALIZING_HIGHLIGHT,
	REMOVE_HIGHLIGHT,
} from '../../../reducers/sftp';
import {sortFunction} from '../functions';
import {authSelector} from '../../../reducers/api/auth';
import {settingSelector} from '../../../reducers/setting';
import {tabBarSelector} from '../../../reducers/tabBar';

const FileList_ = ({uuid}) => {
	const dispatch = useDispatch();
	const {server, identity} = useSelector(
		(state) => state.common,
		shallowEqual,
	);

	const {terminalTabs} = useSelector(tabBarSelector.all);

	const {language} = useSelector(settingSelector.all);
	const {
		path: sftp_pathState,
		file: sftp_fileState,
		high: sftp_highState,
		etc: sftp_etcState,
		socket: sftp_socketState,
		download: sftp_downloadState,
	} = useSelector((state) => state.sftp, shallowEqual);

	const {userData} = useSelector(authSelector.all);

	const corTab = useMemo(
		() => terminalTabs.find((it) => it.uuid === uuid),
		[terminalTabs, uuid],
	);
	const corServer = useMemo(
		() => server.find((it) => it.key === corTab.server.key),
		[corTab.server.key, server],
	);

	const correspondedIdentity = useMemo(
		() =>
			identity.find(
				(it) => it.key === corTab.server.key && it.checked === true,
			),
		[identity, corTab],
	);

	const {sortKeyword, toggle} = useMemo(
		() => sftp_etcState.find((it) => it.uuid === uuid),
		[sftp_etcState, uuid],
	);
	const {socket} = useMemo(
		() => sftp_socketState.find((it) => it.uuid === uuid),
		[sftp_socketState, uuid],
	);

	const {path, pathList} = useMemo(
		() => sftp_pathState.find((it) => it.uuid === uuid),
		[sftp_pathState, uuid],
	);
	const {fileList} = useMemo(
		() => sftp_fileState.find((it) => it.uuid === uuid),
		[sftp_fileState, uuid],
	);
	const {highlight} = useMemo(
		() => sftp_highState.find((it) => it.uuid === uuid),
		[sftp_highState, uuid],
	);
	const {readSocket, readList} = useMemo(
		() => sftp_downloadState.find((it) => it.uuid === uuid),
		[sftp_downloadState, uuid],
	);
	const {show} = useContextMenu({
		id: uuid + 'fileList',
	});

	const [currentFileList, setCurrentFileList] = useState([]);
	const [currentKey, setCurrentKey] = useState(sortKeyword);

	const handleChangeDirectory = useCallback(
		(item) => () => {
			if (pathList.length !== fileList.length) return;
			if (item.type === 'directory') {
				// 디렉토리 클릭시 해당 디렉토리로 이동
				dispatch({
					type: CD_REQUEST,
					payload: {
						socket: socket,
						uuid: uuid,
						path: path,
						cd_path:
							path === '/'
								? path + item.name
								: path + '/' + item.name,
					},
				});
				dispatch({type: INITIALIZING_HIGHLIGHT, payload: {uuid}});
			}
		},
		[dispatch, fileList.length, path, pathList.length, socket, uuid],
	);

	const handleDownload = useCallback(
		(item) => (e) => {
			e.stopPropagation();
			if (item.name !== '..' && item.type !== 'directory') {
				// 현재는 디렉토리 다운로드 막아두었음.
				dispatch({
					type: ADD_HISTORY,
					payload: {
						uuid: uuid,
						name: item.name,
						size: item.size,
						todo: 'read',
						progress: 0,
						path: path,
						file: item,
					},
				});
				if (!readSocket && readList.length === 0) {
					dispatch({
						type: CREATE_NEW_WEBSOCKET_REQUEST,
						paylaod: {
							token: userData.access_token, // connection info
							host: corServer.host,
							port: corServer.port,
							user: correspondedIdentity.user,
							password: correspondedIdentity.password,
							todo: 'read',
							uuid: uuid,
						},
					});
				}
			}
		},
		[
			readList,
			readSocket,
			dispatch,
			uuid,
			path,
			userData,
			corServer,
			correspondedIdentity,
		],
	);

	const handleEdit = useCallback(
		(item) => (e) => {
			e.stopPropagation();
			console.log(item);
			if (item.name !== '..' && item.type !== 'directory') {
				dispatch({
					type: ADD_HISTORY,
					payload: {
						uuid: uuid,
						name: item.name,
						size: item.size,
						todo: 'edit',
						progress: 0,
						path: path,
						file: item,
						key: 'read',
					},
				});

				if (!readSocket && readList.length === 0) {
					dispatch({
						type: CREATE_NEW_WEBSOCKET_REQUEST,
						payload: {
							token: userData.access_token, // connection info
							host: corServer.host,
							port: corServer.port,
							user: correspondedIdentity.user,
							password: correspondedIdentity.password,
							todo: 'read',
							uuid: uuid,
						},
					});
				}
			}
		},
		[
			readList,
			readSocket,
			dispatch,
			uuid,
			path,
			userData,
			corServer,
			correspondedIdentity,
		],
	);

	const handleContextMenu = useCallback(
		(item = '') =>
			(e) => {
				e.preventDefault();
				if (item.name === '..' || item.name === '') return;
				show(e);
				!highlight
					.slice()
					.find(
						(v) =>
							JSON.stringify(v) ===
							JSON.stringify({...item, path}),
					) &&
					item !== '' &&
					dispatch({
						type: ADD_ONE_HIGHLIGHT,
						payload: {uuid, item: {...item, path}},
					});
			},
		[dispatch, highlight, uuid, path, show],
	);

	const compareItem = useCallback(
		(list, first, second) => {
			dispatch({type: INITIALIZING_HIGHLIGHT, payload: {uuid}});

			if (first <= second) {
				for (let i = first; i <= second; i++) {
					dispatch({
						type: ADD_HIGHLIGHT,
						payload: {uuid, item: {...list[i], path}},
					});
				}
			} else {
				for (let i = first; i >= second; i--) {
					dispatch({
						type: ADD_HIGHLIGHT,
						payload: {uuid, item: {...list[i], path}},
					});
				}
			}
		},
		[dispatch, path, uuid],
	);

	const selectFile = useCallback(
		({item, index}) =>
			(e) => {
				if (item.name === '..') return;
				if (e.metaKey) {
					!highlight
						.slice()
						.find(
							(v) =>
								JSON.stringify(v) ===
								JSON.stringify({...item, path}),
						)
						? dispatch({
								type: ADD_HIGHLIGHT,
								payload: {uuid, item: {...item, path}},
						  })
						: dispatch({
								type: REMOVE_HIGHLIGHT,
								payload: {uuid, item: {...item, path}},
						  });
				} else if (e.shiftKey) {
					if (highlight.length === 0) {
						dispatch({
							type: ADD_HIGHLIGHT,
							payload: {uuid, item: {...item, path}},
						});
					} else {
						const firstIndex = currentFileList.findIndex(
							(it) => it.name === highlight[0].name,
						);
						compareItem(currentFileList, firstIndex, index);
					}
				} else {
					!highlight
						.slice()
						.find(
							(v) =>
								JSON.stringify(v) ===
								JSON.stringify({...item, path}),
						) &&
						dispatch({
							type: ADD_ONE_HIGHLIGHT,
							payload: {uuid, item: {...item, path}},
						});
				}
			},
		[highlight, dispatch, uuid, path, currentFileList, compareItem],
	);

	useEffect(() => {
		if (
			fileList.length === pathList.length &&
			pathList.length !== 0 &&
			fileList.length !== 0
		) {
			let nextList = fileList[fileList.length - 1];
			const sortedList = sortFunction({
				fileList: nextList,
				keyword: sortKeyword,
				toggle: currentKey === sortKeyword ? toggle : true,
			});
			setCurrentKey(sortKeyword);
			setCurrentFileList(sortedList);
		}
	}, [fileList, pathList, sortKeyword, toggle, currentKey]);

	return (
		<FileList
			uuid={uuid}
			highlight={highlight}
			path={path}
			lang={language}
			list={currentFileList}
			onContextMenu={handleContextMenu}
			onClick={selectFile}
			onDownload={handleDownload}
			onEdit={handleEdit}
			onDoubleClick={handleChangeDirectory}
		/>
	);
};

FileList_.propTypes = {
	uuid: PropTypes.string.isRequired,
};

export default FileList_;
