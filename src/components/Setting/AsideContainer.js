import React, {useCallback} from 'react';
import {useSelector} from 'react-redux';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import PropTypes from 'prop-types';

import PreferencesAside from './Aside/PreferencesAside';
import IdentitiesAside from './Aside/IdentitiesAside';
import AccountAside from './Aside/AccountAside';
import {closeIcon} from '../../icons/icons';
import {IconButton} from '../../styles/components/icon';
import {SettingTitle} from '../../styles/components/settingPage';
import {settingSelector} from '../../reducers/setting';

const _Container = styled.div`
	height: 100%;
	width: 300px;
	border-left: 1px solid 	${(props) =>
		props.theme.pages.webTerminal.main.aside.border.color};
};
	z-index: 5;
	background: ${(props) =>
		props.theme.pages.webTerminal.main.aside.backgroundColor};
`;

const _SettingTitle = styled(SettingTitle)`
	padding: 17px 16px 12px;
	justify-content: space-between;
`;

const AsideContainer = ({toggle, setToggle}) => {
	const {t} = useTranslation('settingNav');
	const {aside} = useSelector(settingSelector.all);

	const onClickCloseAside = useCallback(() => {
		setToggle(false);
	}, [setToggle]);

	const settingTitle = {
		Account: t('account'),
		Preferences: t('preferences'),
		Identities: t('identities'),
	};

	return (
		<_Container className={toggle ? 'aside' : 'aside close'}>
			<_SettingTitle>
				{settingTitle[aside]}
				<IconButton
					itype={'font'}
					margin={'0px'}
					onClick={onClickCloseAside}
				>
					{closeIcon}
				</IconButton>
			</_SettingTitle>
			{aside === 'Account' && <AccountAside />}
			{aside === 'Preferences' && <PreferencesAside />}
			{aside === 'Identities' && <IdentitiesAside />}
		</_Container>
	);
};

AsideContainer.propTypes = {
	toggle: PropTypes.bool.isRequired,
	setToggle: PropTypes.func.isRequired,
};

export default AsideContainer;
