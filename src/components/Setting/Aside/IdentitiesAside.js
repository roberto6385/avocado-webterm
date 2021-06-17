import React, {useCallback, useMemo} from 'react';
import styled from 'styled-components';
import {
	ACCOUNT_BUTTON_WIDTH,
	GREEN_COLOR,
	AVOCADO_HOVER_COLOR,
	IconButton,
	PATH_SEARCH_INPUT_HEIGHT,
	RIGHT_SIDE_WIDTH,
	THIRD_HEIGHT,
	fontColor,
	iconColor,
	borderColor,
} from '../../../styles/global';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

import {CHANGE_IDENTITY_CHECKED} from '../../../reducers/common';
import {FONT_14} from '../../../styles/length';
import {activeColor, hoverColor} from '../../../styles/color';
import Checkbox_ from '../../RecycleComponents/Checkbox_';

const _Container = styled.div`
	width: ${RIGHT_SIDE_WIDTH};
	display: flex;
	flex-direction: column;
	align-items: center;
	color: ${(props) => props.color};
`;

const _Li = styled.li`
	width: ${RIGHT_SIDE_WIDTH};
	height: ${THIRD_HEIGHT};
	display: flex;
	align-items: center;
	border-bottom: 1px solid;
	border-color: ${(props) => props.b_color};
`;

const _AccountContainer = styled.div`
	width: 109px;
	display: flex;
	align-items: center;
	padding: 6px 16px;
	white-space: nowrap;
`;
const _AuthenticationContainer = styled(_AccountContainer)`
	width: 100px;
`;
const _CheckboxContainer = styled(_AuthenticationContainer)`
	justify-content: center;
	margin: 0px 8px;
`;

const _Span = styled.span`
	font-size: ${FONT_14};
`;

const _Button = styled.button`
	width: ${ACCOUNT_BUTTON_WIDTH};
	height: ${PATH_SEARCH_INPUT_HEIGHT};
	border: none;
	border-radius: 4px;
	font-size: ${FONT_14};
	margin-top: 34px;
	background: ${(props) => props.back};
	color: ${(props) => props.color};
	&:hover {
		background: ${(props) => props?.hover};
	}
`;

const IdentitiesAside = () => {
	const dispatch = useDispatch();
	const {t} = useTranslation('identitiesAside');
	const {identity, theme, current_tab, tab} = useSelector(
		(state) => state.common,
	);
	const history = useHistory();
	const currentKey = useMemo(
		() => tab.find((v) => v.uuid === current_tab)?.server.key,
		[tab, current_tab],
	);

	const changePath = useCallback(
		(path) => () => {
			history.push(path);
		},
		[],
	);

	const handleCheck = useCallback(
		(item) => (e) => {
			console.log(e.target.checked);
			console.log(item);
			if (!e.target.checked) return;

			const correspondedIdentity = identity.find(
				(v) => v.key === currentKey && v.checked,
			);

			dispatch({
				type: CHANGE_IDENTITY_CHECKED,
				payload: {
					prev: correspondedIdentity,
					next: item,
				},
			});
		},
		[identity, currentKey, dispatch],
	);

	return (
		<_Container color={fontColor[theme]}>
			<ul>
				<_Li b_color={borderColor[theme]}>
					<_AccountContainer>
						<_Span>{t('account')}</_Span>
					</_AccountContainer>
					<_AuthenticationContainer>
						<_Span>{t('auth')}</_Span>
					</_AuthenticationContainer>
					<_CheckboxContainer>
						<_Span>{t('default')}</_Span>
					</_CheckboxContainer>
				</_Li>
				{identity.map((item) => {
					if (item.key === currentKey) {
						return (
							<_Li key={item.id} b_color={borderColor[theme]}>
								<_AccountContainer>
									<_Span>{item.identityName}</_Span>
								</_AccountContainer>
								<_AuthenticationContainer>
									<_Span>{item.type}</_Span>
								</_AuthenticationContainer>

								<_CheckboxContainer>
									<Checkbox_
										value={item.checked}
										handleCheck={handleCheck(item)}
									/>
								</_CheckboxContainer>
							</_Li>
						);
					}
				})}
			</ul>
			<_Button
				back={activeColor[theme]}
				hover={hoverColor[theme]}
				color={theme === 0 ? 'white' : 'black'}
				onClick={changePath('/identities')}
			>
				{t('editMore')}
			</_Button>
		</_Container>
	);
};

export default IdentitiesAside;
