// color
import styled from 'styled-components';

export const AVOCADO_COLOR = '#178082'; // logo, active icon color
export const AVOCADO_HOVER_COLOR = '#e4f3f4'; // folder,server highlight color
export const LIGHT_BACK_COLOR = '#f0f3f6'; // terminal, input background color
export const ICON_DARK_COLOR = 'rgba(0,0,0,0.54)'; // file list nav icon color
export const ICON_LIGHT_COLOR = 'rgba(60,76,81,0.54)'; // tab icon color
export const FONT_COLOR = 'rgba(0,0,0,0.87)'; //other icon color
export const FOOTER_BACK_COLOR = '#dee1e6';
export const SFTP_DIRECTORY_COLOR = '#4ca6a8';
export const POPUP_SIDE_COLOR = '#f8f9fa';
export const CANCEL_BUTTON_COLOR = 'rgba(60,76,81,0.24)';
export const LIGHT_MODE_BACK_COLOR = '#ffffff';

// height
export const MAIN_HEIGHT = '60px'; // tab container, logo container
export const SUB_HEIGHT = '50px'; // new folder container, (ssht, sftp nav)
export const THIRD_HEIGHT = '48px'; // aside form height, sftp table height
export const FOLDER_HEIGHT = '40px'; // folder, server height
export const FOOTER_HEIGHT = '26px'; // footer height
export const SEARCH_INPUT_HEIGHT = '36px';

export const BUTTON_HEIGHT = '20px';

// width
export const LEFT_SIDE_WIDTH = '256px'; // left side main nav width
export const RIGHT_SIDE_WIDTH = '300px';
export const SEARCH_INPUT_WIDTH = '165px';

// font-size
export const AVOCADO_FONTSIZE = '14px';
export const MIDDLE_FONTSIZE = '20px';
export const LOGO_FONTSIZE = '24px';

// span
export const Avocado_span = styled.span`
	flex: ${(props) => props?.flex};
	font-size: ${(props) => props?.size};
	padding: 6px;
	line-height: 0px;
	color: ${(props) => props.color};
`;

// button
export const Button = styled.button`
	background: transparent;
	border: none;
	line-height: 0px;
	padding: 6px;
	font-size: ${MIDDLE_FONTSIZE};
	color: ${(props) => props.color};
`;
