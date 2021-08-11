import React, {useEffect} from 'react';
import styled from 'styled-components';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import WorkSpace from '../components/WorkSpace';
import Footer from '../components/Footer';
import {useHistory} from 'react-router-dom';
import {SAVE_ACCOUT} from '../reducers/common';
import {userAction} from '../reducers/auth/user';

const _Container = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;
	font-family: 'Roboto', sans-serif;
`;

const Home = () => {
	const dispatch = useDispatch();
	const history = useHistory();

	const {userTicket} = useSelector((state) => state.userTicket, shallowEqual);
	const {user} = useSelector((state) => state.user, shallowEqual);

	useEffect(() => {
		if (userTicket) {
			console.log(userTicket);
			dispatch(
				userAction.findByIdRequest({
					access_token: userTicket.access_token,
					id: userTicket.user_id,
				}),
			);
		} else {
			history.push('/signin');
			location.reload();
		}
	}, [dispatch, history, userTicket]);

	useEffect(() => {
		if (user) {
			console.log(user);

			dispatch({
				type: SAVE_ACCOUT,
				payload: {
					account: user.id,
					name: user.name,
					email: user.email,
				},
			});
		}
	}, [dispatch, user]);

	return (
		<_Container>
			<WorkSpace />
			<Footer />
		</_Container>
	);
};

export default Home;
