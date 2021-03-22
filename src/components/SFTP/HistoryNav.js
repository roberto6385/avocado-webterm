import React from 'react';
import styled from 'styled-components';
import {
	BsArrowClockwise,
	BsCheck,
	MdFileUpload,
	MdPause,
	MdDelete,
} from 'react-icons/all';
import {PropTypes} from 'prop-types';
import {useDispatch, useSelector} from 'react-redux';
import {sendCommandByPut} from './commands/sendCommandPut';
import {sendCommandByPwd} from './commands/sendCommandPwd';
import {sendCommandByLs} from './commands/sendCommandLs';
import {listConversion} from './commands';

const NavItem = styled.button`
	background: transparent;
	border: none;
	font-size: 18px;
	cursor: pointer;
	line-height: 0;
`;
const HistoryNav = ({index, ws, uuid}) => {
	const {currentPath} = useSelector((state) => state.sftp);
	const pathItem = currentPath.find((item) => item.uuid === uuid);
	const dispatch = useDispatch();

	const upload = () => {
		const uploadInput = document.createElement('input');
		document.body.appendChild(uploadInput);
		uploadInput.setAttribute('type', 'file');
		uploadInput.setAttribute('multiple', 'multiple');
		uploadInput.setAttribute('style', 'display:none');
		uploadInput.click();
		uploadInput.onchange = async (e) => {
			const File = e.target.files;
			for await (const key of Object.keys(File)) {
				await sendCommandByPut(
					'put',
					File[key],
					ws,
					uuid,
					pathItem?.path,
					File[key].name,
				);
			}
			sendCommandByLs(ws, uuid, pathItem?.path, dispatch);
		};
		document.body.removeChild(uploadInput);
	};

	const historyDelete = () => {};

	return (
		<>
			<NavItem>
				<BsArrowClockwise />
			</NavItem>
			<NavItem>
				<BsCheck />
			</NavItem>
			<NavItem id='btn-upload' onClick={upload}>
				<MdFileUpload />
			</NavItem>
			<NavItem>
				<MdPause />
			</NavItem>
			<NavItem onClick={historyDelete}>
				<MdDelete />
			</NavItem>
		</>
	);
};

HistoryNav.propTypes = {
	index: PropTypes.number.isRequired,
	ws: PropTypes.object.isRequired,
	uuid: PropTypes.string.isRequired,
};

export default HistoryNav;