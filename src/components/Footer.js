import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { logout } from '../modules/auth';
import ChangePassword from './ChangePassword';

class Footer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			logout: false,
			passwordChangeUid: ''
		};
	}

	logout = () => {
		this.props.logout();
		this.setState({ logout: true });
	};

	render() {
		return (
			<div
				className="col-sm-12"
				style={{
					textAlign: 'right',
					marginTop: 40,
					marginBottom: 20
				}}
			>
				<DefaultButton onClick={this.logout}>Logout</DefaultButton>&nbsp;&nbsp;&nbsp;
				<DefaultButton
					iconProps={{ iconName: 'Lock' }}
					onClick={() => {
						this.setState({
							passwordChangeUid: 'ofcr.key'
						});
					}}
				>
					Change Password
				</DefaultButton>
				{this.state.logout ? <Redirect to="/login" /> : ''}
				{this.state.passwordChangeUid ? (
					<ChangePassword
						uid={this.props.auth.user.uid}
						name={'Reviewer'}
						passwordChanged={() => {
							this.setState({ logout: true });
						}}
					/>
				) : (
					''
				)}
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	return {
		auth: state.auth
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		logout: () => {
			dispatch(logout());
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Footer);
