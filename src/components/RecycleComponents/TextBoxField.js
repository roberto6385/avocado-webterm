import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const _Container = styled.div`
	display: flex;
	flex: ${(props) => props.flex};
	flex-direction: column;
	margin-bottom: ${(props) =>
		props.marginBottom === undefined ? '16px' : props.marginBottom};
	.focus {
		border-color: ${(props) =>
			props.theme.basic.pages.textBoxs.normalStyle.focused.border.color};
	}
`;

const _Title = styled.div`
	margin: 0 10px 2px 0;
	letter-spacing: 0.1px;
	line-height: 1.5;
`;

const TextBoxField = ({title, children, flex, marginBottom}) => {
	return (
		<_Container flex={flex} marginBottom={marginBottom}>
			{title && <_Title>{title}</_Title>}
			{children}
		</_Container>
	);
};

TextBoxField.propTypes = {
	title: PropTypes.string,
	children: PropTypes.element.isRequired,
	flex: PropTypes.number,
	marginBottom: PropTypes.string,
};

export default TextBoxField;
