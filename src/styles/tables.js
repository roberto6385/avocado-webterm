import styled from 'styled-components';
import Table from 'react-bootstrap/Table';
import {HIGHLIGHT_COLOR} from './global';

export const BaseTable = styled(Table)`
	width: 100%;
	height: 100%;
	margin: 0;
	padding: 0;
	border: none;
	overflow: scroll;
	thead {
		tr {
			display: flex;
			position: sticky;
			top: 0px;
			background: white;
			z-index: 1;
		}
	}
	tbody {
		.highlight_tbody.active {
			background: ${HIGHLIGHT_COLOR};
		}
		tr {
			cursor: pointer;
			display: flex;
		}
	}
	//
	//
	// 드래그 방지
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
`;

export const Th = styled.th`
	min-width: ${(props) => props?.min};
	flex: ${(props) => props.flex};
	text-align: ${(props) => props.textAlign || 'left'};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const FileListP = styled.p`
	width: 200px;
	margin: 0;
	padding: 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;