import React, {useCallback} from 'react';
import PropTypes from 'prop-types';
import Dropzone from '../Dropzone';
import {useDispatch, useSelector} from 'react-redux';
import {FaEdit, MdRemoveCircle} from 'react-icons/all';
import {
	ADD_HISTORY_HI,
	ADD_HISTORY,
	commandPutAction,
	INITIAL_HISTORY_HI,
	REMOVE_HISTORY,
} from '../../../reducers/sftp';
import {formatByteSizeString} from '../listConversion';
import {
	GREEN_COLOR,
	SERVER_HOVER_COLOR,
	Span,
	BORDER_COLOR,
	IconButton,
	DROP_SPACE_HEIGHT,
	EIGHTEEN,
	FONT_COLOR,
	HISTORY_FONTSIZE,
	HISTORY_ITEM_WIDTH,
	ICON_LIGHT_COLOR,
	PATH_SEARCH_INPUT_HEIGHT,
	TAB_WIDTH,
	AVOCADO_HOVER_COLOR,
	PreventDragCopy,
	THIRD_HEIGHT,
} from '../../../styles/global_design';
import styled from 'styled-components';

const DropSpaceDiv = styled.div`
	height: ${DROP_SPACE_HEIGHT};
	margin: 8px;
	border: 1px dashed ${BORDER_COLOR};
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;

const _Ul = styled.ul`
	${PreventDragCopy}
	width:${(props) => props.width};
	list-style: none;
	overflow-y: scroll;
	margin: 0px;
	padding: 0px;
	outline: none;
	position: relative;
`;

const _Li = styled.li`
	line-height: 0;
	position: relative;
	height: ${THIRD_HEIGHT};
	padding: 4px;
	display: flex;
	align-items: center;
	background: ${(props) => props.back};
	white-space: nowrap;
	border-bottom: 1px solid ${BORDER_COLOR};
`;

const DropSpace_Button = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;
	width: ${TAB_WIDTH};
	height: ${PATH_SEARCH_INPUT_HEIGHT};
	background: ${GREEN_COLOR};
	color: white;
	border-radius: 4px;
	border: none;
	margin: 16px 40px 30px 40px;
	&:hover {
		background: ${AVOCADO_HOVER_COLOR};
	}
`;

const ItemName_Span = styled(Span)`
	width: ${HISTORY_ITEM_WIDTH};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	line-height: initial;
	padding: 6px;
`;

const IconSpan = styled.span`
	font-size: ${EIGHTEEN};
	color: ${(props) => props.color};
	padding-left: 16px;
`;

const Progress = styled.div`
	position: absolute;
	bottom: 0;
	width: 100%;
`;
const Bar = styled.div`
	width: ${(props) => props?.width || '0%'};
	height: 2px;
	background: ${GREEN_COLOR};
`;

const HistoryContents = ({uuid}) => {
	const {sftp} = useSelector((state) => state.sftp);
	const corServer = sftp.find((it) => it.uuid === uuid);
	const {history, history_highlight} = corServer;
	const dispatch = useDispatch();

	const openUpload = useCallback(async () => {
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

	const upload = useCallback(
		async (files) => {
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
		},
		[corServer],
	);

	console.log(history_highlight);
	const selectItem = useCallback(
		(selectValue, index) => (e) => {
			e.stopPropagation();
			console.log(selectValue, index);
			const prev_history = history.slice();
			const prev_history_hi = history_highlight.slice();
			if (e.metaKey) {
				if (prev_history_hi.find((item) => item === selectValue)) {
					dispatch({
						type: ADD_HISTORY_HI,
						payload: {
							uuid,
							history: prev_history_hi.filter(
								(item) => item !== selectValue,
							),
						},
					});
				} else {
					prev_history_hi.push(selectValue);
					dispatch({
						type: ADD_HISTORY_HI,
						payload: {uuid, history: prev_history_hi},
					});
				}
			} else if (e.shiftKey) {
				if (prev_history_hi.length === 0) {
					dispatch({
						type: ADD_HISTORY_HI,
						payload: {
							uuid,
							history: [selectValue],
						},
					});
				} else {
					compareNumber(
						prev_history.findIndex(
							(item) => item === prev_history_hi[0],
						),
						index,
					);
				}
			} else {
				dispatch({
					type: ADD_HISTORY_HI,
					payload: {
						uuid,
						history: [selectValue],
					},
				});
			}
		},
		[dispatch, history, history_highlight],
	);

	const compareNumber = (first, second) => {
		console.log(first, second);
		dispatch({type: INITIAL_HISTORY_HI, payload: {uuid}});

		let list = [];
		if (first <= second) {
			for (let i = first; i <= second; i++) {
				list.push(history[i]);
			}
		} else {
			for (let i = first; i >= second; i--) {
				list.push(history[i]);
			}
		}
		dispatch({
			type: ADD_HISTORY_HI,
			payload: {
				uuid,
				history: list,
			},
		});
	};

	const removeHistory = useCallback(
		(history) => () => {
			dispatch({type: REMOVE_HISTORY, payload: {uuid, history}});
		},
		[dispatch],
	);

	// const {show} = useContextMenu({
	// 	id: uuid + 'history',
	// });

	// const contextMenuOpen = useCallback((e, history) => {
	// 	show(e);
	// }, []);

	return (
		<Dropzone onDrop={(files) => upload(files)}>
			{history.length === 0 ? (
				<DropSpaceDiv>
					<Span
						color={ICON_LIGHT_COLOR}
						padding={'32px 30px 12px 30px'}
					>
						Drop files or folders here, or
					</Span>
					<DropSpace_Button onClick={openUpload}>
						<span className='material-icons'>file_upload</span>
						<Span>Browse file</Span>
					</DropSpace_Button>
				</DropSpaceDiv>
			) : (
				<_Ul>
					{history.map((history, index) => {
						return (
							<_Li
								className={'history_contents'}
								key={history.HISTORY_ID}
								onClick={selectItem(history, index)}
								back={
									history_highlight.find(
										(item) => item === history,
									) && SERVER_HOVER_COLOR
								}
								borderWidth={`${history.progress}%`}
							>
								<IconSpan
									// 나중에 split pane 만들면 반응형으로!
									className={'history_contents'}
									color={
										history.progress !== 100
											? ICON_LIGHT_COLOR
											: GREEN_COLOR
									}
								>
									{history.progress !== 100 ? (
										<span className='material-icons button_small'>
											pause_circle
										</span>
									) : history.todo === 'put' ? (
										<span className='material-icons button_small'>
											arrow_circle_up
										</span>
									) : history.todo === 'get' ? (
										<span className='material-icons-outlined button_small'>
											arrow_circle_down
										</span>
									) : history.todo === 'edit' ? (
										<FaEdit />
									) : (
										history.todo === 'rm' && (
											<MdRemoveCircle />
										)
									)}
								</IconSpan>
								<ItemName_Span
									className={'history_contents'}
									flex={1}
									color={
										history.progress !== 100
											? ICON_LIGHT_COLOR
											: 'black'
									}
								>
									{history.name}
								</ItemName_Span>
								<Span
									color={ICON_LIGHT_COLOR}
									size={HISTORY_FONTSIZE}
									className={'history_contents'}
								>
									{formatByteSizeString(history.size)}
								</Span>
								<IconButton
									onClick={removeHistory(history)}
									className={'history_contents'}
									padding={'0px 16px 0px 6px'}
									color={
										history_highlight.find(
											(item) => item === history,
										)
											? FONT_COLOR
											: ICON_LIGHT_COLOR
									}
								>
									<span className='material-icons button_midium'>
										delete
									</span>
								</IconButton>

								{history.progress !== 100 && (
									<Progress>
										<Bar width={`${history.progress}%`} />
									</Progress>
								)}
							</_Li>
						);
					})}
				</_Ul>
			)}
			{/*<HistoryContextMenu*/}
			{/*	uuid={uuid}*/}
			{/*	// highlight={highlight}*/}
			{/*	// setHighlight={setHighlight}*/}
			{/*/>*/}
		</Dropzone>
	);
};
HistoryContents.propTypes = {
	uuid: PropTypes.string.isRequired,
};

export default HistoryContents;
