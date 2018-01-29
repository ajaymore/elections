import * as firebase from 'firebase';
export const AUTH_INIT = 'auth/AUTH_INIT';
export const LOGGED_IN = 'auth/LOGGED_IN';
export const LOGGED_OUT = 'auth/LOGGED_OUT';
export const LOGGING_IN = 'auth/LOGGING_IN';

const initialState = {
	authInit: true,
	loggingIn: false,
	loggedIn: false,
	user: null
};

export default (state = initialState, action) => {
	if (!action) {
		return;
	}
	switch (action.type) {
		case LOGGING_IN:
			return {
				...state,
				authInit: false,
				loggedIn: false,
				loggingIn: true
			};
		case LOGGED_IN:
			return {
				...state,
				authInit: false,
				loggedIn: true,
				user: action.payload
			};
		case LOGGED_OUT:
			return {
				...state,
				authInit: false,
				loggedIn: false,
				user: null
			};
		default:
			return state;
	}
};

export const authInit = () => {
	return (dispatch) => {
		firebase.auth().onAuthStateChanged(async (user) => {
			if (user) {
				const userWithRole = await firebase
					.database()
					.ref('elections')
					.child('users')
					.child(user.uid)
					.once('value');
				dispatch({
					type: LOGGED_IN,
					payload: { ...userWithRole.val(), uid: user.uid }
				});
			} else {
				dispatch({
					type: LOGGED_OUT
				});
			}
		});
	};
};

export const login = (email, password) => {
	return async (dispatch) => {
		dispatch({
			type: LOGGING_IN
		});

		try {
			await firebase.auth().signInWithEmailAndPassword(email, password);
		} catch (error) {
			console.log(error);
			dispatch({
				type: LOGGED_OUT
			});
		}
	};
};

export const logout = () => {
	firebase.auth().signOut();
	return (dispatch) => {
		dispatch({
			type: LOGGED_OUT
		});
	};
};
