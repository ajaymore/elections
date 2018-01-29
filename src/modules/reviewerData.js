import * as firebase from 'firebase';
import { filter } from 'lodash';
import { generatePushID } from '../utils';
export const SAVE_PERMISSIONS = 'permissions/SAVE_PERMISSION';
export const SAVING_IN_PROGRESS = 'permissions/SAVING_IN_PROGRESS';
export const FETCH_PERMISSION = 'permissions/FETCH_PERMISSION';
export const PERMISSION_FETCH_PROGRESS = 'permissions/PERMISSION_FETCH_PROGRESS';
export const REMOVE_PERM_ITEM = 'permissions/REMOVE_PERM_ITEM';
export const ADD_PERM_ITEM = 'permissions/ADD_PERM_ITEM';
export const FETCHING_REVIEWER_SETTINGS = 'permissions/FETCHING_REVIEWER_SETTINGS';
export const REVIEWER_SETTINGS_AVAILABLE = 'permissions/REVIEWER_SETTINGS_AVAILABLE';

const intialState = {
	voterFields: [ 'APU_ID', 'IS_HOSTELITE', 'HOSTEL', 'COURSE', 'GENDER', 'YEAR' ],
	postsAvailable: [
		{ id: 1, title: 'SSC One' },
		{ id: 2, title: 'SSC Two' },
		{ id: 3, title: 'SC' },
		{ id: 4, title: 'Placements First Year' },
		{ id: 5, title: 'Placements Second Year' },
		{ id: 6, title: 'Program Office' },
		{ id: 7, title: 'Hostel Metro First' },
		{ id: 8, title: 'Hostel Metro Second' },
		{ id: 9, title: 'Hostel Sai First' },
		{ id: 10, title: 'Hostel Sai Second' }
	],
	permissionSet: {
		1: [],
		2: [],
		3: [],
		4: [],
		5: [],
		6: [],
		7: [],
		8: [],
		9: [],
		10: []
	},
	savingInProgress: false
};

export default (state = intialState, action) => {
	if (!action) {
		return;
	}
	switch (action.type) {
		case SAVING_IN_PROGRESS:
			return {
				...state,
				savingInProgress: true
			};
		case SAVE_PERMISSIONS:
			return {
				...state,
				permissionSet: action.payload,
				savingInProgress: false
			};
		case ADD_PERM_ITEM:
			return {
				...state,
				permissionSet: {
					...state.permissionSet,
					[action.payload]: [
						...state.permissionSet[action.payload],
						{ id: generatePushID(), name: '', value: '' }
					]
				}
			};
		case REMOVE_PERM_ITEM:
			return {
				...state,
				permissionSet: {
					...state.permissionSet,
					[action.payload.postId]: filter(state.permissionSet[action.payload.postId], (item) => {
						return item.id !== action.payload.permId;
					})
				}
			};
		default:
			return state;
	}
};

export const fetchReviewerSettings = (electionId) => {
	return (dispatch) => {
		dispatch({
			type: FETCHING_REVIEWER_SETTINGS
		});
		const reviwerSettings = firebase
			.database()
			.ref('elections')
			.child(electionId)
			.child('reviwerSettings')
			.on('value', (reviwerSettings) => {
				dispatch({
					type: REVIEWER_SETTINGS_AVAILABLE,
					payload: reviwerSettings.val()
				});
			});
	};
};

export const savePermissions = (permissions) => {
	return (dispatch) => {
		dispatch({
			type: SAVING_IN_PROGRESS
		});
		console.log(permissions);
		// dispatch({
		// 	action: SAVE_PERMISSIONS,
		// 	payload: permissions
		// });
	};
};

export const fetchPermissions = (electionId) => {
	return async (dispatch) => {
		const permissions = await firebase.database().ref('elections').child(electionId).once('value');
		if (permissions) {
			console.log(permissions);
		}
	};
};

export const addPermissionItem = (postId) => {
	return (dispatch) => {
		dispatch({
			type: ADD_PERM_ITEM,
			payload: postId
		});
	};
};

export const removePermission = (postId, permId) => {
	return (dispatch) => {
		dispatch({
			type: REMOVE_PERM_ITEM,
			payload: {
				postId,
				permId
			}
		});
	};
};
