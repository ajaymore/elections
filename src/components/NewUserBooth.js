import React, { Component } from 'react';
import axios from 'axios';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import * as firebase from 'firebase';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
const baseUrl = 'https://us-central1-apustudentelections.cloudfunctions.net/app/';

export default class NewUserBooth extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			displayName: '',
			role: 'booth',
			password: '',
			selectedItem: null
		};
	}
	_closeDialog = () => {
		this.props.boothLoginCreated();
	};
	_createBooth = () => {
		const { email, displayName, role, password, selectedItem } = this.state;
		const data = { email, displayName, role, password };
		if (password.length < 6 || !selectedItem || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
			alert(
				'password should be more than 6 characters in length and polling officer is required and email should be of the form abc@xyz.cz'
			);
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
					firebase
						.database()
						.ref('elections/users')
						.child(res.data.uid)
						.child('poll-officer')
						.set(selectedItem);
					firebase
						.database()
						.ref('elections/users')
						.child(selectedItem.key)
						.child('associated-booths')
						.push({ key: res.data.uid, email, displayName });
					this.setState(
						{
							email: '',
							displayName: '',
							role: 'booth',
							password: ''
						},
						() => {
							this.props.boothLoginCreated();
						}
					);
				})
				.catch((err) => alert('Error!!'));
		});
	};
	componentDidMount() {}
	render() {
		const { selectedItem } = this.state;
		return (
			<Dialog
				hidden={!this.props.addBooth}
				onDismiss={this._closeDialog}
				dialogContentProps={{
					type: DialogType.normal,
					title: 'Create a Booth login'
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
				<Dropdown
					label="Poll Officer"
					selectedKey={selectedItem && selectedItem.key}
					onChanged={(item) => this.setState({ selectedItem: item })}
					options={this.props.pollOfcrs.map((item) => {
						return { ...item, text: item.displayName };
					})}
				/>
				<DialogFooter>
					<PrimaryButton onClick={this._createBooth} text="Save" />
					<DefaultButton onClick={this._closeDialog} text="Cancel" />
				</DialogFooter>
			</Dialog>
		);
	}
}
