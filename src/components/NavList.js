import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {ServerNavBarContainer} from '../styles/common';
import Folder from './NavList/Folder';
import Server from './NavList/Server';
import {SET_CLICKED_SERVER} from '../reducers/common';
import {HIGHLIGHT_COLOR} from '../styles/global';

const NavList = () => {
	const dispatch = useDispatch();
	const {nav} = useSelector((state) => state.common);
	const {clicked_server} = useSelector((state) => state.common);

	return (
		<ServerNavBarContainer className={'flex-column'}>
			{nav.map((data) =>
				data.type === 'folder' ? (
					<Folder key={data.key} data={data} />
				) : (
					<Server key={data.key} data={data} />
				),
			)}
		</ServerNavBarContainer>
	);
};

export default NavList;