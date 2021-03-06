import React from 'react';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';

const _Container = styled(ToastContainer)`
	/** Used to define container behavior: width, position: fixed etc... **/
	.Toastify__toast-container {
	}

	/** Used to define the position of the ToastContainer **/
	.Toastify__toast-container--top-left {
	}
	.Toastify__toast-container--top-center {
	}
	.Toastify__toast-container--top-right {
	}
	.Toastify__toast-container--bottom-left {
	}
	.Toastify__toast-container--bottom-center {
	}
	.Toastify__toast-container--bottom-right {
	}

	/** Classes for the displayed toast **/
	.Toastify__toast {
	}
	.Toastify__toast--rtl {
	}
	.Toastify__toast--dark {
	}
	.Toastify__toast--default {
	}
	.Toastify__toast--info {
	}
	.Toastify__toast--success {
	}
	.Toastify__toast--warning {
	}
	.Toastify__toast--error {
	}
	.Toastify__toast-body {
	}

	/** Classes for the close button. Better use your own closeButton **/
	.Toastify__close-button {
	}
	.Toastify__close-button--default {
	}
	.Toastify__close-button > svg {
	}
	.Toastify__close-button:hover,
	.Toastify__close-button:focus {
	}

	/** Classes for the progress bar **/
	.Toastify__progress-bar {
	}
	.Toastify__progress-bar--animated {
	}
	.Toastify__progress-bar--controlled {
	}
	.Toastify__progress-bar--rtl {
	}
	.Toastify__progress-bar--default {
	}
	.Toastify__progress-bar--dark {
	}
`;

const Toast = () => {
	return (
		<_Container
			position='bottom-right'
			hideProgressBar={false}
			newestOnTop={false}
			closeOnClick
			rtl={false}
			pauseOnFocusLoss={false}
			draggable
			pauseOnHover={false}
		/>
	);
};

export default Toast;
