import React, {useCallback} from 'react';
import styled from 'styled-components';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {
	SSH_SET_SEARCH_MODE,
	SSH_DECREASE_FONT_SIZE,
	SSH_INCREASE_FONT_SIZE,
} from '../reducers/ssh';
import {searchIcon, zoomInIcon, zoomOutIcon} from '../icons/icons';
import {HEIGHT_26} from '../styles/length';
import {fontColor, footerColor} from '../styles/color';
import {HoverButton} from '../styles/components/icon';

const _Footer = styled.footer`
	height: ${HEIGHT_26};
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 12px;
	background: ${(props) => footerColor[props.theme_value]};
	color: ${(props) => fontColor[props.theme_value]};
	padding: 0 16px;
`;

const _RightContainer = styled.div`
	display: flex;
	align-items: center;
`;

const Footer = () => {
	const dispatch = useDispatch();
	const {server, tab, current_tab} = useSelector(
		(state) => state.common,
		shallowEqual,
	);
	const {font_size} = useSelector((state) => state.ssh, shallowEqual);

	const onClickIncreaseFontSize = useCallback(() => {
		if (font_size < 20) dispatch({type: SSH_INCREASE_FONT_SIZE});
	}, [font_size]);

	const onClickDeceaseFontSize = useCallback(() => {
		if (font_size > 10) dispatch({type: SSH_DECREASE_FONT_SIZE});
	}, [font_size]);

	const onClickOpenSshSearchBar = useCallback(() => {
		const current = tab.slice().find((v) => v.uuid === current_tab);
		if (current_tab !== null && current.type === 'SSH')
			dispatch({type: SSH_SET_SEARCH_MODE});
	}, [current_tab, tab]);

	return (
		<_Footer>
			<span>Avocado v1.0</span>
			{tab.filter((v) => v.display && v.type === 'SSH').length !== 0 && (
				<_RightContainer>
					<HoverButton
						margin_right={'10px'}
						size={'micro'}
						onClick={onClickDeceaseFontSize}
					>
						{zoomOutIcon}
					</HoverButton>
					<HoverButton
						margin_right={'10px'}
						size={'micro'}
						onClick={onClickIncreaseFontSize}
					>
						{zoomInIcon}
					</HoverButton>
					<HoverButton
						margin_right={'10px'}
						size={'micro'}
						onClick={onClickOpenSshSearchBar}
					>
						{searchIcon}
					</HoverButton>

					{current_tab &&
						server.find(
							(v) =>
								v.id ===
								tab.find((i) => i.uuid === current_tab)?.server
									.id,
						)?.host}
				</_RightContainer>
			)}
		</_Footer>
	);
};

export default Footer;
