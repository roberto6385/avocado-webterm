import React, {useCallback} from 'react';
import * as PropTypes from 'prop-types';
import {useDispatch, useSelector} from 'react-redux';
import {
	DirectoryIcon,
	DropdownLi,
	DropdownUl,
	FileIcon,
} from '../../../styles/sftp';
import {useContextMenu} from 'react-contexify';
import FileListContextMenu from './FileListContextMenu';
import {
	ADD_HIGHLIGHT,
	ADD_ONE_HIGHLIGHT,
	commandCdAction,
	INITIALIZING_HIGHLIGHT,
	REMOVE_HIGHLIGHT,
	SAVE_TEMP_PATH,
} from '../../../reducers/sftp';
import {Spinner} from 'react-bootstrap';
import {MAIN_COLOR} from '../../../styles/global';

const FileListDropDown = ({uuid}) => {
	const {sftp} = useSelector((state) => state.sftp);
	const corServer = sftp.find((it) => it.uuid === uuid);
	const {fileList, pathList, highlight} = corServer;

	const dispatch = useDispatch();
	const {show} = useContextMenu({
		id: uuid + 'fileList',
	});
	function displayMenu(e) {
		show(e);
	}

	const compareNumber = (list, first, second) => {
		dispatch({
			type: INITIALIZING_HIGHLIGHT,
			payload: {uuid},
		});

		if (first <= second) {
			for (let i = first; i <= second; i++) {
				dispatch({
					type: ADD_HIGHLIGHT,
					payload: {uuid, item: list[i], path: corServer.path},
				});
			}
		} else {
			for (let i = first; i >= second; i--) {
				dispatch({
					type: ADD_HIGHLIGHT,
					payload: {uuid, item: list[i], path: corServer.path},
				});
			}
		}
	};

	const selectFile = useCallback(
		({item, listindex, itemIndex}) => (e) => {
			if (e.shiftKey) {
				if (corServer.path !== pathList[listindex]) {
					dispatch(
						commandCdAction({
							...corServer,
							newPath: pathList[listindex],
						}),
					);
					dispatch({
						type: ADD_ONE_HIGHLIGHT,
						payload: {
							uuid,
							item,
							path: pathList[listindex],
						},
					});
				} else {
					if (highlight.length === 0) {
						dispatch({
							type: ADD_ONE_HIGHLIGHT,
							payload: {
								uuid,
								item,
								path: pathList[listindex],
							},
						});
					} else {
						const corList = fileList[listindex];
						console.log(corList);
						const firstIndex = corList.findIndex(
							(it) => it.name === highlight[0].item.name,
						);
						compareNumber(corList, firstIndex, itemIndex);
					}
				}
			} else {
				const finalPath =
					// 타입이 디렉토리면 해당 디렉토리로 내부 경로
					// 파일이면 해당 파일의 경로
					item.type === 'directory'
						? pathList[listindex] === '/'
							? `${pathList[listindex]}${item.name}`
							: `${pathList[listindex]}/${item.name}`
						: pathList[listindex];

				/// 여기서 부터 case 나누기
				if (corServer.path !== finalPath) {
					console.log('우선 다른경로');
					if (e.metaKey) {
						if (highlight.length === 0) {
							console.log('하이라이팅 아이템 없음, 경로이동');
							console.log(finalPath);
							dispatch(
								commandCdAction({
									...corServer,
									newPath: finalPath,
								}),
							);
							dispatch({
								type: INITIALIZING_HIGHLIGHT,
								payload: {uuid},
							});
							dispatch({
								type: ADD_ONE_HIGHLIGHT,
								payload: {
									uuid,
									item,
									path: pathList[listindex],
								},
							});
						} else {
							dispatch(
								commandCdAction({
									...corServer,
									newPath: pathList[listindex],
								}),
							);
							highlight.find(
								(it) =>
									it.item.name === item.name &&
									it.path === pathList[listindex],
							) === undefined
								? dispatch({
										type: ADD_HIGHLIGHT,
										payload: {
											uuid,
											item,
											path: pathList[listindex],
										},
								  })
								: dispatch({
										type: REMOVE_HIGHLIGHT,
										payload: {uuid, item},
								  });
						}
					} else {
						dispatch(
							commandCdAction({
								...corServer,
								newPath: finalPath,
							}),
						);
						dispatch({
							type: ADD_ONE_HIGHLIGHT,
							payload: {uuid, item, path: pathList[listindex]},
						});
					}
				} else {
					console.log('현재 경로의 아이템 입니다!!');
					if (e.metaKey) {
						highlight.find(
							(it) =>
								it.item.name === item.name &&
								it.path === pathList[listindex],
						) === undefined
							? dispatch({
									type: ADD_HIGHLIGHT,
									payload: {
										uuid,
										item,
										path: pathList[listindex],
									},
							  })
							: dispatch({
									type: REMOVE_HIGHLIGHT,
									payload: {uuid, item},
							  });
					} else {
						item.type === 'directory'
							? dispatch(
									commandCdAction({
										...corServer,
										newPath: finalPath,
									}),
							  )
							: dispatch({
									type: ADD_ONE_HIGHLIGHT,
									payload: {
										uuid,
										item,
										path: pathList[listindex],
									},
							  });
					}
				}
			}
		},
		[corServer],
	);

	console.log('현재 하이라이팅 아이템');
	console.log(highlight);

	const contextMenuOpen = useCallback(
		({item, path}) => (e) => {
			e.preventDefault();
			displayMenu(e);
			e.stopPropagation();
			if (corServer.path !== path) {
				dispatch(
					commandCdAction({
						...corServer,
						newPath: path,
					}),
				);
			}

			dispatch({type: SAVE_TEMP_PATH, payload: {uuid, path}});

			console.log(item, path);
			highlight.length < 2 &&
				item !== undefined &&
				path !== undefined &&
				dispatch({
					type: ADD_ONE_HIGHLIGHT,
					payload: {uuid, item, path},
				});
		},
		[corServer],
	);

	return fileList.length === pathList.length ? (
		<>
			{fileList.map((listItem, listindex) => {
				return (
					<DropdownUl
						id='fileList_ul'
						key={listindex}
						onContextMenu={contextMenuOpen({
							path: pathList[listindex],
						})}
					>
						{listItem.map((item, index) => {
							return (
								<DropdownLi
									className={
										highlight.findIndex(
											(it) =>
												it.item.name === item.name &&
												it.path === pathList[listindex],
										) === -1
											? 'highlight_list'
											: 'highlight_list active'
									}
									key={index}
									onContextMenu={contextMenuOpen({
										item,
										path: pathList[listindex],
									})}
									onClick={selectFile({
										item,
										listindex,
										itemIndex: index,
									})}
								>
									<p
										className={'highlight_list_p'}
										style={{
											margin: 0,
											padding: 0,
											color:
												pathList[listindex + 1]
													?.split('/')
													.pop() === item.name
													? MAIN_COLOR
													: 'black',
										}}
									>
										{item.type === 'directory' ? (
											<DirectoryIcon />
										) : (
											<FileIcon />
										)}
										{item.name}
									</p>
								</DropdownLi>
							);
						})}
					</DropdownUl>
				);
			})}
			<FileListContextMenu uuid={uuid} />
		</>
	) : (
		<Spinner style={{color: MAIN_COLOR}} animation='border' role='status' />
	);
};

FileListDropDown.propTypes = {
	uuid: PropTypes.string.isRequired,
};
export default FileListDropDown;
