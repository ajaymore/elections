import React, { Component } from 'react';
import * as firebase from 'firebase';
import NewUserPollOfficer from './NewUserPollOfficer';
import NewUserBooth from './NewUserBooth';
import { PrimaryButton, CommandButton } from 'office-ui-fabric-react/lib/Button';
import { keys } from 'lodash';
import ChangePassword from './ChangePassword';
import DeleteUser from './DeleteUser';

export default class Booths extends Component {
	constructor(props) {
		super(props);
		this.state = {
			addBooth: false,
			addPollOfcr: false,
			pollOfficers: [],
			booths: [],
			passwordChangeName: '',
			passwordChangeUid: '',
			deleteUserUid: '',
			deleteUserName: ''
		};
	}

	componentDidMount() {
		this.rootElectionRef = firebase.database().ref('elections');
		this.rootElectionRef.child('users').on('value', (snap) => {
			if (snap.val()) {
				const users = keys(snap.val()).map((key) => {
					return { ...snap.val()[key], key };
				});
				const pollOfficers = users.filter((user) => user.role === 'poll-officer');
				const booths = users.filter((user) => user.role === 'booth');
				this.setState({ pollOfficers, booths });
			}
		});
	}

	render() {
		return (
			<div className="ms-Grid">
				<div className="ms-Grid-row">
					<PrimaryButton
						style={{ marginRight: 40 }}
						iconProps={{ iconName: 'Add' }}
						onClick={() => {
							this.setState({ addPollOfcr: !this.state.addPollOfcr, addBooth: false });
						}}
					>
						Add Polling Officer
					</PrimaryButton>
					<NewUserPollOfficer
						addPollOfcr={this.state.addPollOfcr}
						pollOfcrLoginCreated={() => {
							this.setState({ addPollOfcr: false });
						}}
					/>
					<br />
					<br />
					<ol>
						{this.state.pollOfficers.map((ofcr) => {
							const booths = keys(ofcr['associated-booths']).map((key) => {
								return { ...ofcr['associated-booths'][key], key };
							});
							return (
								<li key={ofcr.key} style={{ borderBottom: '1px solid #3f3f3f', marginBottom: 10 }}>
									<p>
										<span>{ofcr.email}</span> |{' '}
										<span className="ms-fontWeight-semibold">Booths: </span>
										{booths.map((item) => <span key={item.key}>{item.displayName}, </span>)}
									</p>
									<p>
										<CommandButton
											iconProps={{ iconName: 'Lock' }}
											onClick={() => {
												this.setState({
													passwordChangeUid: ofcr.key,
													passwordChangeName: ofcr.displayName
												});
											}}
										>
											Change Password
										</CommandButton>&nbsp;&nbsp;&nbsp;
										<CommandButton
											iconProps={{ iconName: 'ErrorBadge' }}
											onClick={() => {
												if (booths.length > 0) {
													alert('Please remove associated booth before removing this user');
													return;
												}
												this.setState({
													deleteUserUid: ofcr.key,
													deleteUserName: ofcr.displayName
												});
											}}
										>
											Delete User
										</CommandButton>
									</p>
								</li>
							);
						})}
					</ol>
					<br />
					<PrimaryButton
						iconProps={{ iconName: 'Add' }}
						onClick={() => {
							if (this.state.pollOfficers.length === 0) {
								alert('Please add at least one poll officer before adding a booth');
								return;
							}
							this.setState({ addBooth: !this.state.addBooth, addPollOfcr: false });
						}}
					>
						Add Booth
					</PrimaryButton>
					<br />
					<br />
					<ol>
						{this.state.booths.map((booth) => {
							return (
								<li key={booth.key} style={{ borderBottom: '1px solid #3f3f3f', marginBottom: 10 }}>
									<p>
										<span>{booth.email}</span> |{' '}
										<span className="ms-fontWeight-semibold">Polling Officer: </span>
										{booth['poll-officer'] ? booth['poll-officer'].displayName : ''}
									</p>
									<p>
										<CommandButton
											iconProps={{ iconName: 'Lock' }}
											onClick={() => {
												this.setState({
													passwordChangeUid: booth.key,
													passwordChangeName: booth.displayName
												});
											}}
										>
											Change Password
										</CommandButton>&nbsp;&nbsp;&nbsp;
										<CommandButton
											iconProps={{ iconName: 'ErrorBadge' }}
											onClick={() => {
												this.setState({
													deleteUserUid: booth.key,
													deleteUserName: booth.displayName
												});
											}}
										>
											Delete User
										</CommandButton>
									</p>
								</li>
							);
						})}
					</ol>
					<NewUserBooth
						pollOfcrs={this.state.pollOfficers}
						addBooth={this.state.addBooth}
						boothLoginCreated={() => {
							this.setState({ addBooth: false });
						}}
					/>
					<br />
					{this.state.passwordChangeName && this.state.passwordChangeUid ? (
						<ChangePassword
							uid={this.state.passwordChangeUid}
							name={this.state.passwordChangeName}
							passwordChanged={() => {
								this.setState({ passwordChangeUid: '', passwordChangeName: '' });
							}}
						/>
					) : (
						''
					)}
					{this.state.deleteUserUid ? (
						<DeleteUser
							uid={this.state.deleteUserUid}
							name={this.state.deleteUserName}
							userDeleted={() => {
								this.setState({ deleteUserUid: '', deleteUserName: '' });
							}}
						/>
					) : (
						''
					)}
				</div>
			</div>
		);
	}
}
