import '../App.css';
import React from 'react';
import { Route, Redirect, withRouter } from 'react-router-dom';
import Home from '../components/Home';
import Login from '../components/Login';
import store from '../store';
import Initializing from '../components/Initializing';
import Reviewer from './Reviewer';
import Election from './Election';
import PollOfficer from './PollOfficer';
import PollOfficerVotingDay from './PollOfficerVotingDay';
import VoterForm from './VoterForm';
import * as firebase from 'firebase';
import BoothElectionList from './BoothElectionList';

const PrivateRoute = ({ component: Component, ...rest }) => (
	<Route
		{...rest}
		render={(props) =>
			store.getState().auth.authInit ? (
				<Initializing from={props.location} />
			) : store.getState().auth.loggedIn ? (
				<Component {...props} />
			) : (
				<Redirect
					to={{
						pathname: '/login',
						state: { from: props.location }
					}}
				/>
			)}
	/>
);

const Logout = () => {
	firebase.auth().signOut();
	return <Redirect to="/login" />;
};

const App = (props) => (
	<div>
		<main>
			<PrivateRoute exact path="/" component={Home} />
			<PrivateRoute exact path="/reviewer" component={Election} />
			<PrivateRoute exact path="/reviewer/:id" component={Reviewer} />
			<PrivateRoute exact path="/poll-officer" component={PollOfficer} />
			<PrivateRoute exact path="/poll-officer/:id" component={PollOfficerVotingDay} />
			<PrivateRoute exact path="/booth" component={BoothElectionList} />
			<PrivateRoute exact path="/booth/:id" component={VoterForm} />
			<Route exact path="/login" component={Login} />
			<Route exact path="/logout" component={Logout} />
		</main>
	</div>
);

export default withRouter(App);
