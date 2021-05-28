import React, {useCallback} from 'react';
import {useSelector} from 'react-redux';
import styled from 'styled-components';
import {
	LIGHT_MODE_BORDER_COLOR,
	IconButton,
	RIGHT_SIDE_WIDTH,
	SIXTEEN,
	SUB_HEIGHT,
} from '../../styles/global';
import PreferencesAside from './Aside/PreferencesAside';
import IdentitiesAside from './Aside/IdentitiesAside';
import AccountAside from './Aside/AccountAside';
import {closeIconMedium} from '../../icons/icons';

const _Container = styled.div`
	display: none;
	height: 100%;
	width: ${RIGHT_SIDE_WIDTH};
	border-left: 1px solid ${LIGHT_MODE_BORDER_COLOR};
	z-index: 5; // terminal보다 높아야 함.
	background: white;
`;

const _Header = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: ${SUB_HEIGHT};
	padding: 16px;
	font-size: ${SIXTEEN};
	border-bottom: 1px solid ${LIGHT_MODE_BORDER_COLOR};
`;

const _IconButton = styled(IconButton)`
	padding: 6px 0px 6px 6px;
`;

const AsideContainer = () => {
	const {rightSideKey} = useSelector((state) => state.common);

	const close_sidebar = useCallback(() => {
		const sideMenu = document.querySelector('#right_side_menu');
		sideMenu.classList.remove('active');
	}, []);

	return (
		<_Container id={'right_side_menu'}>
			<_Header>
				{rightSideKey}
				<_IconButton onClick={close_sidebar}>
					{closeIconMedium}
				</_IconButton>
			</_Header>
			{rightSideKey === 'Preferences' && <PreferencesAside />}
			{rightSideKey === 'Identities' && <IdentitiesAside />}
			{rightSideKey === 'Account' && <AccountAside />}
		</_Container>
	);
};

export default AsideContainer;
