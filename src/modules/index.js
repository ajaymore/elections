import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import auth from './auth';
// import reviewerData from './reviewerData';
import { reducer as formReducer } from 'redux-form';

export default combineReducers({
	routing: routerReducer,
	form: formReducer,
	auth
});
