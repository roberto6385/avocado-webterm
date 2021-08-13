import {HoverButton, Icon} from '../../styles/components/icon';
import {closeIcon, sftpIcon, sshIcon} from '../../icons/icons';
import MenuButtons from './MenuButtons';
import React, {useCallback, useState} from 'react';
import styled from 'styled-components';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {SSH_SEND_DISCONNECTION_REQUEST} from '../../reducers/ssh';
import PropTypes from 'prop-types';
import {DISCONNECTION_REQUEST} from '../../reducers/sftp';
import {tabBarAction, tabBarSelector} from '../../reducers/tabBar';
import {settingSelector} from '../../reducers/setting';

const _Container = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: ${(props) =>
		props.theme.pages.webTerminal.main.tab.backgroundColor};
`;

const _Tabs = styled.div`
	display: flex;
	overflow: auto;
	max-width: calc(100% - 152px);
	height: 54px;
`;

const _TabItem = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16px;
	height: 100%;
	font-weight: bold;
	background: ${(props) =>
		props.clicked
			? props.theme.pages.webTerminal.main.tab.selectedItems
					.backgroundColor
			: props.theme.pages.webTerminal.main.tab.normalItems
					.backgroundColor};
	color: ${(props) =>
		props.clicked
			? props.theme.pages.webTerminal.main.tab.selectedItems.font.color
			: props.theme.pages.webTerminal.main.tab.normalItems.font.color};
	width: 160px;
	border-top: 2px solid
		${(props) =>
			props.clicked
				? props.theme.pages.webTerminal.main.tab.selectedItems.border
						.color
				: props.theme.pages.webTerminal.main.tab.normalItems.border
						.color};
`;

const _Tab = styled.div`
	display: flex;
	flex-warp: nowrap;
	align-items: center;
	justify-content: space-between;
`;

const _ServerTitle = styled.div`
	flex: 1;
	overflow: hidden;
`;

const TabBar = ({toggle, setToggle}) => {
	const dispatch = useDispatch();
	const {theme} = useSelector(settingSelector.all);
	const {tabs, selectedTab} = useSelector(tabBarSelector.all);
	const {ssh} = useSelector((state) => state.ssh, shallowEqual);
	const {socket: sftp_socketState} = useSelector(
		(state) => state.sftp,
		shallowEqual,
	);

	const [oldOlder, setOldOlder] = useState(0);
	const [draggedItem, setDraggedItem] = useState({});

	const onClickChangeVisibleTab = useCallback(
		(uuid) => () => {
			dispatch(tabBarAction.selectTab(uuid));
		},
		[dispatch],
	);

	const onClickCloseTab = useCallback(
		(data) => (e) => {
			e.stopPropagation();
			if (data.type === 'SSH') {
				dispatch({
					type: SSH_SEND_DISCONNECTION_REQUEST,
					payload: {
						uuid: data.uuid,
						ws: ssh.find((v) => v.uuid === data.uuid).ws,
					},
				});
			} else if (data.type === 'SFTP') {
				dispatch({
					type: DISCONNECTION_REQUEST,
					payload: {
						uuid: data.uuid,
						socket: sftp_socketState.find(
							(v) => v.uuid === data.uuid,
						).socket,
					},
				});
			}
		},
		[ssh, sftp_socketState],
	);

	const prevPutItem = useCallback(
		(item) => () => {
			setOldOlder(tabs.findIndex((it) => it === item));
			setDraggedItem(item);
		},
		[tabs],
	);

	const nextPutItem = useCallback(
		(item) => (e) => {
			e.preventDefault();
			if (item === undefined) return;
			const newOlder = tabs.findIndex((it) => it === item);

			dispatch(
				tabBarAction.sortTab({
					oldOrder: oldOlder,
					newOrder: newOlder,
					newTab: draggedItem,
				}),
			);
		},
		[tabs, dispatch, oldOlder, draggedItem],
	);

	return (
		<_Container theme_value={theme}>
			<_Tabs>
				{tabs.map((data) => {
					return (
						<_Tab
							key={data.uuid}
							onDragOver={(e) => e.preventDefault()}
							onDrop={nextPutItem(data)}
							onClick={onClickChangeVisibleTab(data.uuid)}
						>
							<_TabItem
								draggable='true'
								onDragStart={prevPutItem(data)}
								clicked={selectedTab === data.uuid ? 1 : 0}
							>
								<Icon
									margin_right={'6px'}
									size={'xs'}
									itype={
										selectedTab === data.uuid
											? 'selected'
											: 'font'
									}
								>
									{data.type === 'SSH' && sshIcon}
									{data.type === 'SFTP' && sftpIcon}
								</Icon>
								<_ServerTitle
									onClick={onClickChangeVisibleTab(data.uuid)}
								>
									{data.server.name}
								</_ServerTitle>
								<HoverButton
									size={'xs'}
									margin={'0px 0px 0px 6px'}
									onClick={onClickCloseTab(data)}
								>
									{closeIcon}
								</HoverButton>
							</_TabItem>
						</_Tab>
					);
				})}
			</_Tabs>
			<MenuButtons toggle={toggle} setToggle={setToggle} />
		</_Container>
	);
};

TabBar.propTypes = {
	toggle: PropTypes.bool.isRequired,
	setToggle: PropTypes.func.isRequired,
};

export default TabBar;
