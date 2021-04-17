import React, {useCallback, useEffect, useState} from 'react';
import {PropTypes} from 'prop-types';
import {useContextMenu} from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import {MdEdit, MdFileDownload} from 'react-icons/md';
import {useDispatch, useSelector} from 'react-redux';
import {SFTP_SAVE_CURRENT_HIGHLIGHT} from '../../../reducers/subSftp';
import {toEditMode} from '../commands';
import FileListContextMenu from './FileListContextMenu';
import {
	CustomRightTh,
	CustomTable,
	CustomTbody,
	CustomTh,
	CustomThBtn,
	DirectoryIcon,
	FileIcon,
} from '../../../styles/sftp';
import TableHead from './FileListTableHead';
import useSftpCommands from '../../../hooks/useSftpCommands';
import {commandCdAction} from '../../../reducers/sftp';

const FileListContents = ({server}) => {
	const {socket, uuid, fileList} = server;
	console.log(fileList);
	const {currentHighlight} = useSelector((state) => state.subSftp);
	const {initialWork, downloadWork} = useSftpCommands({ws: socket, uuid});
	const highlightItem = currentHighlight.find((item) => item.uuid === uuid);
	const dispatch = useDispatch();
	const [data, setData] = useState([]);

	const {show} = useContextMenu({
		id: uuid + 'fileList',
	});

	const download = useCallback(
		(item) => (e) => {
			e.stopPropagation();
			if (item.fileName !== '..' && item.fileType !== 'directory') {
				// 현재는 디렉토리 다운로드 막아두었음.
				downloadWork('list', [item]);
			}
		},
		[],
	);

	const contextMenuOpen = useCallback(
		(e, item = '') => {
			e.preventDefault();
			show(e);
			e.stopPropagation();
			if (item === '') {
				dispatch({
					type: SFTP_SAVE_CURRENT_HIGHLIGHT,
					data: {uuid, list: []},
				});
			} else {
				if (
					highlightItem?.list.length < 2 ||
					!highlightItem?.list.includes(item)
				) {
					dispatch({
						type: SFTP_SAVE_CURRENT_HIGHLIGHT,
						data: {uuid, list: [item]},
					});
				}
			}
		},
		[uuid, highlightItem],
	);

	const selectItem = useCallback(
		(item) => (e) => {
			if (e.shiftKey) {
				const temp = highlightItem?.list || [];
				const tempB = highlightItem?.list.includes(item)
					? temp
					: temp.concat(item);

				dispatch({
					type: SFTP_SAVE_CURRENT_HIGHLIGHT,
					data: {uuid, list: tempB},
				});
			} else {
				if (item.fileType === 'directory') {
					// 디렉토리 클릭시 해당 디렉토리로 이동
					dispatch(
						commandCdAction({...server, newPath: item.fileName}),
					);
				} else {
					//파일 클릭시 하이라이팅!
					if (highlightItem?.list.includes(item)) {
						dispatch({
							type: SFTP_SAVE_CURRENT_HIGHLIGHT,
							data: {uuid, list: []},
						});
					} else {
						dispatch({
							type: SFTP_SAVE_CURRENT_HIGHLIGHT,
							data: {uuid, list: [item]},
						});
					}
				}
			}
		},
		[highlightItem, uuid],
	);

	useEffect(() => {
		const list = fileList;
		console.log(list);
		list.length > 0 && setData(list[list.length - 1]);
	}, [server]);

	return (
		<>
			<CustomTable>
				<TableHead />
				<CustomTbody onContextMenu={contextMenuOpen}>
					{data?.map((item, index) => {
						return (
							<tr
								onContextMenu={(e) => contextMenuOpen(e, item)}
								onClick={selectItem(item)}
								style={{display: 'flex', cursor: 'pointer'}}
								key={index + uuid}
								className={
									highlightItem?.list.includes(item)
										? 'highlight_tbody active'
										: 'highlight_tbody'
								}
							>
								<CustomTh flex={10}>
									{item.fileType === 'directory' ? (
										<DirectoryIcon />
									) : (
										<FileIcon />
									)}
									{item.fileName}
								</CustomTh>
								<CustomRightTh flex={2}>
									{item.fileName !== '..' && item.fileSize}
								</CustomRightTh>
								<CustomTh flex={3}>
									{item.fileName !== '..' &&
										item.lastModified}
								</CustomTh>
								<CustomTh flex={3}>{item.permission}</CustomTh>
								<CustomRightTh
									disabled={
										item.fileType === 'directory' ||
										(item.fileName === '..' && true)
									}
									onClick={(e) =>
										toEditMode(
											e,
											socket,
											uuid,
											'',
											item,
											dispatch,
											'list',
										)
									}
									flex={0.3}
								>
									<CustomThBtn
										color={
											item.fileType === 'directory'
												? 'transparent'
												: 'black'
										}
									>
										<MdEdit />
									</CustomThBtn>
								</CustomRightTh>
								<CustomRightTh
									disabled={item.fileName === '..' && true}
									onClick={download(item)}
									flex={0.3}
								>
									<CustomThBtn
										color={
											item.fileName === '..'
												? 'transparent'
												: 'black'
										}
									>
										<MdFileDownload />
									</CustomThBtn>
								</CustomRightTh>
							</tr>
						);
					})}
				</CustomTbody>
			</CustomTable>
			<FileListContextMenu server={server} />
		</>
	);
};

FileListContents.propTypes = {
	server: PropTypes.object.isRequired,
};

export default FileListContents;
