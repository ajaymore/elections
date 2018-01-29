import React from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { authInit } from '../modules/auth';

class Initializing extends React.Component {
	componentDidMount() {
		this.props.authInit();
	}

	render() {
		if (!this.props.auth.authInit && !this.props.auth.loggedIn) {
			return <Redirect to={{ pathname: '/login' }} />;
		} else if (this.props.auth.loggedIn) {
			return <Redirect to={{ pathname: this.props.from.pathname }} />;
		}
		return <div>Initializing!!</div>;
	}
}

const mapStateToProps = (state, ownProps) => {
	return {
		auth: state.auth
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		authInit: () => {
			dispatch(authInit());
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Initializing);
