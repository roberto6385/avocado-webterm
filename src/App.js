import React, {Component} from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom';

import './styles/default.css'; //html, body => padding,margin : 0, box-sizing : border-box 로 설정
import 'bootstrap/dist/css/bootstrap.min.css'; // bootstrap css
import 'xterm/css/xterm.css';

import {NotFound, Main, Login, Account, Preferences, Identities} from './pages';
import AlertPopup from './components/Popup/AlertPopup';
import AddServerForm from './components/Form/AddServerForm';
import ConfirmPopup from './components/Popup/ConfirmPopup';

class App extends Component {
	render() {
		return (
			<BrowserRouter>
				<Switch>
					<Route path='/login' component={Login} />
					<Route path='/account' component={Account} />
					<Route path='/preferences' component={Preferences} />
					<Route path='/identities' component={Identities} />
					<Route path='/' component={Main} />
					<Route component={NotFound} />
				</Switch>
				<AddServerForm />
				<ConfirmPopup />
				<AlertPopup />
			</BrowserRouter>
		);
	}
}

export default App;
