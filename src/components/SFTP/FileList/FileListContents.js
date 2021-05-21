import React, {useCallback, useEffect, useState} from 'react';
import {PropTypes} from 'prop-types';
import {useContextMenu} from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import {useDispatch, useSelector} from 'react-redux';
import FileListContextMenu from './FileListContextMenu';
import TableHead from './FileListTableHead';
import {
	ADD_HIGHLIGHT,
	ADD_HISTORY,
	ADD_ONE_HIGHLIGHT,
	commandCdAction,
	commandGetAction,
	INITIALIZING_HIGHLIGHT,
	REMOVE_HIGHLIGHT,
} from '../../../reducers/sftp';
import {Spinner} from 'react-bootstrap';
import {light_Background, MAIN_COLOR} from '../../../styles/global';
import {Th} from '../../../styles/tables';
import {
	formatByteSizeString,
	sortFunction,
	dataFormater,
} from '../listConversion';
import styled from 'styled-components';
import {
	BORDER_COLOR,
	IconButton,
	POPUP_SIDE_COLOR,
	THIRD_HEIGHT,
} from '../../../styles/global_design';

const Table = styled.table`
	display: flex;
	position: relative;
	flex: 1;
	flex-direction: column;
	overflow: scroll;
	margin: 0;
	padding: 0;
	border: none;
`;

const Tbody = styled.tbody`
	background-color: ${(props) => props?.back};
	flex: 1;
	position: absolute;
	top: ${THIRD_HEIGHT};
	overflow: scroll;
	.active {
		background: ${POPUP_SIDE_COLOR};
	}
	tr {
		cursor: pointer;
		display: flex;
		th {
			padding: 8px !important;
		}
	}
`;

const FileList_Tr = styled.tr`
	height: ${THIRD_HEIGHT};
	padding: 8px;
	border-bottom: 1px solid ${BORDER_COLOR};
`;

const FileListContents = ({uuid}) => {
	const {sftp} = useSelector((state) => state.sftp);
	const corServer = sftp.find((it) => it.uuid === uuid);
	const {fileList, highlight, pathList, sortKeyword, toggle} = corServer;
	const dispatch = useDispatch();

	const [currentFileList, setCurrentFileList] = useState([]);
	const [currentKey, setCurrentKey] = useState(sortKeyword);

	const {show} = useContextMenu({
		id: uuid + 'fileList',
	});

	const download = useCallback(
		(item) => (e) => {
			e.stopPropagation();
			if (item.name !== '..' && item.type !== 'directory') {
				// 현재는 디렉토리 다운로드 막아두었음.
				dispatch(
					commandGetAction({
						...corServer,
						file: item,
						keyword: 'get',
					}),
				);
				dispatch({
					type: ADD_HISTORY,
					payload: {
						uuid: uuid,
						name: item.name,
						size: item.size,
						todo: 'get',
						progress: 0,
					},
				});
			}
		},
		[sftp],
	);
	const edit = useCallback(
		(item) => (e) => {
			e.stopPropagation();
			console.log(item);
			if (item.name !== '..' && item.type !== 'directory') {
				// 현재는 디렉토리 다운로드 막아두었음.
				dispatch(
					commandGetAction({
						...corServer,
						file: item,
						keyword: 'edit',
					}),
				);
			}
		},
		[sftp],
	);

	const contextMenuOpen = useCallback(
		(e, item = '') => {
			e.preventDefault();
			e.stopPropagation();
			if (item.name === '..' || item.name === '') return;
			show(e);
			!highlight.includes(item) &&
				dispatch({
					type: ADD_ONE_HIGHLIGHT,
					payload: {uuid, item},
				});
		},
		[dispatch],
	);

	const compareNumber = (list, first, second) => {
		dispatch({type: INITIALIZING_HIGHLIGHT, payload: {uuid}});

		if (first <= second) {
			for (let i = first; i <= second; i++) {
				dispatch({
					type: ADD_HIGHLIGHT,
					payload: {uuid, item: list[i]},
				});
			}
		} else {
			for (let i = first; i >= second; i--) {
				dispatch({
					type: ADD_HIGHLIGHT,
					payload: {uuid, item: list[i]},
				});
			}
		}
	};

	const selectItem = useCallback(
		({item, index}) => (e) => {
			if (item.name === '..') return;
			if (e.metaKey) {
				!highlight.includes(item)
					? dispatch({
							type: ADD_HIGHLIGHT,
							payload: {uuid, item},
					  })
					: dispatch({type: REMOVE_HIGHLIGHT, payload: {uuid, item}});
			} else if (e.shiftKey) {
				if (highlight.length === 0) {
					dispatch({
						type: ADD_HIGHLIGHT,
						payload: {uuid, item},
					});
				} else {
					const corList = fileList[fileList.length - 1];
					const firstIndex = corList.findIndex(
						(it) => it.name === highlight[0].name,
					);
					compareNumber(corList, firstIndex, index);
				}
			} else {
				!highlight.includes(item) &&
					dispatch({
						type: ADD_ONE_HIGHLIGHT,
						payload: {uuid, item},
					});
			}
		},
		[sftp],
	);

	const changePath = useCallback(
		(item) => () => {
			if (item.type === 'directory') {
				// 디렉토리 클릭시 해당 디렉토리로 이동
				dispatch(commandCdAction({...corServer, newPath: item.name}));
				dispatch({type: INITIALIZING_HIGHLIGHT, payload: {uuid}});
			}
		},
		[sftp],
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
	}, [fileList, sortKeyword, toggle]);

	return currentFileList.length !== 0 ? (
		// return fileList.length === pathList.length ? (
		<React.Fragment>
			<Table back={light_Background}>
				<TableHead uuid={uuid} />
				<Tbody onContextMenu={contextMenuOpen}>
					{currentFileList.map((item, index) => {
						// . 파일은 표시하지 않음.
						if (
							pathList[pathList.length - 1] === '/' &&
							item.name === '..'
						)
							return;
						if (item.name === '.') return;
						return (
							<FileList_Tr
								onContextMenu={(e) => contextMenuOpen(e, item)}
								onClick={selectItem({item, index})}
								onDoubleClick={changePath(item)}
								key={index + uuid}
								className={
									highlight.includes(item)
										? 'highlight_tbody active'
										: 'highlight_tbody'
								}
							>
								<Th min={'150px'} flex={1}>
									{item.type === 'directory' ? (
										<span className='material-icons button_large'>
											folder_open
										</span>
									) : (
										<span className='material-icons button_large'>
											insert_drive_file
										</span>
									)}
									<span className='filelist_contents'>
										{item.name}
									</span>
								</Th>
								<Th min={'135px'} justify='flex-end'>
									{item.name !== '..' &&
										formatByteSizeString(item.size)}
								</Th>
								<Th min={'212px'}>
									{item.name !== '..' &&
										dataFormater({
											modify: item.lastModified,
											keyword: 'format',
										})}
								</Th>
								<Th min={'105px'}>{item.permission}</Th>
								<Th min={'100px'} justify={'flex-end'}>
									{item.type === 'file' && (
										<IconButton onClick={edit(item)}>
											<span className='material-icons button_large'>
												edit
											</span>
										</IconButton>
									)}
									{item.name !== '..' && (
										<IconButton onClick={download(item)}>
											<span className='material-icons button_large'>
												file_download
											</span>
										</IconButton>
									)}
								</Th>
							</FileList_Tr>
						);
					})}
				</Tbody>
			</Table>
			<FileListContextMenu uuid={uuid} />
		</React.Fragment>
	) : (
		<Spinner style={{color: MAIN_COLOR}} animation='border' role='status' />
	);
};

FileListContents.propTypes = {
	uuid: PropTypes.string.isRequired,
};

export default FileListContents;
