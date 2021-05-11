import React, {useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {FaTh, AiTwotoneSetting, HiUserCircle} from 'react-icons/all';

import {CHANGE_NUMBER_OF_COLUMNS} from '../reducers/common';
import DropdownMenu from './DropdownMenu';
import {IconButton} from '../styles/buttons';
import {FlexBox} from '../styles/divs';

const RightCornerIcons = () => {
	const dispatch = useDispatch();
	const history = useHistory();

	const changeColumn = useCallback(
		(cols, max) => () => {
			dispatch({
				type: CHANGE_NUMBER_OF_COLUMNS,
				data: {cols: cols, max: max},
			});
		},
		[],
	);

	const changePath = useCallback(
		(path) => () => {
			history.push(path);
		},
		[],
	);

	const setting_list = [
		{onClick: changePath('/account'), title: 'Edit Setting'},
		{
			onClick: () => console.log('여기서 사이드바 열고 닫고'),
			title: 'Preferences',
		},
		{onClick: changePath('/identities'), title: 'Identities'},
		{title: 'divider'},
		{onClick: () => console.log('Logout Action'), title: 'Logout'},
	];
	const column_list = [
		{onClick: changeColumn(1, 1), title: 'No Columns'},
		{onClick: changeColumn(2, 4), title: '2 Columns'},
		{onClick: changeColumn(3, 3), title: '3 Columns'},
		{onClick: () => console.log('4 Columns'), title: '4 Columns'},
		{onClick: () => console.log('5 Columns'), title: '5 Columns'},
	];

	return (
		<FlexBox align={'center'} width={'fit-content'}>
			<IconButton>
				<HiUserCircle />
			</IconButton>
			<DropdownMenu icon={<AiTwotoneSetting />} menu={setting_list} />
			<DropdownMenu icon={<FaTh />} menu={column_list} />
		</FlexBox>
	);
};

export default RightCornerIcons;
