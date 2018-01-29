import React, { Component } from 'react';
import axios from 'axios';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import * as firebase from 'firebase';
const baseUrl = 'https://us-central1-apustudentelections.cloudfunctions.net/app/';

export default class ChangePassword extends Component {
	constructor(props) {
		super(props);
		this.state = {
			newPassword: ''
		};
	}
	_closeDialog = () => {
		this.props.passwordChanged();
	};
	_changePassword = () => {
		const { newPassword } = this.state;
		const { uid } = this.props;
		const data = { newPassword };
		if (newPassword.length < 6) {
			alert('password should be more than 6 characters in length');
			return;
		}
		firebase.auth().currentUser.getIdToken().then((token) => {
			axios({
				url: `${baseUrl}change-password/${uid}`,
				method: 'PUT',
				data,
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				}
			})
				.then((res) => {
					this.props.passwordChanged();
				})
				.catch((err) => alert('Error!!'));
		});
	};
	componentDidMount() {}
	render() {
		return (
			<Dialog
				hidden={false}
				dialogContentProps={{
					type: DialogType.normal,
					title: `Change Password for - ${this.props.name}`
				}}
				modalProps={{
					isBlocking: true,
					containerClassName: 'ms-dialogMainOverride'
				}}
			>
				<TextField
					label="New Password"
					type="password"
					required={true}
					value={this.state.newPassword}
					onChanged={(text) => {
						this.setState({ newPassword: text });
					}}
				/>
				<DialogFooter>
					<PrimaryButton onClick={this._changePassword} text="Save" />
					<DefaultButton onClick={this._closeDialog} text="Cancel" />
				</DialogFooter>
			</Dialog>
		);
	}
}
