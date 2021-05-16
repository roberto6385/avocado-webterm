import React, {useCallback, useEffect, useRef, useState} from 'react';
import * as PropTypes from 'prop-types';
import {useContextMenu} from 'react-contexify';
import {useDispatch, useSelector} from 'react-redux';

import {useDoubleClick} from '../../hooks/useDoubleClick';
import ServerContextMenu from '../ContextMenu/ServerContextMenu';
import useInput from '../../hooks/useInput';
import {FaServerIcon} from '../../styles/common';
import {
	CHANGE_SERVER_FOLDER_NAME,
	SET_CLICKED_SERVER,
	SORT_SERVER_AND_FOLDER,
} from '../../reducers/common';
import {HIGHLIGHT_COLOR, light_Background} from '../../styles/global';
import {SSHT_SEND_CONNECTION_REQUEST} from '../../reducers/ssht';
import {Folder_Server_Nav_Item} from '../../styles/navs';
import {BaseForm, BaseInput} from '../../styles/forms';
import {
	AVOCADO_COLOR,
	AVOCADO_FONTSIZE,
	AVOCADO_HOVER_COLOR,
	Avocado_span,
	ICON_LIGHT_COLOR,
	LIGHT_MODE_BACK_COLOR,
	MIDDLE_FONTSIZE,
} from '../../styles/global_design';

const Server = ({data, indent}) => {
	const dispatch = useDispatch();
	const {clicked_server, server} = useSelector((state) => state.common);
	const {userTicket} = useSelector((state) => state.userTicket);
	const [openRename, setOpenRename] = useState(false);
	const renameRef = useRef(null);
	const [renameValue, onChangeRenameValue, setRenameValue] = useInput('');

	const onHybridClick = useDoubleClick(
		() => {
			const correspondedServer = server.find((i) => i.id === data.id);
			dispatch({
				type: SSHT_SEND_CONNECTION_REQUEST,
				data: {
					token: userTicket,
					...correspondedServer,
				},
			});
		},
		() => {
			if (clicked_server === data.key)
				dispatch({type: SET_CLICKED_SERVER, data: null});
			else dispatch({type: SET_CLICKED_SERVER, data: data.key});
		},
		[clicked_server, data, userTicket, server],
	);

	const {show} = useContextMenu({
		id: data.key + 'server',
	});

	const contextMenuOpen = useCallback(
		(e) => {
			e.preventDefault();

			dispatch({type: SET_CLICKED_SERVER, data: data.key});
			show(e);
		},
		[data],
	);

	const handleSubmit = useCallback(
		(e) => {
			e.preventDefault();

			if (renameValue !== data.name)
				dispatch({
					type: CHANGE_SERVER_FOLDER_NAME,
					data: {key: data.key, name: renameValue},
				});
			setOpenRename(false);
		},
		[data, renameValue],
	);

	const EscapeKey = useCallback((e) => {
		if (e.keyCode === 27) setOpenRename(false);
	}, []);

	const prevPutItem = useCallback(() => {
		dispatch({type: SET_CLICKED_SERVER, data: data.key});
	}, [data]);

	const nextPutItem = useCallback(
		(e) => {
			e.stopPropagation();

			data.type === 'folder' &&
				dispatch({type: SORT_SERVER_AND_FOLDER, data: {next: data}});
		},
		[data],
	);
	//when re-name form is open, fill in pre-value and focus and select it
	useEffect(() => {
		const fillInForm = async () => {
			if (openRename) {
				await setRenameValue(data.name);
				await renameRef.current.focus();
				await renameRef.current.select();
			}
		};
		fillInForm();
	}, [openRename, renameRef, data]);

	return (
		<Folder_Server_Nav_Item
			onClick={onHybridClick}
			draggable='true'
			onDragStart={prevPutItem}
			onDrop={nextPutItem}
			onContextMenu={contextMenuOpen}
			back={
				clicked_server === data.key
					? AVOCADO_HOVER_COLOR
					: LIGHT_MODE_BACK_COLOR
			}
			border={
				clicked_server === data.key
					? `2px solid ${AVOCADO_COLOR}`
					: undefined
			}
			left={(indent * 8 + 8).toString() + 'px'}
		>
			<Avocado_span
				size={MIDDLE_FONTSIZE}
				color={
					clicked_server === data.key
						? AVOCADO_COLOR
						: ICON_LIGHT_COLOR
				}
			>
				<FaServerIcon />
			</Avocado_span>
			<Avocado_span flex={1} size={AVOCADO_FONTSIZE}>
				{openRename ? (
					<BaseForm onSubmit={handleSubmit} onBlur={handleSubmit}>
						<BaseInput
							ref={renameRef}
							type='text'
							value={renameValue}
							onChange={onChangeRenameValue}
							onKeyDown={EscapeKey}
						/>
					</BaseForm>
				) : (
					data.name
				)}
			</Avocado_span>
			<ServerContextMenu data={data} setOpenRename={setOpenRename} />
		</Folder_Server_Nav_Item>
	);
};

Server.propTypes = {
	data: PropTypes.object.isRequired,
	indent: PropTypes.number.isRequired,
};

export default Server;
