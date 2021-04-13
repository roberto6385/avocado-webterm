import React from 'react';
import {PropTypes} from 'prop-types';
import {Card} from 'react-bootstrap';
import EditNav from './EditNav';
import EditContents from './EditContents';
import {FlexBox, SFTPBody} from '../../../styles/sftp';

const Edit = ({socket}) => {
	return (
		<FlexBox>
			<Card.Header>
				<EditNav ws={socket.ws} uuid={socket.uuid} />
			</Card.Header>
			<SFTPBody>
				<EditContents uuid={socket.uuid} />
			</SFTPBody>
		</FlexBox>
	);
};

Edit.propTypes = {
	socket: PropTypes.object.isRequired,
};

export default Edit;
