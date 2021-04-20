import React, {useCallback, useEffect, useState} from 'react';
import {PropTypes} from 'prop-types';
import {useDispatch, useSelector} from 'react-redux';
import {SFTP_SAVE_CURRENT_TEXT} from '../../../reducers/subSftp';
import {TextAreaWrapper} from '../../../styles/sftp';

const EditContents = ({uuid}) => {
	const {currentText} = useSelector((state) => state.subSftp);
	const dispatch = useDispatch();
	const curText = currentText.find((item) => item.uuid === uuid);
	const [editText, setEditText] = useState(curText?.text);
	const checked = window.localStorage.getItem('editorCheck');

	const writeText = useCallback(
		(e) => {
			const {value} = e.target;
			setEditText(value);
			dispatch({
				type: SFTP_SAVE_CURRENT_TEXT,
				data: {uuid, text: value, name: curText?.name},
			});
		},
		[curText, uuid],
	);

	useEffect(() => {
		setEditText(curText?.text);
	}, [curText]);

	return (
		<TextAreaWrapper>
			<textarea
				wrap={JSON.parse(checked) ? 'soft' : 'off'}
				rows='50'
				cols='40'
				value={editText}
				onChange={writeText}
			/>
		</TextAreaWrapper>
	);
};

EditContents.propTypes = {
	uuid: PropTypes.string.isRequired,
};

export default EditContents;