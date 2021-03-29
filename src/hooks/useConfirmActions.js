import React, {useCallback, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {
	SFTP_DELETE_HISTORY,
	SFTP_SAVE_CURRENT_HIGHLIGHT,
	SFTP_SAVE_CURRENT_LIST,
	SFTP_SAVE_CURRENT_MODE,
	SFTP_SAVE_HISTORY,
} from '../reducers/sftp';
import {DELETE_SERVER} from '../reducers/common';
import sftp_ws from '../ws/sftp_ws';
import {listConversion} from '../components/SFTP/commands';

const useConfirmActions = (ws, uuid) => {
	const dispatch = useDispatch();
	// const {currentPath, currentText, currentHighlight} = useSelector(
	// 	(state) => state.sftp,
	// );

	const deleteWorkFunction = useCallback(async (highlightItem) => {
		sftp_ws({
			keyword: 'CommandByPwd',
			ws,
			uuid,
		}).then(async (response) => {
			const path =
				response.result === '/'
					? response.result
					: response.result + '/';
			for await (const key of highlightItem?.list) {
				if (key.fileType === 'file') {
					await sftp_ws({
						keyword: 'CommandByRm',
						ws,
						uuid,
						path: path + key.fileName,
					});
				} else {
					await sftp_ws({
						keyword: 'CommandByRmdir',
						ws,
						uuid,
						path: path + key.fileName,
					});
				}
				dispatch({
					type: SFTP_SAVE_HISTORY,
					data: {
						uuid,
						name: key.fileName,
						path: response.result,
						size: key.fileSize,
						todo: 'rm',
						progress: 100,
						// 나중에 서버에서 정보 넘어올때마다 dispatch 해주고
						// 삭제, dispatch, 삭제 해서 progress 100 만들기
					},
				});
			}
			await sftp_ws({
				keyword: 'CommandByLs',
				ws,
				uuid,
				path: response.result,
			})
				.then((response) => listConversion(response.result))
				.then((response) =>
					dispatch({
						type: SFTP_SAVE_CURRENT_LIST,
						data: {uuid, list: response},
					}),
				)
				.then(() =>
					dispatch({
						type: SFTP_SAVE_CURRENT_HIGHLIGHT,
						data: {uuid, list: []},
					}),
				);
		});
	}, []);

	const renameWorkFunction = useCallback(async (highlightItem, formValue) => {
		await sftp_ws({
			keyword: 'CommandByPwd',
			ws,
			uuid,
		}).then((response) => {
			const path =
				response.result === '/'
					? response.result
					: response.result + '/';
			sftp_ws({
				keyword: 'CommandByRename',
				ws,
				uuid,
				path: path + highlightItem?.list[0].fileName,
				newPath: path + formValue,
			}).then(() =>
				sftp_ws({
					keyword: 'CommandByLs',
					ws,
					uuid,
					path: response.result,
				})
					.then((response) => listConversion(response.result))
					.then((response) =>
						dispatch({
							type: SFTP_SAVE_CURRENT_LIST,
							data: {uuid, list: response},
						}),
					),
			);
		});
		dispatch({
			type: SFTP_SAVE_CURRENT_HIGHLIGHT,
			data: {uuid, list: []},
		});
	}, []);

	const editFileFunction = useCallback(async (curText) => {
		// const curText = currentText.find((item) => item.uuid === uuid);
		const editedFile = new File([curText?.text], curText?.name, {
			type: 'text/plain',
		});
		sftp_ws({
			keyword: 'CommandByPwd',
			ws,
			uuid,
		}).then(async (response) => {
			await sftp_ws({
				keyword: 'CommandByPut',
				ws,
				uuid,
				path: response.result,
				fileName: editedFile.name,
				uploadFile: editedFile,
			}).then(() => {
				dispatch({
					type: SFTP_SAVE_HISTORY,
					data: {
						uuid,
						name: editedFile.name,
						path: response.result,
						size: editedFile.size,
						todo: 'edit',
						progress: 100,
						// 나중에 서버에서 정보 넘어올때마다 dispatch 해주고
						// 삭제, dispatch, 삭제 해서 progress 100 만들기
					},
				});
				dispatch({
					type: SFTP_SAVE_CURRENT_MODE,
					data: {uuid, mode: 'normal'},
				});
			});
		});
	}, []);

	const newFolderFunction = useCallback(async (formValue) => {
		await sftp_ws({
			keyword: 'CommandByPwd',
			ws,
			uuid,
		}).then((response) => {
			const path =
				response.result === '/'
					? response.result
					: response.result + '/';
			sftp_ws({
				keyword: 'CommandByMkdir',
				ws,
				uuid,
				path: path + formValue,
			}).then(() =>
				sftp_ws({
					keyword: 'CommandByPwd',
					ws,
					uuid,
				}).then((response) =>
					sftp_ws({
						keyword: 'CommandByLs',
						ws,
						uuid,
						path: response.result,
					})
						.then((response) => listConversion(response.result))
						.then((response) =>
							dispatch({
								type: SFTP_SAVE_CURRENT_LIST,
								data: {uuid, list: response},
							}),
						),
				),
			);
		});
		dispatch({
			type: SFTP_SAVE_CURRENT_HIGHLIGHT,
			data: {uuid, list: []},
		});
	}, []);

	const deleteHistoryFunction = useCallback(() => {
		dispatch({
			type: SFTP_DELETE_HISTORY,
			data: {id: -1, uuid},
		});
	}, []);

	return useMemo(
		() => ({
			deleteWork: (ws, uuid, curPath, highlightItem) => {
				deleteWorkFunction(ws, uuid, curPath, highlightItem);
			},

			renameWork: (ws, uuid, curPath, highlightItem, formValue) => {
				renameWorkFunction(ws, uuid, curPath, highlightItem, formValue);
			},

			editFile: (ws, uuid, curPath, curText) => {
				editFileFunction(ws, uuid, curPath, curText);
			},

			newFolder: (ws, uuid, curPath, formValue) => {
				newFolderFunction(ws, uuid, curPath, formValue);
			},

			deleteHistory: (uuid) => {
				deleteHistoryFunction();
			},

			deleteServer: () => {
				dispatch({type: DELETE_SERVER});
			},
		}),
		[dispatch],
	);
};

export default useConfirmActions;