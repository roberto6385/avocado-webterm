//Navigation bar styles
import styled from 'styled-components';
import {fontColor, navHighColor} from '../color';
import {Nav} from 'react-bootstrap';

export const NavigationBarTitle = styled.div`
	flex: 1;
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 14px;
	color: ${(props) => fontColor[props.theme_value]};
`;
export const NavigationBarItemForm = styled.form`
	display: flex;
	padding: 4px 0px;
	border: none;
`;
export const NavigationBarInput = styled.input`
	background: ${(props) => navHighColor[props.theme_value]};
	color: ${(props) => fontColor[props.theme_value]};
	margin: 0;
	border: none;
	outline: none;
`;

export const NavigationItems = styled(Nav.Item)`
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 34px;
	border-left: 2px solid;
	padding: 0px 16px 0px 8px;
	padding-left: ${(props) => props?.left};
	border-color: ${(props) =>
		props.selected
			? props.theme.pages.webTerminal.main.navigation.items.selectedStyle
					.border.color
			: props.theme.pages.webTerminal.main.navigation.items.normalStyle
					.border.color};
	background-color: ${(props) =>
		props.selected
			? props.theme.pages.webTerminal.main.navigation.items.selectedStyle
					.backgroundColor
			: props.theme.pages.webTerminal.main.navigation.items.normalStyle
					.backgroundColor};
`;
