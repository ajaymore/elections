import React from 'react';
import { login, authInit } from '../modules/auth';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import store from '../store';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';

const renderField = ({ input, label, type, meta: { touched, error, warning } }) => (
	<div>
		<label>{label}</label>
		<div>
			<TextField {...input} placeholder={label} type={type} />
			{touched &&
				((error && (
					<span
						style={{
							color: '#a94442',
							marginBottom: 10,
							display: 'block'
						}}
					>
						{error}
					</span>
				)) ||
					(warning && <span>{warning}</span>))}
		</div>
	</div>
);

const validate = (values) => {
	const errors = {};
	if (!values.email) {
		errors.email = 'Required';
	} else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
		errors.email = 'Invalid email address';
	}
	if (!values.password) {
		errors.password = 'Required';
	} else if (values.password && values.password.length < 6) {
		errors.password = `Must be 6 characters or more`;
	} else if (values.password && values.password.length > 18) {
		errors.password = `Must be 18 characters or less`;
	}
	return errors;
};

class Login extends React.Component {
	componentDidMount() {
		if (store.getState().auth.authInit) {
			this.props.authInit();
		}
	}
	render() {
		const { from } = this.props.location.state || { from: { pathname: '/' } };
		const { handleSubmit, auth, login, pristine, submitting } = this.props;

		if (auth.loggedIn) {
			return <Redirect to={from} />;
		}

		return (
			<div className="login-form">
				<h2>Login</h2>
				<form onSubmit={handleSubmit(login)}>
					<div>
						<Field lable="Email" name="email" placeholder="email" component={renderField} type="email" />
					</div>
					<div>
						<Field
							label="password"
							name="password"
							placeholder="password"
							component={renderField}
							type="password"
						/>
					</div>
					<PrimaryButton disabled={pristine || submitting} type="submit" style={{ marginTop: 10 }}>
						Submit
					</PrimaryButton>
				</form>
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
		login: ({ email, password }) => {
			dispatch(login(email, password));
		},
		authInit: () => {
			dispatch(authInit());
		}
	};
};

const LoginForm = reduxForm({ form: 'loginForm', validate }, validate)(Login);

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
