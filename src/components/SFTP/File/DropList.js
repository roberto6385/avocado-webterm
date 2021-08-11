import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import FileListContextMenu from '../../ContextMenu/FileListContextMenu';
import {
	editIcon,
	fileDownloadIcon,
	fileIcon,
	folderOpenIcon,
} from '../../../icons/icons';
import {HideScroll, PreventDragCopy} from '../../../styles/function';
import {HoverButton} from '../../../styles/components/icon';
import {SftpMainIcon} from '../../../styles/components/sftp/icons';

const _Container = styled.div`
	display: flex;
	flex: 1;
	overflow-x: scroll;
	font-size: 14px;
`;

const _ItemContainer = styled.div`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	min-width: 106px;
	margin-right: 16px;
`;

const _FirstItemContainer = styled(_ItemContainer)`
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 200px;
	margin-left: 16px;
`;

const _ButtonContainer = styled(_ItemContainer)`
	display: flex;
	justify-content: flex-end;
	min-width: 63px;
`;

const _Ul = styled.ul`
	${PreventDragCopy}
	${HideScroll}
	height: 100%;
	min-width: ${(props) => props.width};
	flex: ${(props) => props.flex};
	list-style: none;
	overflow-y: scroll;
	margin: 0px;
	padding: 0px;
	outline: none;
	border-right: 1px solid;
	border-color: ${(props) =>
		props.theme.pages.webTerminal.main.panels.sftp.border.color};
	color: ${(props) => props.color};
`;

const _Li = styled.li`
	cursor: pointer;
	background: ${(props) =>
		(props.type === 'current' &&
			props.theme.pages.webTerminal.main.panels.sftp.files
				.selectedBackgroundColor) ||
		(props.type === 'prev' &&
			props.theme.pages.webTerminal.main.panels.sftp.files
				.prevPathBackgroundColor)};
	min-width: 220px;
	height: 48px;
	white-space: nowrap;
	padding: 0px;
	display: flex;
	align-items: center;
	border-bottom: 1px solid;
	border-color: ${(props) =>
		props.theme.pages.webTerminal.main.panels.sftp.border.color};
	font-weight: bold;
`;

const DropList = ({
	uuid,
	list,
	pathList,
	onClick,
	onContextMenu,
	highlight,
	path,
	onEdit,
	onDownload,
}) => {
	return (
		<_Container>
			{list.map((listItem, listindex) => {
				return (
					<_Ul
						width={
							pathList.length - 1 === listindex
								? '500px'
								: '220px'
						}
						flex={pathList.length - 1 === listindex && 1}
						id='fileList_ul'
						key={listindex}
						onContextMenu={onContextMenu({
							clickedPath: pathList[listindex],
						})}
					>
						{listItem.map((item, index) => {
							if (listindex === 0 && item.name === '..') return;
							return (
								item.name !== '.' && (
									<_Li
										className={'filelist_contents'}
										type={
											(highlight.findIndex(
												(it) =>
													it?.name === item.name &&
													path ===
														pathList[listindex],
											) > -1
												? 'current'
												: undefined) ||
											(pathList[listindex + 1]
												?.split('/')
												.pop() === item.name
												? 'prev'
												: undefined)
										}
										key={index}
										onContextMenu={onContextMenu({
											item,
											clickedPath: pathList[listindex],
										})}
										onClick={onClick({
											item,
											listindex,
											itemIndex: index,
										})}
									>
										<_FirstItemContainer
											className={'filelist_contents'}
										>
											<SftpMainIcon
												type={
													item.type === 'directory'
														? 'main'
														: undefined
												}
												margin_right={'8px'}
											>
												{item.type === 'directory'
													? folderOpenIcon
													: fileIcon}
											</SftpMainIcon>

											<div
												className={'filelist_contents'}
											>
												{item.name}
											</div>
										</_FirstItemContainer>
										{pathList.length - 1 === listindex && (
											<>
												<_ItemContainer
													className={
														'filelist_contents'
													}
												>
													{item.permission}
												</_ItemContainer>
												<_ButtonContainer>
													{item.type === 'file' &&
														item.name !== '..' && (
															<HoverButton
																margin_right={
																	'12px'
																}
																zIndex={1}
																onClick={onEdit(
																	item,
																)}
															>
																{editIcon}
															</HoverButton>
														)}
													{item.name !== '..' && (
														<HoverButton
															zIndex={1}
															margin_right={'0px'}
															onClick={onDownload(
																item,
															)}
														>
															{fileDownloadIcon}
														</HoverButton>
													)}
												</_ButtonContainer>
											</>
										)}
									</_Li>
								)
							);
						})}
					</_Ul>
				);
			})}
			<FileListContextMenu uuid={uuid} />
		</_Container>
	);
};

DropList.propTypes = {
	uuid: PropTypes.string.isRequired,
	pathList: PropTypes.array.isRequired,
	onContextMenu: PropTypes.func.isRequired,
	highlight: PropTypes.array.isRequired,
	path: PropTypes.string.isRequired,
	onClick: PropTypes.func.isRequired,
	onDownload: PropTypes.func.isRequired,
	onEdit: PropTypes.func.isRequired,
	list: PropTypes.array.isRequired,
};
export default DropList;