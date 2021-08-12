import React, {useCallback, useEffect, useRef} from 'react';
import * as PropTypes from 'prop-types';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

import useInput from '../../../hooks/useInput';
import TextBoxField_ from '../../RecycleComponents/TextBoxField_';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {closeIcon} from '../../../icons/icons';
import {
	NormalButton,
	TransparentButton,
} from '../../../styles/components/button';
import {IconButton} from '../../../styles/components/icon';
import {
	ModalFooter,
	ModalHeader,
	PopupModal,
} from '../../../styles/components/disalogBox';
import {Input} from '../../../styles/components/input';
import {Form} from '../../../styles/components/form';
import {
	USER_RESOURCE,
	userResourceAction,
} from '../../../reducers/api/userResource';
import {AUTH} from '../../../reducers/api/auth';

const _PopupModal = styled(PopupModal)`
	z-index: 5;
	width: 404px;
`;

const ChangeUserNameDialogBox = ({open, setOpen}) => {
	const dispatch = useDispatch();
	const {t} = useTranslation('changeNameForm');

	const {userData} = useSelector((state) => state[AUTH], shallowEqual);
	const {data} = useSelector((state) => state[USER_RESOURCE], shallowEqual);

	const nameRef = useRef(null);
	const [currentName, onChangeCurrentName, setCurrentName] = useInput(null);

	const closeModal = useCallback(() => {
		setOpen(false);
	}, [setOpen]);

	const onSubmitForm = useCallback(
		(e) => {
			e.preventDefault();

			if (currentName !== '') {
				dispatch(
					userResourceAction.modifyRequest({
						userUid: data.userUid,
						name: currentName,
						password: localStorage.getItem('password'),
						access_token: userData.access_token,
					}),
				);
			}

			closeModal();
		},
		[currentName, closeModal, dispatch, data, userData],
	);

	useEffect(() => {
		currentName === '' && nameRef.current?.focus();
	}, [currentName]);

	useEffect(() => {
		if (open) {
			setCurrentName('');
		}
	}, [open, setCurrentName]);

	return (
		<_PopupModal
			isOpen={open}
			onRequestClose={closeModal}
			ariaHideApp={false}
			shouldCloseOnOverlayClick={false}
		>
			<ModalHeader>
				<div>{t('title')}</div>
				<IconButton
					btype={'font'}
					size={'sm'}
					margin={'0px'}
					onClick={closeModal}
				>
					{closeIcon}
				</IconButton>
			</ModalHeader>
			<Form onSubmit={onSubmitForm}>
				<TextBoxField_ title={t('name')}>
					<Input
						ref={nameRef}
						type='text'
						value={currentName}
						onChange={onChangeCurrentName}
						placeholder={t('place.name')}
					/>
				</TextBoxField_>
			</Form>

			<ModalFooter>
				<TransparentButton onClick={closeModal}>
					{t('cancel')}
				</TransparentButton>
				<NormalButton onClick={onSubmitForm}>{t('save')}</NormalButton>
			</ModalFooter>
		</_PopupModal>
	);
};

ChangeUserNameDialogBox.propTypes = {
	open: PropTypes.bool.isRequired,
	setOpen: PropTypes.func.isRequired,
};

export default ChangeUserNameDialogBox;
