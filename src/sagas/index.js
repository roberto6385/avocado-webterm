import {all, fork} from 'redux-saga/effects';
import userTicket from './clientTicket';

export default function* rootSaga() {
	yield all([fork(userTicket)]);
}
