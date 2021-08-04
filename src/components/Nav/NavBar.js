import React, {useCallback} from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import ServerFolderList from './NavItems/ServerFolderList';
import useInput from '../../hooks/useInput';
import {OPEN_ADD_FAVORITES_FORM_POPUP} from '../../reducers/popup';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import drkFloatingButton from '../../images/navFoldingButton/drk_floating_btn.png';
import lghtFloatingButton from '../../images/navFoldingButton/lght_floating_btn.png';
import {burgerMenuIcon, plusIcon, searchIcon} from '../../icons/icons';
import {CHANGE_NAVTAB} from '../../reducers/common';
import PropTypes from 'prop-types';
import {WIDTH_256, FONT_14, HEIGHT_36} from '../../styles/length';
import {navColor, borderColor, fontColor, inputBack} from '../../styles/color';
import LightModeLogo from '../../images/logo/logo@2x.png';
import DarkModeLogo from '../../images/logo/logo_white@3x.png';
import FavoriteList from './NavItems/FavoriteList';
import {HoverButton, Icon} from '../../styles/components/icon';

const floatings = [lghtFloatingButton, drkFloatingButton];

const _Aside = styled.aside`
	display: flex;
	flex-direction: column;
	width: ${WIDTH_256};
	min-width: ${WIDTH_256};
	border-right: 1px solid;
	border-color: ${(props) =>
		props.theme.pages.webTerminal.main.navigation.border.color};
	height: 100%;
	background: ${(props) =>
		props.theme.pages.webTerminal.main.navigation.backgroundColor};
	z-index;
`;

const _Header = styled.div`
	display: flex;
	align-items: center;
	height: 54px;
	padding: 18px 16px 19px;
`;

const _FolerServerTab = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 50px;
	border-bottom: 1px solid
		${(props) => props.theme.pages.webTerminal.main.navigation.border.color};
`;

const _FormContainer = styled.div`
	padding: 10px 12px;
	display: flex;
`;
const _Form = styled.form`
	display: flex;
	flex: 1;
	align-items: center;
	height: ${HEIGHT_36};
	border-radius: 4px;
	padding: 6px;
	background: ${(props) => inputBack[props.theme_value]};
`;

const _AddButton = styled.button`
	border: 1px solid;
	border-radius: 4px;
	margin-left: 8px;
	color: #959ea1;
	border-color: ${(props) => borderColor[props?.theme_value]};
	background: ${(props) => navColor[props?.theme_value]};
`;

const _Input = styled.input`
	height: ${HEIGHT_36};
	border: none;
	font-size: ${FONT_14};
	padding: 0px;
	background: ${(props) => inputBack[props.theme_value]};
	color: ${(props) => fontColor[props.theme_value]};
`;

const _OpenButton = styled.div`
	outline: none;
	line-height: 0px;
	cursor: pointer;
	position: absolute;
	padding: 4px;
	right: -30px;
	bottom: 10px;
	display: ${(props) => props?.display};
`;

const _Tab = styled.div`
	display: flex;
	flex-warp: nowrap;
	align-items: center;
	justify-content: space-between;
	height: 100%;
	width: 127px;
`;

const _TabItem = styled.div`
	display: flex;
	cursor: pointer;
	justify-content: center;
	align-items: center;
	height: 100%;
	font-weight: bold;
	color: ${(props) =>
		props.clicked
			? props.theme.pages.webTerminal.main.navigation.tab.selectedStyle
					.font.color
			: props.theme.pages.webTerminal.main.navigation.tab.normalStyle.font
					.color};
	margin: 0px 16px;
	border-bottom: 2px solid;
	border-color: ${(props) =>
		props.clicked
			? props.theme.pages.webTerminal.main.navigation.tab.selectedStyle
					.border.color
			: props.theme.pages.webTerminal.main.navigation.tab.normalStyle
					.border.color};
	width: 100%;
`;

const isValidFolderName = (folderArray, name) => {
	let pass = true;

	for (let i of folderArray) {
		if (i.type === 'folder') {
			if (i.name === name) return false;
			else if (i.contain.length > 0) {
				pass = pass && isValidFolderName(i.contain, name);
			}
		}
	}
	return pass;
};

const NavBar = ({toggle, setToggle}) => {
	const dispatch = useDispatch();
	const {t} = useTranslation('nav');

	const {theme, current_nav_tab} = useSelector(
		(state) => state.common,
		shallowEqual,
	);
	const [search, onChangeSearch] = useInput('');

	const tabs = [
		{title: t('resource'), key: 0},
		{title: t('bookmark'), key: 1},
	];

	//TODO: ADD FOLDER
	// const onClickAddFolder = useCallback(() => {
	// 	let folderName = t('newFolder');
	// 	let i = 0;
	// 	while (!isValidFolderName(nav, folderName)) {
	// 		folderName = `${t('newFolder')} ${i}`;
	// 		i++;
	// 	}
	// 	dispatch({type: ADD_FOLDER, data: folderName});
	// }, [dispatch, nav, t]);

	//TODO: ADD SERVER
	// const onClickAddServer = useCallback(() => {
	// 	dispatch({
	// 		type: OPEN_ADD_SERVER_FORM_POPUP,
	// 		data: {type: 'add'},
	// 	});
	// }, [dispatch]);

	const newFavorites = useCallback(() => {
		dispatch({type: OPEN_ADD_FAVORITES_FORM_POPUP});
	}, [dispatch]);

	const onClickOpenTggle = useCallback(() => {
		setToggle(!toggle);
	}, [setToggle, toggle]);

	const handleCurrentKey = useCallback(
		(key) => () => {
			dispatch({type: CHANGE_NAVTAB, payload: key});
		},
		[dispatch],
	);

	return (
		<_Aside className={toggle ? 'nav' : 'nav close'}>
			<_Header>
				<HoverButton
					margin_right={'6px'}
					theme_value={theme}
					onClick={onClickOpenTggle}
				>
					{burgerMenuIcon}
				</HoverButton>
				{theme === 0 ? (
					<img src={LightModeLogo} height='17' alt='LightModeLogo' />
				) : (
					<img src={DarkModeLogo} height='17' alt='DarkModeLogo' />
				)}
			</_Header>
			<_FolerServerTab theme_value={theme}>
				{tabs.map((v) => {
					return (
						<_Tab key={v.key} onClick={handleCurrentKey(v.key)}>
							<_TabItem
								clicked={current_nav_tab === v.key ? 1 : 0}
							>
								{v.title}
							</_TabItem>
						</_Tab>
					);
				})}
			</_FolerServerTab>
			{current_nav_tab === 0 ? ( // 0:자원 1:즐겨찾기
				<>
					<_FormContainer>
						<_Form
							theme_value={theme}
							onSubmit={(e) => e.preventDefault()}
						>
							<Icon theme_value={theme} margin_right={'6px'}>
								{searchIcon}
							</Icon>
							<_Input
								onChange={onChangeSearch}
								value={search}
								type='text'
								placeholder={t('search')}
								theme_value={theme}
							/>
						</_Form>
						{/*<_AddButton onClick={onClickAddServer} theme_value={theme}>*/}
						{/*	{plusIcon}*/}
						{/*</_AddButton>*/}
					</_FormContainer>
					<ServerFolderList search={search} />
				</>
			) : (
				<>
					<_FormContainer>
						<_Form
							theme_value={theme}
							onSubmit={(e) => e.preventDefault()}
						>
							<Icon theme_value={theme} margin_right={'6px'}>
								{searchIcon}
							</Icon>
							<_Input
								onChange={onChangeSearch}
								value={search}
								type='text'
								placeholder={t('search')}
								theme_value={theme}
							/>
						</_Form>
						<_AddButton onClick={newFavorites} theme_value={theme}>
							{plusIcon}
						</_AddButton>
					</_FormContainer>
					<FavoriteList search={search} />
				</>
			)}

			<_OpenButton
				onClick={() => setToggle(!toggle)}
				display={toggle ? 'none' : 'inline-block'}
				theme_value={theme}
			>
				<img src={floatings[theme]} alt='floating button' />
			</_OpenButton>
		</_Aside>
	);
};

NavBar.propTypes = {
	toggle: PropTypes.bool.isRequired,
	setToggle: PropTypes.func.isRequired,
};

export default NavBar;
