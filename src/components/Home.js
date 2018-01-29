import React from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

const Home = (props) => {
	if (props.auth.user.role === 'Reviewer') {
		return <Redirect to="/reviewer" />;
	} else if (props.auth.user.role === 'poll-officer') {
		return <Redirect to="/poll-officer" />;
	} else if (props.auth.user.role === 'booth') {
		return <Redirect to="/booth" />;
	} else {
		return <div>App is not working!!</div>;
	}
};

const mapStateToProps = (state, ownProps) => {
	return {
		auth: state.auth
	};
};

export default connect(mapStateToProps)(Home);
