import React, { Component } from 'react';
import axios from 'axios';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import * as firebase from 'firebase';
const baseUrl = 'https://us-central1-apustudentelections.cloudfunctions.net/app/';

export default class NewUserPollOfficer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			displayName: '',
			role: 'poll-officer',
			password: ''
		};
	}
	_closeDialog = () => {
		this.props.pollOfcrLoginCreated();
	};
	_createPollOfficer = () => {
		const { email, displayName, role, password } = this.state;
		const data = { email, displayName, role, password };
		if (password.length < 6 || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
			alert('password should be more than 6 characters in length and email should be of the form abc@xyz.cz');
			return;
		}
		firebase.auth().currentUser.getIdToken().then((token) => {
			axios({
				url: `${baseUrl}user`,
				method: 'POST',
				data,
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				}
			})
				.then((res) => {
					this.setState(
						{
							email: '',
							displayName: '',
							role: 'poll-officer',
							password: ''
						},
						() => {
							this.props.pollOfcrLoginCreated();
						}
					);
				})
				.catch((err) => alert('Error!!'));
		});
	};
	componentDidMount() {}
	render() {
		return (
			<Dialog
				hidden={!this.props.addPollOfcr}
				onDismiss={this._closeDialog}
				dialogContentProps={{
					type: DialogType.normal,
					title: 'Create a Poll Officer login'
				}}
				modalProps={{
					isBlocking: true,
					containerClassName: 'ms-dialogMainOverride'
				}}
			>
				<TextField
					label="Email"
					required={true}
					value={this.state.email}
					onChanged={(text) => {
						this.setState({ email: text });
					}}
				/>
				<TextField
					label="Display Name"
					required={true}
					value={this.state.displayName}
					onChanged={(text) => {
						this.setState({ displayName: text });
					}}
				/>
				<TextField
					type="password"
					label="Password"
					required={true}
					value={this.state.password}
					onChanged={(text) => {
						this.setState({ password: text });
					}}
				/>
				<DialogFooter>
					<PrimaryButton onClick={this._createPollOfficer} text="Save" />
					<DefaultButton onClick={this._closeDialog} text="Cancel" />
				</DialogFooter>
			</Dialog>
		);
	}
}
