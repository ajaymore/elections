import React, { Component } from 'react';
import * as firebase from 'firebase';
import { Grid, Row, Col, Panel } from 'react-bootstrap';
import RadioGroup from '../components/RadioGroup';
import CheckboxGroup from '../components/CheckboxGroup';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { connect } from 'react-redux';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';

class VoterForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			voterForm: [],
			isReady: false,
			voter: null,
			formAvailable: false,
			electionName: '',
			confirmToggle: true,
			voteCapturedMessage: false,
			submitting: 0
		};
	}

	componentDidMount() {
		const { id } = this.props.match.params;
		this.rootElectionRef = firebase.database().ref('elections');
		this.rootElectionRef.child('election-list').child(id).once('value').then((snap) => {
			this.setState({ electionName: snap.val().name });
		});

		this.rootElectionRef.child(id).child('booths').child(this.props.auth.user.uid).on('value', (snap) => {
			if (snap.val()) {
				setTimeout(() => {
					this.setState({
						voterForm: snap.val().form || [],
						formAvailable: !!snap.val().form,
						voter: snap.val().voting || null,
						isReady: false,
						confirmToggle: true
					});
				}, 1000);
			} else {
				setTimeout(() => {
					this.setState({ formAvailable: false });
				}, 1000);
			}
		});
	}

	onValid = (postKey, isValid, selectedValues) => {
		const voterForm = this.state.voterForm.map((item) => {
			if (item.key === postKey) {
				return { ...item, isValid, selectedValues: isValid ? selectedValues : [] };
			} else {
				return item;
			}
		});
		let isReady = false;
		for (let i = 0; i < voterForm.length; i++) {
			if (voterForm[i].isValid) {
				isReady = true;
			} else {
				isReady = false;
				break;
			}
		}
		this.setState({ voterForm, isReady });
	};

	_submitForm = async () => {
		if (this.state.submitting >= 1) {
			return;
		}
		this.setState({ submitting: this.state.submitting + 1 });
		const votes = this.state.voterForm.map((vote) => {
			return { key: vote.key, name: vote.name, selectedValues: vote.selectedValues, postsCount: vote.postsCount };
		});
		const voter = this.state.voter;
		await this.rootElectionRef.child(this.props.match.params.id).child('votes').push(votes);
		this.setState({
			voteCapturedMessage: true,
			confirmToggle: true,
			formAvailable: false
		});
		this.rootElectionRef
			.child(this.props.match.params.id)
			.child('booths')
			.child(this.props.auth.user.uid)
			.child('form')
			.set(null);
		this.rootElectionRef
			.child(this.props.match.params.id)
			.child('booths')
			.child(this.props.auth.user.uid)
			.child('voting')
			.set(null);
		this.rootElectionRef
			.child(this.props.match.params.id)
			.child('booths')
			.child(this.props.auth.user.uid)
			.child('voted')
			.set(voter);
		this.rootElectionRef
			.child(this.props.match.params.id)
			.child('voters')
			.child(voter.key)
			.child('voted')
			.set(true);
		this.rootElectionRef
			.child(this.props.match.params.id)
			.child('voters')
			.child(voter.key)
			.child('isVoting')
			.set(null);
		setTimeout(() => {
			this.setState({ voteCapturedMessage: false, submitting: 0 });
		}, 5000);
	};

	render() {
		return (
			<Grid>
				<Row>
					<Col>
						<h2 className="ms-font-su">
							{this.state.electionName} ({this.props.auth.user.displayName})
						</h2>
						<br />
					</Col>
					{this.state.formAvailable ? (
						<Row>
							<Col>
								{this.state.voterForm.map((post) => {
									return (
										<Panel header={<h3>{post.name}</h3>} key={post.key}>
											{parseInt(post.postsCount, 10) === 1 ? (
												<RadioGroup
													onValid={this.onValid}
													candidates={post.candidates}
													postKey={post.key}
												/>
											) : (
												<CheckboxGroup
													onValid={this.onValid}
													candidates={post.candidates}
													countRequired={parseInt(post.postsCount, 10)}
													postKey={post.key}
												/>
											)}
										</Panel>
									);
								})}
							</Col>
							<Col>
								<PrimaryButton
									onClick={() => {
										this.setState({
											confirmToggle: false
										});
									}}
									disabled={!this.state.isReady}
									text="Submit your choices!"
								/>
								<br />
								<br />
								<br />
							</Col>
						</Row>
					) : this.state.voteCapturedMessage ? (
						<div>Thank you for voting! Your votes have been captured!</div>
					) : (
						<div>Fetching voter details...</div>
					)}
				</Row>
				<Dialog
					hidden={this.state.confirmToggle}
					dialogContentProps={{
						type: DialogType.normal,
						title: `Are you sure you want submit your choices?`
					}}
					modalProps={{
						isBlocking: true,
						containerClassName: 'ms-dialogMainOverride'
					}}
				>
					<DialogFooter>
						<PrimaryButton onClick={this._submitForm} text="Submit" />
						<DefaultButton
							onClick={() => {
								this.setState({
									confirmToggle: true
								});
							}}
							text="Cancel"
						/>
					</DialogFooter>
				</Dialog>
			</Grid>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	return {
		auth: state.auth
	};
};

export default connect(mapStateToProps)(VoterForm);
