import React, {useCallback, useState} from 'react';
import {NavLink} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {FaTimes} from 'react-icons/all';

import SplitBar from './SplitBar';
import {CHANGE_VISIBLE_TAB, CLOSE_TAB} from '../reducers/common';
import {Close} from '../ws/ssh_ws';
import {
	FlexBox,
	IconButton,
	IconSpan,
	TabNavItem,
	TabContainer,
	TabNav,
	TabSSHTIcon,
	TabSFTPIcon,
} from '../styles/common';
import sftp_ws from '../ws/sftp_ws';
import newSftp_ws from '../ws/newSftp_ws';

const TabNavBar = () => {
	const dispatch = useDispatch();
	const [active, setActive] = useState('');
	const {tab, current_tab} = useSelector((state) => state.common);

	const changeVisibleTab = useCallback(
		(tab_id) => () => {
			dispatch({type: CHANGE_VISIBLE_TAB, data: tab_id});
		},
		[dispatch],
	);

	const onClickDelete = useCallback(
		(data) => async () => {
			const clicked_tab = tab.find((x) => x.id === data.id);
			const {type} = clicked_tab;
			const {ws, uuid} = clicked_tab.socket;

			if (type === 'SSHT') ws.send(Close(uuid));
			else {
				newSftp_ws({
					keyword: 'Disconnection',
					ws,
				}).then((response) => console.log(response));
				// await sftp_ws({
				// 	keyword: 'Disconnection',
				// 	ws,
				// 	uuid,
				// }).then((response) => console.log(response));
				dispatch({type: CLOSE_TAB, data: data.id});
			}
		},
		[dispatch, tab],
	);

	return (
		<TabContainer
			activeKey={active}
			defaultActiveKey={active}
			onSelect={(i) => setActive(i)}
		>
			<FlexBox>
				<TabNav>
					{tab &&
						tab.map((data) => (
							<TabNavItem key={data.id.toString()}>
								<NavLink
									className={
										data.id === current_tab
											? 'tab_navLink active_tab_item'
											: 'tab_navLink'
									}
									as={Link}
									to='/'
									eventKey={data.id}
								>
									<IconSpan
										onClick={changeVisibleTab(data.id)}
									>
										{data.type === 'SSHT' ? (
											<TabSSHTIcon />
										) : (
											<TabSFTPIcon />
										)}
										{data.server.name}
									</IconSpan>
									<IconButton onClick={onClickDelete(data)}>
										<FaTimes />
									</IconButton>
								</NavLink>
							</TabNavItem>
						))}
				</TabNav>
				<SplitBar />
			</FlexBox>
		</TabContainer>
	);
};

export default TabNavBar;
