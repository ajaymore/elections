import React, { Component } from 'react';
import * as firebase from 'firebase';
import { Grid, Row } from 'react-bootstrap';
import Permissions from './Permissions';
import AddPost from './AddPost';
import AddVoterField from './AddVoterField';

export default class Settings extends Component {
	constructor(props) {
		super(props);
		this.state = {
			newPost: '',
			newVoterField: '',
			newPostNum: 1,
			isSearchable: false
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
	componentWillUnmount() {
		this.rootElectionRef.child(this.props.electionId).child('election-settings').off();
	}
	render() {
		const { voterFields, electionId, posts, permissionSet } = this.props;
		return (
			<Grid>
				<Row>
					<AddVoterField
						voterFields={voterFields}
						electionId={electionId}
						posts={posts}
						permissionSet={permissionSet}
					/>
					<AddPost
						voterFields={voterFields}
						electionId={electionId}
						posts={posts}
						permissionSet={permissionSet}
					/>
				</Row>
				<br />
				<Row>
					<h3 className="ms-font-xxl">Permissions</h3>
					<Permissions
						posts={posts}
						voterFields={voterFields}
						electionId={electionId}
						permissionSet={permissionSet}
					/>
				</Row>
			</Grid>
		);
	}
}
