import React, {useState} from 'react';
import * as PropTypes from 'prop-types';
import {animation, Item, Menu} from 'react-contexify';
import AddServerForm from './AddServerForm/AddServerForm';
import ConfirmPopup from './ConfirmPopup/ConfirmPopup';
import {useDispatch} from 'react-redux';
import {CHANGE_OPEN_ADD_SERVER_FORM} from '../reducers/common';

const FolderContextMenu = ({data, indent, setOpenRename}) => {
	const dispatch = useDispatch();

	const [open, setOpen] = useState(false);
	const [keyword, setKeyword] = useState('');
	const [addFolderOpen, setAddFolderOpen] = useState(false);
	const [addServerOpen, setAddServerOpen] = useState(false);

	const MENU_ID = data.key + 'folder';

	function handleItemClick({event}) {
		setKeyword(event.currentTarget.id);
		switch (event.currentTarget.id) {
			case 'New Server':
				setAddServerOpen(true);
				break;
			case 'New Folder':
				setAddFolderOpen(true);
				break;
			case 'Rename':
				setOpenRename(true);
				break;
			case 'Delete':
				setOpen(true);
				break;
			default:
				return;
		}
	}

	return (
		<>
			<Menu
				id={MENU_ID}
				animation={animation.slide}
				style={{fontSize: '14px'}}
			>
				<Item onClick={handleItemClick} id='New Server'>
					New Server
				</Item>
				<Item onClick={handleItemClick} id='New Folder'>
					New Folder
				</Item>
				<Item onClick={handleItemClick} id='Rename'>
					Rename
				</Item>
				<Item onClick={handleItemClick} id='Delete'>
					Delete
				</Item>
			</Menu>
			<AddServerForm
				setOpen={setAddServerOpen}
				type={'add'}
				open={addServerOpen}
			/>

			<ConfirmPopup
				keyword={'add_folder'}
				open={addFolderOpen}
				setOpen={setAddFolderOpen}
			/>
			<ConfirmPopup
				keyword={'delete_server'}
				open={open}
				setOpen={setOpen}
			/>
		</>
	);
};

FolderContextMenu.propTypes = {
	data: PropTypes.object.isRequired,
	indent: PropTypes.number.isRequired,
	setOpenRename: PropTypes.func.isRequired,
};

export default FolderContextMenu;
