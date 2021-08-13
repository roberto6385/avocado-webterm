import React, {useCallback, useMemo} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {animation, Item, Separator} from 'react-contexify';
import {useTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import {SSH_SEND_COMMAND_REQUEST} from '../../reducers/ssh';
import {DropDownMenu} from '../../styles/components/contextMenu';
import {dialogBoxAction} from '../../reducers/dialogBoxs';
import {tabBarSelector} from '../../reducers/tabBar';

const SnippetsManagerContextMenu = ({uuid}) => {
	const dispatch = useDispatch();
	const {t} = useTranslation('snippets');
	const {selectedTab} = useSelector(tabBarSelector.all);
	const {ssh, snippets} = useSelector((state) => state.ssh, shallowEqual);

	const searchedWebSocket = useMemo(
		() => ssh.find((v) => v.uuid === selectedTab)?.ws,
		[ssh, selectedTab],
	);

	const onClickOpenSnippetsManegerDialogBox = useCallback(() => {
		dispatch(dialogBoxAction.openForm({key: 'snippet'}));
	}, [dispatch]);

	const handleOnClickEvents = useCallback(
		(v) => () => {
			searchedWebSocket &&
				dispatch({
					type: SSH_SEND_COMMAND_REQUEST,
					payload: {
						uuid: selectedTab,
						ws: searchedWebSocket,

						input: v.content,
						focus: true,
					},
				});
		},

		[selectedTab, dispatch, searchedWebSocket],
	);

	return (
		<DropDownMenu id={uuid + 'snippet'} animation={animation.slide}>
			<Item onClick={onClickOpenSnippetsManegerDialogBox}>
				{t('editSnippets')}
			</Item>
			<Separator />
			{snippets.map((v) => {
				return (
					<Item
						key={'snippets-manager-context-menu-' + v.name}
						onClick={handleOnClickEvents(v)}
					>
						{v.name}
					</Item>
				);
			})}
		</DropDownMenu>
	);
};

SnippetsManagerContextMenu.propTypes = {
	uuid: PropTypes.string.isRequired,
};

export default SnippetsManagerContextMenu;
