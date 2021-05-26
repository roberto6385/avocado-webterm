import produce from 'immer';
import {Terminal} from 'xterm';
import {ROBOTO} from '../styles/global';

export const initialState = {
	font: ROBOTO,
	font_size: 14,
	search_mode: false,
	ssht: [],
	snippets: [
		{id: 0, name: 'File List', content: 'ls'},
		{id: 1, name: 'Current Path', content: 'pwd'},
	],
	snippents_index: 2,
};

export const SSH_SET_FONT = 'SSH_SET_FONT';
export const SSH_INCREASE_FONT_SIZE = 'SSH_INCREASE_FONT_SIZE';
export const SSH_DECREASE_FONT_SIZE = 'SSH_DECREASE_FONT_SIZE';
export const SET_SEARCH_MODE = 'SET_SEARCH_MODE';
export const SSH_SEND_CONNECTION_REQUEST = 'SSH_SEND_CONNECTION_REQUEST';
export const SSH_SEND_CONNECTION_SUCCESS = 'SSH_SEND_CONNECTION_SUCCESS';
export const SSH_SEND_CONNECTION_FAILURE = 'SSH_SEND_CONNECTION_FAILURE';
export const SSHT_WRITE_ON_TERMINAL = 'SSHT_WRITE_ON_TERMINAL';
export const SSHT_SEND_DISCONNECTION_REQUEST =
	'SSHT_SEND_DISCONNECTION_REQUEST';
export const SSHT_SEND_DISCONNECTION_SUCCESS =
	'SSHT_SEND_DISCONNECTION_SUCCESS';
export const SSHT_SEND_DISCONNECTION_FAILURE =
	'SSHT_SEND_DISCONNECTION_FAILURE';
export const SSHT_SEND_COMMAND_REQUEST = 'SSHT_SEND_COMMAND_REQUEST';
export const SSHT_SEND_COMMAND_SUCCESS = 'SSHT_SEND_COMMAND_SUCCESS';
export const SSHT_SEND_COMMAND_FAILURE = 'SSHT_SEND_COMMAND_FAILURE';
export const SSHT_SEND_WINDOW_CHANGE_REQUEST =
	'SSHT_SEND_WINDOW_CHANGE_REQUEST';
export const SSHT_SEND_WINDOW_CHANGE_SUCCESS =
	'SSHT_SEND_WINDOW_CHANGE_SUCCESS';
export const SSHT_SEND_WINDOW_CHANGE_FAILURE =
	'SSHT_SEND_WINDOW_CHANGE_FAILURE';
export const SSHT_ADD_SNIPPET = 'SSHT_ADD_SNIPPET';
export const SSHT_DELETE_SNIPPET = 'SSHT_DELETE_SNIPPET';
export const SSHT_CHANGE_SNIPPET = 'SSHT_CHANGE_SNIPPET';

const reducer = (state = initialState, action) => {
	return produce(state, (draft) => {
		switch (action.type) {
			case SSH_SEND_CONNECTION_REQUEST:
				break;

			case SSH_SEND_CONNECTION_SUCCESS:
				draft.ssht.push({
					...action.data,
					terminal: new Terminal({
						cursorBlink: true,
						minimumContrastRatio: 7,
						fontFamily: draft.font,
						theme: {
							selection: '#FCFD08',
						},
					}),
				});
				break;

			case SSH_SEND_CONNECTION_FAILURE:
				break;

			case SSHT_WRITE_ON_TERMINAL:
				draft.ssht
					.find((v) => v.uuid === action.data.uuid)
					.terminal.write(action.data.result);
				break;

			case SSHT_SEND_DISCONNECTION_REQUEST:
				break;

			case SSHT_SEND_DISCONNECTION_SUCCESS:
				draft.ssht
					.find((v) => v.uuid === action.data)
					.terminal.dispose();
				draft.ssht = draft.ssht.filter((v) => v.uuid !== action.data);
				break;

			case SSHT_SEND_DISCONNECTION_FAILURE:
				break;

			case SSHT_SEND_COMMAND_REQUEST:
				break;

			case SSHT_SEND_COMMAND_SUCCESS:
				break;

			case SSHT_SEND_COMMAND_FAILURE:
				break;

			case SSHT_SEND_WINDOW_CHANGE_REQUEST:
				break;

			case SSHT_SEND_WINDOW_CHANGE_SUCCESS:
				break;

			case SSHT_SEND_WINDOW_CHANGE_FAILURE:
				break;

			case SSH_SET_FONT:
				draft.font = action.data;
				break;

			case SSH_INCREASE_FONT_SIZE:
				draft.font_size++;
				break;

			case SSH_DECREASE_FONT_SIZE:
				draft.font_size--;
				break;

			case SET_SEARCH_MODE:
				draft.search_mode = !draft.search_mode;
				break;

			case SSHT_ADD_SNIPPET:
				draft.snippets.push({
					id: draft.snippents_index,
					name: action.data.name,
					content: action.data.content,
				});
				draft.snippents_index++;
				break;

			case SSHT_DELETE_SNIPPET:
				draft.snippets = draft.snippets.filter(
					(x) => x.id !== action.data,
				);
				break;

			case SSHT_CHANGE_SNIPPET:
				// draft.snippets = draft.snippets.map((x) => {
				// 	if (x.id === action.data.id) return x;
				// 	else
				// 		return {
				// 			...x,
				// 			name: action.data.name,
				// 			content: action.data.content,
				// 		};
				// });
				draft.snippets = action.data.snippets;
				draft.snippents_index = action.data.snippents_index;
				break;

			default:
				break;
		}
	});
};

export default reducer;
