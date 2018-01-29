import React, { Component } from 'react';
import { Row, Well, Form, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import axios from 'axios';
import * as firebase from 'firebase';
const baseUrl = 'https://us-central1-apustudentelections.cloudfunctions.net/app/';

export default class Uploader extends Component {
	constructor(props) {
		super(props);
		this.state = {
			sheetId: '',
			updating: false
		};
	}

	componentDidMount() {
		this.rootElectionRef = firebase.database().ref('elections');
		this.rootElectionRef
			.child(this.props.electionId)
			.child('election-settings')
			.child('sheetId')
			.once('value')
			.then((snap) => {
				if (snap.val()) {
					this.setState({
						sheetId: snap.val()
					});
				}
			});
	}

	updateSheet = async (e) => {
		e.preventDefault();
		if (!this.state.sheetId) {
			alert('please provide sheetid');
			return;
		}
		this.rootElectionRef
			.child(this.props.electionId)
			.child('election-settings')
			.child('sheetId')
			.set(this.state.sheetId);
		this.setState({ updating: 'Uploading in progress!!' });
		const token = await firebase.auth().currentUser.getIdToken();
		axios({
			url: `${baseUrl}update-voter-list`,
			method: 'POST',
			data: { sheetId: this.state.sheetId, electionId: this.props.electionId },
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + token
			}
		})
			.then((res) => {
				this.setState({ updating: false });
				this.props.updateComplete();
			})
			.catch((err) => console.log(err));
	};
	render() {
		return (
			<Row>
				<br />
				<Well>
					Please create a google sheet and copy heading from below table, fill in the details, and copy the
					sheet id into box below.
				</Well>
				<Form inline>
					<FormGroup controlId="formInlineName">
						<ControlLabel>Sheet Id</ControlLabel>
						<FormControl
							type="text"
							value={this.state.sheetId}
							onChange={(e) => {
								this.setState({ sheetId: e.target.value });
							}}
							placeholder="Sheet Id"
							style={{ margin: '0 10px' }}
						/>
					</FormGroup>
					<DefaultButton type="submit" onClick={this.updateSheet}>
						Upload
					</DefaultButton>&nbsp;&nbsp;&nbsp;{this.state.updating ? <span>{this.state.updating}</span> : ''}
				</Form>
				<br />
			</Row>
		);
	}
}
