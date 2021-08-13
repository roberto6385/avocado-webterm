import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {FitAddon} from 'xterm-addon-fit';
import {SearchAddon} from 'xterm-addon-search';
import PropTypes from 'prop-types';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

import useInput from '../../hooks/useInput';
import {
	SSH_SEND_WINDOW_CHANGE_REQUEST,
	SSH_SEND_COMMAND_REQUEST,
	SSH_SET_SEARCH_MODE,
} from '../../reducers/ssh';

import {useDebouncedResizeObserver} from '../../hooks/useDebouncedResizeObserver';
import {
	arrowDropDownIcon,
	arrowDropUpIcon,
	closeIcon,
	searchIcon,
} from '../../icons/icons';
import {HoverButton, Icon} from '../../styles/components/icon';
import {
	terminalColor,
	terminalFontColor,
	terminalSelectionColor,
} from '../../styles/color';
import {tabBarSelector} from '../../reducers/tabBar';
import {settingSelector} from '../../reducers/setting';

const _Container = styled.div`
	height: 100%;
	width: 100%;
	overflow: hidden;
	padding: 20px;
	background-color: ${(props) =>
		props.theme.pages.webTerminal.main.panels.ssh.terminal.backgroundColor};
`;

const _Terminal = styled(_Container)`
	overflow: scroll;
	padding: 0px;
`;

const _SearchInput = styled.input`
	flex: 1;
	margin-right: 5px;
	background-color: transparent;
	border: none;
	color: ${(props) =>
		props.theme.pages.webTerminal.main.panels.ssh.searchBox.textBoxs.font
			.color};
`;

const _SearchContainer = styled.div`
	width: 400px;
	height: 42px;
	align-items: center;
	box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.24);
	background-color: ${(props) =>
		props.theme.pages.webTerminal.main.panels.ssh.searchBox
			.backgroundColor};
	border-radius: 4px;
	padding-left: 13px;
	position: absolute;
	right: 10px;
	bottom: 10px;
	display: none;
	z-index: 5;
`;

const _ListGroup = styled.ul`
	position: absolute;
	display: flex;
	flex-direction: column;
	left: ${(props) => props.left};
	top: ${(props) => props.top};
	bottom: ${(props) => props.bottom};
	display: ${(props) => props.display};
	width: 130px;
	box-shadow: 0 2px 10px 0
		${(props) =>
			props.theme.pages.webTerminal.main.panels.ssh.autoComplete.boxShadow
				.color};
	zindex: 5;
	padding: 8px 0;
	background-color: ${(props) =>
		props.theme.pages.webTerminal.main.panels.ssh.autoComplete
			.backgroundColor};
`;

const _ListGroupItem = styled.li`
	padding: 6px 5.8px;
	border: none;
	overflow: auto;
	color: ${(props) =>
		props.theme.pages.webTerminal.main.panels.ssh.autoComplete.font.color};
	background-color: ${(props) =>
		props.selected
			? props.theme.pages.webTerminal.main.panels.ssh.autoComplete.items
					.selectedStyle.backgroundColor
			: props.theme.pages.webTerminal.main.panels.ssh.autoComplete.items
					.normalStyle.backgroundColor};
`;

const _AutoCompletionListFooter = styled(_ListGroupItem)`
	font-size: 10px;
	border-top: 1px solid
		${(props) =>
			props.theme.pages.webTerminal.main.panels.ssh.autoComplete.border
				.color};
`;

const SSH = ({uuid, isToolbarUnfold}) => {
	const dispatch = useDispatch();
	const {t} = useTranslation('SSH');

	const {selectedTab} = useSelector(tabBarSelector.all);
	const {theme} = useSelector(settingSelector.all);
	const {
		font,
		font_size,
		search_mode,
		ssh,
		ssh_history,
		auto_completion_mode,
	} = useSelector((state) => state.ssh, shallowEqual);

	const currentCommand = useMemo(
		() => ssh.find((v) => v.uuid === uuid).current_line,
		[ssh, uuid],
	);
	const [search, onChangeSearch, setSearch] = useInput('');
	const historyList = useMemo(
		() =>
			currentCommand === ''
				? []
				: ssh_history
						.filter((v) => v.startsWith(currentCommand))
						.slice(-5)
						.reverse(),
		[ssh_history, currentCommand],
	);
	const [selectedHistory, setSelectedHistory] = useState(0);
	const [ignoreAutoCompletionMode, setIgnoreAutoCompletionMode] =
		useState(false);
	const sshTerm = useMemo(
		() => ssh.find((v) => v.uuid === uuid).terminal,
		[ssh, uuid],
	);
	const {current: ws} = useRef(ssh.find((v) => v.uuid === uuid).ws);
	const {current: fitAddon} = useRef(new FitAddon());
	const {current: searchAddon} = useRef(new SearchAddon());
	//do not work with {current}
	const searchRef = useRef(null);
	const {
		ref: sshContainerRef,
		width: width,
		height: height,
	} = useDebouncedResizeObserver(3000);
	const [isComponentMounted, setIsComponentMounted] = useState(true);

	const onKeyPressEnter = useCallback(
		(e) => {
			if (e.key === 'Enter') searchAddon.findPrevious(search);
		},
		[search, searchAddon],
	);

	const onClickCommandHistory = useCallback(
		(v) => () => {
			dispatch({
				type: SSH_SEND_COMMAND_REQUEST,
				payload: {
					uuid: uuid,
					ws: ws,
					input: v.substring(currentCommand.length),
				},
			});
			dispatch({
				type: SSH_SEND_COMMAND_REQUEST,
				payload: {
					uuid: uuid,
					ws: ws,
					input: '\r',
				},
			});
		},
		[currentCommand.length, dispatch, uuid, ws],
	);

	const onClickOpenSearchBar = useCallback(() => {
		if (selectedTab !== null) dispatch({type: SSH_SET_SEARCH_MODE});
	}, [selectedTab]);

	const onClickUpArrow = useCallback(() => {
		searchAddon.findPrevious(search);
	}, [search, searchAddon]);

	const onClickDownrrow = useCallback(() => {
		searchAddon.findNext(search);
	}, [search, searchAddon]);
	//terminal setting
	useEffect(() => {
		while (document.getElementById('terminal_' + uuid).hasChildNodes()) {
			document
				.getElementById('terminal_' + uuid)
				.removeChild(
					document.getElementById('terminal_' + uuid).firstChild,
				);
		}

		sshTerm.loadAddon(fitAddon);
		sshTerm.loadAddon(searchAddon);
		sshTerm.open(document.getElementById('terminal_' + uuid));

		return () => {
			setIsComponentMounted(false);
		};
	}, [fitAddon, searchAddon, sshTerm, uuid]);
	//terminal get input data
	useEffect(() => {
		const processInput = sshTerm.onData((data) => {
			if (
				auto_completion_mode &&
				currentCommand.length > 1 &&
				data.charCodeAt(0) === 27
			) {
				if (data.substr(1) === '[A') {
					//Up
					if (selectedHistory === 0)
						setSelectedHistory(historyList.length - 1);
					else setSelectedHistory(selectedHistory - 1);
				} else if (data.substr(1) === '[B') {
					//Down
					if (selectedHistory === historyList.length - 1)
						setSelectedHistory(0);
					else setSelectedHistory(selectedHistory + 1);
				} else {
					setIgnoreAutoCompletionMode(true);
				}
			} else if (
				currentCommand.length > 1 &&
				auto_completion_mode &&
				!ignoreAutoCompletionMode &&
				historyList.length > 0 &&
				data.charCodeAt(0) === 13
			) {
				//Enter
				dispatch({
					type: SSH_SEND_COMMAND_REQUEST,
					payload: {
						uuid: uuid,
						ws: ws,
						input: historyList[selectedHistory].substring(
							currentCommand.length,
						),
					},
				});
				dispatch({
					type: SSH_SEND_COMMAND_REQUEST,
					payload: {
						uuid: uuid,
						ws: ws,
						input: '\r',
					},
				});
			} else {
				dispatch({
					type: SSH_SEND_COMMAND_REQUEST,
					payload: {
						uuid: uuid,
						ws: ws,
						input: data,
					},
				});
				if (data.charCodeAt(0) === 13 && ignoreAutoCompletionMode)
					setIgnoreAutoCompletionMode(false);
			}
		});

		return () => {
			processInput.dispose();
		};
	}, [
		uuid,
		ws,
		sshTerm,
		auto_completion_mode,
		selectedHistory,
		historyList,
		ignoreAutoCompletionMode,
		currentCommand,
		dispatch,
	]);
	//current tab terminal is focused
	useEffect(() => {
		if (selectedTab === uuid) sshTerm.focus();
	}, [selectedTab, uuid, sshTerm]);
	//window size change
	useEffect(() => {
		if (width > 0 && height > 0 && uuid && isComponentMounted) {
			fitAddon.fit();
			dispatch({
				type: SSH_SEND_WINDOW_CHANGE_REQUEST,
				payload: {
					ws: ws,
					uuid: uuid,
					data: {
						cols: sshTerm.cols,
						rows: sshTerm.rows,
						width: width,
						height: height,
					},
				},
			});
		}
	}, [ws, uuid, sshTerm, width, height, isComponentMounted, fitAddon]);
	//click search button
	useEffect(() => {
		if (selectedTab === uuid && search_mode) {
			document.getElementById('ssh_search_' + uuid).style.display =
				'flex';
			searchRef.current.focus();
		} else {
			document.getElementById('ssh_search_' + uuid).style.display =
				'none';
			setSearch('');
			searchAddon.findPrevious('');
		}
	}, [selectedTab, uuid, search_mode, searchRef, setSearch, searchAddon]);
	//search a word on the terminal
	useEffect(() => {
		if (selectedTab === uuid) {
			searchAddon.findPrevious('');
			searchAddon.findPrevious(search);
		}
	}, [selectedTab, uuid, search, searchAddon]);
	//set History List
	useEffect(() => {
		if (auto_completion_mode && currentCommand.length > 1) {
			setSelectedHistory(0);
		}
	}, [
		auto_completion_mode,
		ssh_history,
		currentCommand,
		ignoreAutoCompletionMode,
	]);
	//change font
	useEffect(() => {
		sshTerm.setOption('fontFamily', font);
		fitAddon.fit();
	}, [sshTerm, fitAddon, font]);

	//change font size
	useEffect(() => {
		sshTerm.setOption('fontSize', font_size);
		fitAddon.fit();
	}, [sshTerm, fitAddon, font_size]);
	//change terminal theme
	useEffect(() => {
		sshTerm.setOption('theme', {
			background: terminalColor[theme],
			foreground: terminalFontColor[theme],
			selection: terminalSelectionColor[theme],
		});
		fitAddon.fit();
	}, [sshTerm, fitAddon, theme]);

	return (
		<_Container
			id={`terminal_container_${uuid}`}
			ref={sshContainerRef}
			className={!isToolbarUnfold && 'close-nav-terminal'}
		>
			<_Terminal id={`terminal_${uuid}`} />
			<_ListGroup
				id={`auto_complete_list_${uuid}`}
				left={
					width -
						Number(
							sshTerm._core.textarea?.style.left.substring(
								0,
								sshTerm._core.textarea?.style.left.length - 2,
							),
						) -
						140 >
					0
						? String(
								Number(
									sshTerm._core.textarea?.style.left.substring(
										0,
										sshTerm._core.textarea?.style.left
											.length - 2,
									),
								) + 30,
						  ) + 'px'
						: String(
								Number(
									sshTerm._core.textarea?.style.left.substring(
										0,
										sshTerm._core.textarea?.style.left
											.length - 2,
									),
								) - 150,
						  ) + 'px'
				}
				top={
					height -
						Number(
							sshTerm._core.textarea?.style.top.substring(
								0,
								sshTerm._core.textarea?.style.top.length - 2,
							),
						) -
						document.getElementById(`auto_complete_list_${uuid}`)
							?.clientHeight >
					100
						? String(
								Number(
									sshTerm._core.textarea?.style.top.substring(
										0,
										sshTerm._core.textarea?.style.top
											.length - 2,
									),
								) + 100,
						  ) + 'px'
						: 'undefine'
				}
				bottom={
					height -
						Number(
							sshTerm._core.textarea?.style.top.substring(
								0,
								sshTerm._core.textarea?.style.top.length - 2,
							),
						) -
						document.getElementById(`auto_complete_list_${uuid}`)
							?.clientHeight <=
					100
						? String(
								height -
									Number(
										sshTerm._core.textarea?.style.top.substring(
											0,
											sshTerm._core.textarea?.style.top
												.length - 2,
										),
									) +
									30,
						  ) + 'px'
						: 'undefine'
				}
				display={
					currentCommand.length > 1 &&
					selectedTab === uuid &&
					auto_completion_mode &&
					!ignoreAutoCompletionMode &&
					historyList.length > 0
						? 'flex'
						: 'none'
				}
			>
				{historyList.map((v, i) => (
					<_ListGroupItem
						selected={i === selectedHistory ? 1 : 0}
						onClick={onClickCommandHistory(v)}
						key={i}
					>
						{v}
					</_ListGroupItem>
				))}
				<_AutoCompletionListFooter>
					{t('autoCompletionFooter')}
				</_AutoCompletionListFooter>
			</_ListGroup>

			<_SearchContainer id={`ssh_search_${uuid}`}>
				<Icon size={'xs'} margin_right={'5px'} onClick={onClickUpArrow}>
					{searchIcon}
				</Icon>
				<_SearchInput
					onKeyPress={onKeyPressEnter}
					onChange={onChangeSearch}
					value={search}
					placeholder={t('search')}
					type='text'
					ref={searchRef}
				/>
				<HoverButton size={'sm'} margin='8px' onClick={onClickUpArrow}>
					{arrowDropUpIcon}
				</HoverButton>
				<HoverButton
					size={'sm'}
					margin_right='8px'
					onClick={onClickDownrrow}
				>
					{arrowDropDownIcon}
				</HoverButton>
				<HoverButton
					size={'sm'}
					margin='11px'
					onClick={onClickOpenSearchBar}
				>
					{closeIcon}
				</HoverButton>
			</_SearchContainer>
		</_Container>
	);
};

SSH.propTypes = {
	uuid: PropTypes.string.isRequired,
	isToolbarUnfold: PropTypes.bool.isRequired,
};

export default SSH;
