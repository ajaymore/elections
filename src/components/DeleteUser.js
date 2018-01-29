import React, { Component } from 'react';
import axios from 'axios';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import * as firebase from 'firebase';
import { keys } from 'lodash';
const baseUrl = 'https://us-central1-apustudentelections.cloudfunctions.net/app/';

export default class DeleteUser extends Component {
	constructor(props) {
		super(props);
		this.state = {
			newPassword: ''
		};
	}
	_closeDialog = () => {
		this.props.userDeleted();
	};
	_DeleteUser = async () => {
		const { uid } = this.props;
		const token = await firebase.auth().currentUser.getIdToken();
		const userBeingDeletedValue = await firebase
			.database()
			.ref('elections')
			.child('users')
			.child(uid)
			.once('value');
		const userBeingDeleted = userBeingDeletedValue.val();
		axios({
			url: `${baseUrl}user/${uid}`,
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + token
			}
		})
			.then(async (res) => {
				if (userBeingDeleted['poll-officer']) {
					const pollOfcrkey = userBeingDeleted['poll-officer'].key;
					const associatedBooths = await firebase
						.database()
						.ref('elections')
						.child('users')
						.child(pollOfcrkey)
						.child('associated-booths')
						.orderByChild('key')
						.equalTo(uid)
						.once('value');
					const boothDeleteKey = keys(associatedBooths.val())[0];
					firebase
						.database()
						.ref('elections')
						.child('users')
						.child(pollOfcrkey)
						.child('associated-booths')
						.child(boothDeleteKey)
						.set(null);
				}
				this.props.userDeleted();
			})
			.catch((err) => {
				console.log(err);
				alert('Error!!');
			});
	};
	componentDidMount() {
		firebase
			.database()
			.ref('elections')
			.child('users')
			.child('associated-booths')
			.orderByChild('key')
			.once('value')
			.then((snap) => {});
	}
	render() {
		return (
			<Dialog
				hidden={false}
				dialogContentProps={{
					type: DialogType.normal,
					title: `Are you sure you want to delete user - ${this.props.name}`
				}}
				modalProps={{
					isBlocking: true,
					containerClassName: 'ms-dialogMainOverride'
				}}
			>
				<DialogFooter>
					<PrimaryButton onClick={this._DeleteUser} text="Save" />
					<DefaultButton onClick={this._closeDialog} text="Cancel" />
				</DialogFooter>
			</Dialog>
		);
	}
}
